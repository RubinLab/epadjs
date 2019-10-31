import React, { Component } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import { isLite } from "../../config.json";
import { toast } from "react-toastify";
import { getTemplates } from "../../services/templateServices";
import {
  uploadAim,
  uploadSegmentation
} from "../../services/annotationServices";
import { getAimImageData } from "./aimHelper";
import * as questionaire from "./parseClass.js";
import Aim from "./Aim";
import { modalities } from "./modality";
import * as dcmjs from "dcmjs";

import "./aimEditor.css";
import { throws } from "assert";

const enumAimType = {
  imageAnnotation: 1,
  seriesAnnotation: 2,
  studyAnnotation: 3
};

class AimEditor extends Component {
  constructor(props) {
    super(props);
    this.cornerstone = this.props.cornerstone;
    this.csTools = this.props.csTools;
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
      if (this.props.aimId != null && Object.entries(this.props.aimId).length) {
        this.semanticAnswers.loadAimJson(this.props.aimId);
      }
    });
  }

  validateForm = hasError => {
    if (hasError) console.log("Answer form has error/s!!!");
  };

  getImage = () => {
    return this.props.cornerstone.getImage(
      this.props.cornerstone.getEnabledElements()[this.props.activePort][
        "element"
      ]
    );
  };

  render() {
    return (
      <div className="editorForm">
        <div id="questionaire" />
        <button type="button" onClick={this.save}>
          Save
        </button>
        <button type="button" onClick={this.cancel}>
          Cancel
        </button>
      </div>
    );
  }

  cancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  getAccession = () => {
    return this.image.data.string("x00080050") || "";
  };

  save = () => {
    // Logic behind relies on the order of the data in array
    const answers = this.semanticAnswers.saveAim();
    this.createAim(answers);
  };

  createAim = async answers => {
    let hasSegmentation = this.props.hasSegmentation;
    const updatedAimId = this.props.aimId;

    const {
      toolState
    } = this.props.csTools.globalImageIdSpecificToolStateManager;

    // get the imagesIds for active viewport
    const { element } = this.props.cornerstone.getEnabledElements()[
      this.props.activePort
    ];
    const stackToolState = this.props.csTools.getToolState(element, "stack");
    const imageIds = stackToolState.data[this.props.activePort].imageIds;

    // check which images has markup
    const markedImageIds = imageIds.filter(imageId => {
      if (toolState[imageId] === undefined) return false;
      return true;
    });

    // find the markups to save in markedImages
    const markupsToSave = this.getNewMarkups(markedImageIds, toolState);

    let seedData, segBlobGlobal, imageIdx;
    console.log("Markups to save", Object.entries(markupsToSave).length);
    if (Object.entries(markupsToSave).length !== 0) {
      const cornerStoneImageId = Object.keys(markupsToSave)[0];
      const image = this.getCornerstoneImagebyId(cornerStoneImageId);
      seedData = getAimImageData(image);
    } else if (hasSegmentation) {
      const labelMapIndex = this.getNumOfSegs();
      console.log("Seg count is", labelMapIndex);
      const { segBlob, imageIdx, segStats } = this.createSegmentation3D(
        labelMapIndex
      );
      console.log("ImageIdx is", imageIdx);
      const image = this.getCornerstoneImagebyIdx(imageIdx);
      seedData = getAimImageData(image);
      let dataset = await this.getDatasetFromBlob(segBlob, imageIdx);
      console.log("Dataset series uid", dataset);

      const segEntityData = this.getSegmentationEntityData(dataset, imageIdx);
      this.addSegmentationToAim(seedData, segEntityData, segStats);

      // set segmentation series description with the aim name
      dataset.SeriesDescription = answers.name.value;

      const modifiedSegBlob = dcmjs.data.datasetToBlob(dataset);
      segBlobGlobal = modifiedSegBlob;

      dataset = await this.getDatasetFromBlob(modifiedSegBlob, imageIdx);
      console.log("Dataset series uid after", dataset);
    }

    this.addSemanticAnswersToSeedData(seedData, answers);

    this.addUserToSeedData(seedData);
    // this.addModalityObjectToSeedData(seedData);
    console.log("Final SeedData is", seedData);

    var aim = new Aim(
      seedData,
      enumAimType.imageAnnotation,
      hasSegmentation,
      updatedAimId
    );

    Object.entries(markupsToSave).forEach(([key, values]) => {
      values.map(value => {
        const { type, markup, shapeIndex, imageReferenceUid } = value;
        switch (type) {
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
            this.addBidirectionalToAim(
              aim.markup,
              shapeIndex,
              imageReferenceUid
            );
        }
      });
    });

    const aimJson = aim.getAim();
    console.log("Here is the aim", JSON.parse(aimJson));

    uploadAim(JSON.parse(aimJson))
      .then(() => {
        this.saveSegmentation(segBlobGlobal);
        var objectUrl = URL.createObjectURL(segBlobGlobal);
        window.open(objectUrl);
        toast.success("Aim succesfully saved.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      })
      .catch(error => console.log(error));
  };

  getNumOfSegs = () => {
    const { imageAnnotations } = this.props.series[this.props.activePort];
    console.log("Get Num segs imageAnnotations", imageAnnotations);
    let segCount = 0;
    Object.values(imageAnnotations).map(imageAnnotation => {
      imageAnnotation.forEach(markup => {
        if (markup.markupType === "DicomSegmentationEntity") {
          segCount++;
          console.log("Markup", markup, segCount);
        }
      });
    });
    console.log("I'm returning segCount", segCount);
    return segCount;
  };

  getNewMarkups = (markedImageIds, toolState) => {
    // check for markups
    var shapeIndex = 1;
    var markupsToSave = {};
    const updatedAimId = this.props.aimId;
    markedImageIds.map(imageId => {
      const imageReferenceUid = this.parseImgeId(imageId);
      const markUps = toolState[imageId];
      Object.keys(markUps).map(tool => {
        switch (tool) {
          case "FreehandMouse":
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
                shapeIndex++;
              }
            });
            break;
          case "CircleRoi":
            const circles = markUps[tool].data;
            circles.map(circle => {
              if (!circle.aimId || circle.aimId === updatedAimId) {
                //dont save the same markup to different aims
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
          // case "brush":
          //   const brush = markUps[tool].data;
          //   hasSegmentation = true;
          // // TODO: check if it's a new brush data
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

  addSegmentationEntityToSeedData = (seedData, segEntityData) => {
    console.log("Seed data and seg Entity", seedData, segEntityData);
    seedData["segmentation"] = segEntityData;
    console.log("After Seed Data is", seedData);
  };

  // get the image object by index
  getCornerstoneImagebyIdx = imageIdx => {
    const imageCache = this.props.cornerstone.default.imageCache.imageCache;
    const imageId = Object.keys(imageCache)[imageIdx];
    return imageCache[imageId].image;
  };

  getCornerstoneImagebyId = imageId => {
    return this.props.cornerstone.default.imageCache.imageCache[imageId].image;
  };

  storeMarkupsToBeSaved = (imageId, markupData, markupsToSave) => {
    if (!markupsToSave[imageId]) markupsToSave[imageId] = [];
    markupsToSave[imageId].push(markupData);
  };

  addSegmentationToAim = (seedData, segEntityData, segStats) => {
    this.addSegmentationEntityToSeedData(seedData, segEntityData);

    const {} = segEntityData;
    const { volume, min, max, mean, stdDev } = segStats;

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

  addLineToAim = (aim, line, shapeIndex, imageReferenceUid) => {
    const { start, end } = line.handles;
    const markupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex,
      [start, end],
      imageReferenceUid
    );

    const lengthId = aim.createLengthCalcEntity({
      length: line.length,
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
  ) => {};

  createSegmentation3D = labelmapIndex => {
    // following is to know the image index which has the first segment
    let firstSegImageIndex;

    const { element } = this.cornerstone.getEnabledElements()[
      this.props.activePort
    ];

    const globalToolStateManager = this.csTools
      .globalImageIdSpecificToolStateManager;
    const toolState = globalToolStateManager.saveToolState();
    const stackToolState = this.csTools.getToolState(element, "stack");
    const imageIds = stackToolState.data[0].imageIds;
    let imagePromises = [];
    for (let i = 0; i < imageIds.length; i++) {
      if (i == 1)
        this.cornerstone
          .loadImage(imageIds[i])
          .then(image => console.log("Yuklenen image", image));
      imagePromises.push(this.cornerstone.loadImage(imageIds[i]));
    }

    const { getters, getLabelmapStats } = this.csTools.getModule(
      "segmentation"
    );
    console.log("Seg module", this.csTools.getModule("segmentation"));
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

    const segStats = {};
    getters
      .labelmapStats(element, 1, labelmapIndex)
      .then(stats => (segStats = stats));

    const cachedImages = this.cornerstone.imageCache.imageCache;
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
    const { projectID } = this.props.series[this.props.activePort];
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
    if (isLite) return imageId.split("/").pop();
    else return imageId.split("objectUID=")[1].split("&")[0];
  };
}

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};

export default connect(mapStateToProps)(AimEditor);
