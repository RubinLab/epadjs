import React, { Component } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { getTemplates } from "../../services/templateServices";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import {
  uploadAim,
  uploadSegmentation
} from "../../services/annotationServices";
import {
  updateSingleSerie,
  updatePatientOnAimSave,
  getSingleSerie
} from "../annotationsList/action";
import { getAimImageData } from "./aimHelper";
import * as questionaire from "./parseClass.js";
import Aim from "./Aim";
import { modalities } from "./modality";
import * as dcmjs from "dcmjs";

import "./aimEditor.css";
import { throws } from "assert";
import getNumOfSegs from "../../Utils/Segmentation/getNumOfSegments";
const mode = sessionStorage.getItem("mode");

const enumAimType = {
  imageAnnotation: 1,
  seriesAnnotation: 2,
  studyAnnotation: 3
};

class AimEditor extends Component {
  constructor(props) {
    super(props);
    this.image = this.getImage();
    this.semanticAnswers = {};
  }

  componentDidMount() {
    const element = document.getElementById("questionaire");
    // const { data: templates } = await getTemplates();
    const templatePromise = new Promise(resolve => {
      resolve(getTemplates());
    });
    templatePromise.then(result => {
      this.semanticAnswers = new questionaire.AimEditor(
        element,
        this.validateForm
      );
      this.semanticAnswers.loadTemplates(result.data);
      this.semanticAnswers.createViewerWindow();
      const { aimId } = this.props;
      if (aimId != null && Object.entries(aimId).length) {
        this.semanticAnswers.loadAimJson(aimId);
      }
    });
  }

  validateForm = hasError => {
    if (hasError) console.log("Answer form has error/s!!!");
  };

  getImage = () => {
    const { activePort } = this.props;
    if (cornerstone.getEnabledElements().length)
      return cornerstone.getImage(
        cornerstone.getEnabledElements()[activePort]["element"]
      );
    return "";
  };

  render() {
    return (
      <div className="editorForm">
        <div id="questionaire" />
        <button type="button" onClick={this.save}>
          Save
        </button>
        <button type="button" onClick={() => this.props.onCancel(true)}>
          Cancel
        </button>
      </div>
    );
  }

  getAccession = () => {
    return this.image.data.string("x00080050") || "";
  };

  save = () => {
    // Logic behind relies on the order of the data in array
    const answers = this.semanticAnswers.saveAim();
    if (this.props.updatedAimId) this.updateAim(answers);
    else this.createAim(answers);
  };

  createAim = async answers => {
    const { hasSegmentation } = this.props;
    const markupsToSave = this.getNewMarkups();

    if (hasSegmentation) {
      // segmentation and markups
      this.createAimSegmentation(answers).then(({ aim, segmentationBlob }) => {
        // also add the markups to aim if there is any
        if (Object.entries(markupsToSave).length !== 0)
          this.createAimMarkups(aim, markupsToSave);
        console.log("AYIMMM", aim);
        this.saveAim(aim, segmentationBlob);
      });
    } else if (Object.entries(markupsToSave).length !== 0) {
      // markups without segmentation
      const seedData = this.getAimSeedDataFromMarkup(markupsToSave, answers);
      const aim = new Aim(seedData, enumAimType.imageAnnotation);
      this.createAimMarkups(aim, markupsToSave);
      this.saveAim(aim);
    } else {
      //Non markup image annotation
      const { activePort } = this.props;
      const { element } = cornerstone.getEnabledElements()[activePort];
      const image = cornerstone.getImage(element);
      const seedData = this.getAimSeedDataFromCurrentImage(image, answers);

      const aim = new Aim(seedData, enumAimType.imageAnnotation);
      this.saveAim(aim);
    }
  };

  createAimSegmentation = async answers => {
    const { activePort, openSeries } = this.props;
    const { imageAnnotations } = openSeries[activePort];
    const labelMapIndex = getNumOfSegs(imageAnnotations);
    // console.log("Seg count is", labelMapIndex);
    const { segBlob, imageIdx, segStats } = this.createSegmentation3D(
      labelMapIndex
    );

    // praper the seed data and create aim
    const image = this.getCornerstoneImagebyIdx(imageIdx);
    const seedData = getAimImageData(image);
    this.addSemanticAnswersToSeedData(seedData, answers);
    this.addUserToSeedData(seedData);
    const aim = new Aim(seedData, enumAimType.imageAnnotation);

    let dataset = await this.getDatasetFromBlob(segBlob, imageIdx);
    // set segmentation series description with the aim name
    dataset.SeriesDescription = answers.name.value;
    console.log("Dataset series uid after", dataset);

    // if update segmentation Uid should be same as the previous one
    console.log("Dataset series uid", dataset);

    // fill the segmentation related aim parts
    const segEntityData = this.getSegmentationEntityData(dataset, imageIdx);
    this.addSegmentationToAim(aim, segEntityData, segStats);

    // create the modified blob
    const segmentationBlob = dcmjs.data.datasetToBlob(dataset);

    console.log("AIM in segmentation", aim);
    return { aim, segmentationBlob };
  };

  createAimMarkups = (aim, markupsToSave) => {
    Object.entries(markupsToSave).forEach(([key, values]) => {
      values.map(value => {
        const { type, markup, shapeIndex, imageReferenceUid } = value;
        switch (type) {
          case "point":
            alert("Point");
            this.addPointToAim(aim, markup, shapeIndex, imageReferenceUid);
            break;
          case "line":
            this.addLineToAim(aim, markup, shapeIndex, imageReferenceUid);
            break;
          case "circle":
            this.addCircleToAim(aim, markup, shapeIndex, imageReferenceUid);
            break;
          case "polygon":
            this.addPolygonToAim(aim, markup, shapeIndex, imageReferenceUid);
            break;
          case "bidirectional":
            console.log("BD", markup);
            this.addBidirectionalToAim(
              aim,
              markup,
              shapeIndex,
              imageReferenceUid
            );
        }
      });
    });
  };

  // returns the imageIds that has markup
  getMarkedImageIds = () => {
    const { activePort } = this.props;

    const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();

    // get the imagesIds for active viewport
    const { element } = cornerstone.getEnabledElements()[activePort];
    const stackToolState = cornerstoneTools.getToolState(element, "stack");
    const imageIds = stackToolState.data[0].imageIds;

    // check which images has markup
    const markedImageIds = imageIds.filter(imageId => {
      if (toolState[imageId] === undefined) return false;
      return true;
    });

    return markedImageIds;
  };

  getAimSeedDataFromMarkup = (markupsToSave, answers) => {
    const cornerStoneImageId = Object.keys(markupsToSave)[0];
    const image = this.getCornerstoneImagebyId(cornerStoneImageId);
    const seedData = getAimImageData(image);
    this.addSemanticAnswersToSeedData(seedData, answers);
    this.addUserToSeedData(seedData);
    return seedData;
  };

  getAimSeedDataFromCurrentImage = (image, answers) => {
    const seedData = getAimImageData(image);
    this.addSemanticAnswersToSeedData(seedData, answers);
    this.addUserToSeedData(seedData);
    return seedData;
  };

  saveAim = (aim, segmentationBlob) => {
    console.log("Cs tools", cornerstoneTools);
    console.log("Aim in SAVE", aim);
    const aimJson = aim.getAim();
    const aimSaved = JSON.parse(aimJson);
    const aimID = aimSaved.ImageAnnotationCollection.uniqueIdentifier.root;
    const { openSeries, activePort } = this.props;
    const { patientID, projectID, seriesUID, studyUID } = openSeries[
      activePort
    ];
    const name =
      aimSaved.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
        .name.value;
    const comment =
      aimSaved.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
        .comment.value;
    const aimRefs = {
      aimID,
      patientID,
      projectID,
      seriesUID,
      studyUID,
      name,
      comment
    };

    uploadAim(aimSaved)
      .then(() => {
        if (segmentationBlob) this.saveSegmentation(segmentationBlob);
        // var objectUrl = URL.createObjectURL(segBlobGlobal);
        // window.open(objectUrl);

        toast.success("Aim succesfully saved.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        this.props.dispatch(
          getSingleSerie({ patientID, projectID, seriesUID, studyUID })
        );
        this.props.dispatch(
          updateSingleSerie({
            subjectID: patientID,
            projectID,
            seriesUID,
            studyUID
          })
        );

        this.props.dispatch(updatePatientOnAimSave(aimRefs));
      })
      .catch(error => console.log(error));
    this.props.onCancel(false);
  };

  getNewMarkups = () => {
    const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    const markedImageIds = this.getMarkedImageIds();
    // check for markups
    var shapeIndex = 1;
    var markupsToSave = {};
    const updatedAimId = this.props.aimId;
    markedImageIds.map(imageId => {
      const imageReferenceUid = this.parseImgeId(imageId);
      const markUps = toolState[imageId];
      Object.keys(markUps).map(tool => {
        switch (tool) {
          case "FreehandRoi3DTool":
            const polygons = markUps[tool].data;
            polygons.map(polygon => {
              if (!polygon.aimId || polygon.aimId === updatedAimId) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  imageId,
                  {
                    type: "polygon",
                    markup: polygon,
                    shapeIndex,
                    imageReferenceUid
                  },
                  markupsToSave
                );
                shapeIndex++;
              }
            });
            break;
          case "Bidirectional":
            const bidirectionals = markUps[tool].data;
            bidirectionals.map(bidirectional => {
              if (
                !bidirectional.aimId ||
                bidirectional.aimId === updatedAimId
              ) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  imageId,
                  {
                    type: "bidirectional",
                    markup: bidirectional,
                    shapeIndex,
                    imageReferenceUid
                  },
                  markupsToSave
                );
                shapeIndex = shapeIndex + 2; //because bidirectional consists of two lines inc the shapeindex by two
              }
            });
            break;
          case "CircleRoi":
            const circles = markUps[tool].data;
            circles.map(circle => {
              if (!circle.aimId || circle.aimId === updatedAimId) {
                //dont save the same markup to different aims
                const enElem = cornerstone.getEnabledElements()[0].element;

                cornerstoneTools.removeToolState(enElem, "CircleRoi", circle);

                this.storeMarkupsToBeSaved(
                  imageId,
                  {
                    type: "circle",
                    markup: circle,
                    shapeIndex,
                    imageReferenceUid
                  },
                  markupsToSave
                );
                // this.addCircleToAim(aim, circle, shapeIndex, imageReferenceUid);
                shapeIndex++;
              }
            });
            break;
          case "Length":
            const lines = markUps[tool].data;
            lines.map(line => {
              if (!line.aimId || line.aimId === updatedAimId) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  imageId,
                  {
                    type: "line",
                    markup: line,
                    shapeIndex,
                    imageReferenceUid
                  },
                  markupsToSave
                );
                // this.addLineToAim(aim, line, shapeIndex);
                shapeIndex++;
              }
            });
            break;
          case "Probe":
            const points = markUps[tool].data;
            points.map(point => {
              if (!point.aimId || point.aimId === updatedAimId) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  imageId,
                  {
                    type: "point",
                    markup: point,
                    shapeIndex,
                    imageReferenceUid
                  },
                  markupsToSave
                );
                // this.addLineToAim(aim, line, shapeIndex);
                shapeIndex++;
              }
            });
            break;
        }
      });
    });
    return markupsToSave;
  };

  addModalityObjectToSeedData = seedData => {
    const modality = modalities[seedData.series.modality];
    seedData.series.modality = { ...modality };
  };

  addSemanticAnswersToSeedData = (seedData, answers) => {
    const {
      name,
      comment,
      imagingPhysicalEntityCollection,
      imagingObservationEntityCollection,
      inferenceEntity,
      typeCode
    } = answers;
    seedData.aim.name = name;
    if (comment) seedData.aim.comment = comment;
    if (imagingPhysicalEntityCollection)
      seedData.aim.imagingPhysicalEntityCollection = imagingPhysicalEntityCollection;
    if (imagingObservationEntityCollection)
      seedData.aim.imagingObservationEntityCollection = imagingObservationEntityCollection;
    if (inferenceEntity) seedData.aim.inferenceEntity = inferenceEntity;
    if (typeCode) seedData.aim.typeCode = typeCode;
  };

  addUserToSeedData = seedData => {
    let obj = {};
    obj.loginName = sessionStorage.getItem("username");
    obj.name = sessionStorage.getItem("displayName");
    seedData.user = obj;
  };

  // get the image object by index
  getCornerstoneImagebyIdx = imageIdx => {
    const { imageCache } = cornerstone.imageCache;
    const imageId = Object.keys(imageCache)[imageIdx];
    return imageCache[imageId].image;
  };

  getCornerstoneImagebyId = imageId => {
    return cornerstone.imageCache.imageCache[imageId].image;
  };

  storeMarkupsToBeSaved = (imageId, markupData, markupsToSave) => {
    if (!markupsToSave[imageId]) markupsToSave[imageId] = [];
    markupsToSave[imageId].push(markupData);
  };

  addSegmentationToAim = (aim, segEntityData, segStats) => {
    console.log("Seg stats are", segStats);
    const segId = aim.createSegmentationEntity(segEntityData);

    const { volume, min, max, mean, stdDev } = segStats;

    if (mean) {
      const meanId = aim.createMeanCalcEntity({ mean, unit: "[hnsf'U]" });
      aim.createImageAnnotationStatement(2, segId, meanId);
    }

    if (stdDev) {
      const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit: "[hnsf'U]" });
      aim.createImageAnnotationStatement(2, segId, stdDevId);
    }

    if (min) {
      const minId = aim.createMinCalcEntity({ min, unit: "[hnsf'U]" });
      aim.createImageAnnotationStatement(2, segId, minId);
    }

    if (max) {
      const maxId = aim.createMaxCalcEntity({ max, unit: "[hnsf'U]" });
      aim.createImageAnnotationStatement(2, segId, maxId);
    }

    if (volume) {
      const volumeId = aim.createMaxCalcEntity({ volume, unit: "mm3" });
      aim.createImageAnnotationStatement(2, segId, volumeId);
    }
  };

  addPolygonToAim = (aim, polygon, shapeIndex, imageReferenceUid) => {
    const { points } = polygon.handles;
    const markupId = aim.addMarkupEntity(
      "TwoDimensionPolyline",
      shapeIndex,
      points,
      imageReferenceUid
    );
    const { mean, stdDev, min, max } = polygon.meanStdDev;

    const meanId = aim.createMeanCalcEntity({ mean, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, meanId);

    const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, stdDevId);

    const minId = aim.createMinCalcEntity({ min, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, minId);

    const maxId = aim.createMaxCalcEntity({ max, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, maxId);
  };

  addPointToAim = (aim, point, shapeIndex, imageReferenceUid) => {
    const { end } = point.handles;
    aim.addMarkupEntity(
      "TwoDimensionPoint",
      shapeIndex,
      [end],
      imageReferenceUid
    );
  };

  addLineToAim = (aim, line, shapeIndex, imageReferenceUid) => {
    const { start, end } = line.handles;
    const markupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex,
      [start, end],
      imageReferenceUid
    );

    const lengthId = aim.createLengthCalcEntity({
      value: line.length,
      unit: "mm"
    });
    aim.createImageAnnotationStatement(1, markupId, lengthId);
  };

  addCircleToAim = (aim, circle, shapeIndex, imageReferenceUid) => {
    const { start, end } = circle.handles;
    const markupId = aim.addMarkupEntity(
      "TwoDimensionCircle",
      shapeIndex,
      [start, end],
      imageReferenceUid
    );
    const { mean, stdDev, min, max } = circle.cachedStats;

    const meanId = aim.createMeanCalcEntity({ mean, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, meanId);

    const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, stdDevId);

    const minId = aim.createMinCalcEntity({ min, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, minId);

    const maxId = aim.createMaxCalcEntity({ max, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, maxId);

    // aim.add;
  };

  addBidirectionalToAim = (
    aim,
    bidirectional,
    shapeIndex,
    imageReferenceUid
  ) => {
    const { longAxis, shortAxis } = this.getAxisOfBidirectional(bidirectional);

    // add longAxis
    const longAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex,
      [longAxis.start, longAxis.end],
      imageReferenceUid
    );
    const longAxisLengthId = aim.createLongAxisCalcEntity({
      value: longAxis.length,
      unit: "mm"
    });
    aim.createImageAnnotationStatement(1, longAxisMarkupId, longAxisLengthId);

    // add shortAxis
    const shortAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex + 1,
      [shortAxis.start, shortAxis.end],
      imageReferenceUid
    );
    const shortAxisLengthId = aim.createShortAxisCalcEntity({
      value: shortAxis.length,
      unit: "mm"
    });
    aim.createImageAnnotationStatement(1, shortAxisMarkupId, shortAxisLengthId);
  };

  getAxisOfBidirectional = bidirectional => {
    // takes two lines of b.directional and distincs the short and long axis
    const { element } = cornerstone.getEnabledElements()[this.props.activePort];
    const { rowPixelSpacing, columnPixelSpacing } = cornerstone.getViewport(
      element
    ).displayedArea;
    const {
      start,
      end,
      perpendicularStart,
      perpendicularEnd
    } = bidirectional.handles;
    const length = Math.hypot(
      (start.x - end.x) * (columnPixelSpacing || 1),
      (start.y - end.y) * (rowPixelSpacing || 1)
    );
    const perpendicularLength = Math.hypot(
      (perpendicularStart.x - perpendicularEnd.x) * (columnPixelSpacing || 1),
      (perpendicularStart.y - perpendicularEnd.y) * (rowPixelSpacing || 1)
    );
    if (length > perpendicularLength)
      return {
        longAxis: { start, end, length },
        shortAxis: {
          start: perpendicularStart,
          end: perpendicularEnd,
          length: perpendicularLength
        }
      };
    else
      return {
        longAxis: {
          start: perpendicularStart,
          end: perpendicularEnd,
          length: perpendicularLength
        },
        shortAxis: { start, end, length }
      };
  };

  createSegmentation3D = labelmapIndex => {
    // following is to know the image index which has the first segment
    let firstSegImageIndex;

    const { element } = cornerstone.getEnabledElements()[this.props.activePort];

    const globalToolStateManager =
      cornerstoneTools.globalImageIdSpecificToolStateManager;
    const toolState = globalToolStateManager.saveToolState();
    const stackToolState = cornerstoneTools.getToolState(element, "stack");
    const imageIds = stackToolState.data[0].imageIds;
    let imagePromises = [];
    for (let i = 0; i < imageIds.length; i++) {
      if (i == 1)
        cornerstone
          .loadImage(imageIds[i])
          .then(image => console.log("Yuklenen image", image));
      imagePromises.push(cornerstone.loadImage(imageIds[i]));
    }

    const { getters, getLabelmapStats } = cornerstoneTools.getModule(
      "segmentation"
    );
    console.log("Seg module", cornerstoneTools.getModule("segmentation"));
    const { labelmaps3D } = getters.labelmaps3D(element);
    console.log("Label maps3D", labelmaps3D);
    if (!labelmaps3D) {
      return;
    }

    // for (
    //   let labelmapIndex = 0;
    //   labelmapIndex < labelmaps3D.length;
    //   labelmapIndex++
    // ) {
    const labelmap3D = labelmaps3D[labelmapIndex];
    const labelmaps2D = labelmap3D.labelmaps2D;

    for (let i = 0; i < labelmaps2D.length; i++) {
      if (!labelmaps2D[i]) {
        continue;
      }

      // Following is to store the image index in Aim that has the first segment
      if (!firstSegImageIndex) firstSegImageIndex = i;

      const segmentsOnLabelmap = labelmaps2D[i].segmentsOnLabelmap;
      segmentsOnLabelmap.forEach(segmentIndex => {
        if (segmentIndex !== 0 && !labelmap3D.metadata[segmentIndex]) {
          labelmap3D.metadata[segmentIndex] = this.generateMockMetadata(
            segmentIndex
          );
        }
      });
    }
    // }
    // For now we support single segments

    let segStats = {};
    getters.labelmapStats(element, 1, labelmapIndex).then(stats => {
      Object.assign(segStats, stats);
    });

    const cachedImages = cornerstone.imageCache.imageCache;
    let images = [];
    Object.keys(cachedImages).forEach(key => {
      images.push(cachedImages[key].image);
    });
    // console.log("ImageCache", images);

    // Promise.all(imagePromises).then(images => {
    //   console.log("Images", images);

    // this.cornerstone.imageCache;
    const segBlob = dcmjs.adapters.Cornerstone.Segmentation.generateSegmentation(
      images,
      labelmap3D,
      { rleEncode: false }
    );

    return {
      segBlob,
      imageIdx: firstSegImageIndex,
      segStats
    };
    // });

    // .catch(err => console.log(err));
  };

  getDatasetFromBlob = (segBlob, imageIdx) => {
    return new Promise(resolve => {
      let segArrayBuffer;
      var fileReader = new FileReader();
      fileReader.onload = event => {
        segArrayBuffer = event.target.result;
        const dicomData = dcmjs.data.DicomMessage.readFile(segArrayBuffer);
        const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
          dicomData.dict
        );
        dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(
          dicomData.meta
        );
        resolve(dataset);
      };
      fileReader.readAsArrayBuffer(segBlob);
    });
  };

  getSegmentationEntityData = (dataset, imageIdx) => {
    let obj = {};
    obj["referencedSopInstanceUid"] =
      dataset.ReferencedSeriesSequence.ReferencedInstanceSequence[
        imageIdx
      ].ReferencedSOPInstanceUID;
    obj["seriesInstanceUid"] = dataset.SeriesInstanceUID;
    obj["studyInstanceUid"] = dataset.StudyInstanceUID;
    obj["sopClassUid"] = dataset.SOPClassUID;
    obj["sopInstanceUid"] = dataset.SOPInstanceUID;
    return obj;
  };

  saveSegmentation = segmentation => {
    const { openSeries, activePort } = this.props;
    const { projectID } = openSeries[activePort];
    uploadSegmentation(segmentation, projectID)
      .then(() => {
        // this.props.onCancel();
        toast.success("Segmentation succesfully saved.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        return "success";
      })
      .catch(error => {
        console.log(error);
        return "error";
      });
  };

  generateMockMetadata = segmentIndex => {
    // TODO -> Use colors from the cornerstoneTools LUT.
    const RecommendedDisplayCIELabValue = dcmjs.data.Colors.rgb2DICOMLAB([
      1,
      0,
      0
    ]);
    return {
      SegmentedPropertyCategoryCodeSequence: {
        CodeValue: "T-D0050",
        CodingSchemeDesignator: "SRT",
        CodeMeaning: "Tissue"
      },
      SegmentNumber: segmentIndex.toString(),
      SegmentLabel: "Tissue " + segmentIndex.toString(),
      SegmentAlgorithmType: "SEMIAUTOMATIC",
      SegmentAlgorithmName: "ePAD",
      RecommendedDisplayCIELabValue,
      SegmentedPropertyTypeCodeSequence: {
        CodeValue: "T-D0050",
        CodingSchemeDesignator: "SRT",
        CodeMeaning: "Tissue"
      }
    };
  };

  parseImgeId = imageId => {
    if (mode == "lite") return imageId.split("/").pop();
    else return imageId.split("objectUID=")[1].split("&")[0];
  };
}

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};

export default connect(mapStateToProps)(AimEditor);
