import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { getTemplates } from "../../services/templateServices";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import {
  uploadAim,
  uploadSegmentation,
} from "../../services/annotationServices";
import {
  updateSingleSerie,
  updatePatientOnAimSave,
  getSingleSerie,
} from "../annotationsList/action";
import { Aim, getAimImageData, modalities } from "aimapi";
import * as questionaire from "./parseClass.js";
import * as dcmjs from "dcmjs";
import Switch from "react-switch";
import "./aimEditor.css";

const enumAimType = {
  imageAnnotation: 1,
  seriesAnnotation: 2,
  studyAnnotation: 3,
};

class AimEditor extends Component {
  constructor(props) {
    super(props);
    this.image = this.getImage();
    this.semanticAnswers = {};
    this.state = {
      buttonGroupShow: false,
      saveButtonIsActive: false,
      isUpdate: false,
      autoFill: false,
    };
    //if aim is being updated set the aimId and isUpdate flag
    if (this.props.aimId) {
      this.updatedAimId = this.props.aimId.aimId;
      this.state.isUpdate = true;
    }
  }

  componentDidMount() {
    const element = document.getElementById("questionaire");
    console.log("Props from aim editor", this.props);

    let {
      templates: allTemplates,
      openSeries,
      activePort,
      setAimDirty,
    } = this.props;
    const { projectID } = openSeries[activePort];

    this.semanticAnswers = new questionaire.AimEditor(
      element,
      this.validateForm,
      this.renderButtons,
      this.getDefaultLesionName(),
      setAimDirty
    );

    const { projectMap } = this.props;

    const { defaultTemplate, templates } = projectMap[projectID];
    const projectTemplates = Object.keys(allTemplates)
      .filter((key) => templates.includes(key))
      .reduce((arr, key) => {
        arr.push(allTemplates[key]);
        return arr;
      }, []);

    this.semanticAnswers.loadTemplates({
      default: defaultTemplate,
      all: projectTemplates,
    });
    this.semanticAnswers.createViewerWindow();
    const { aimId } = this.props;
    console.log("Aim id in cdm", aimId);
    if (aimId != null && Object.entries(aimId).length) {
      try {
        this.semanticAnswers.loadAimJson(aimId);
      } catch (error) {
        console.error("Error loading aim to aim editor:", error);
      }
    }
    window.addEventListener("checkShapes", this.checkShapes);
  }

  componentWillUnmount() {
    window.removeEventListener("checkShapes", this.checkShapes);
  }

  loadAim = (event) => {
    console.log("event", event);
    const { aimID } = event.detail;
    try {
      this.semanticAnswers.loadAimJson(aimID);
    } catch (error) {
      console.error("Error loading aim to aim editor:", error);
    }
  };

  checkShapes = (event) => {
    const shapes = event.detail;
    this.semanticAnswers.checkShapes(shapes);
  };
  // returns the next default lesion name according to the # of lesions in the series
  getDefaultLesionName = () => {
    const { openSeries, activePort } = this.props;
    const { imageAnnotations } = openSeries[activePort];
    let totalNumShapes = 1;
    if (imageAnnotations) {
      Object.values(imageAnnotations).map((shapesOnImage) => {
        totalNumShapes += shapesOnImage.length;
      });
    }
    return `Lesion${totalNumShapes}`;
  };

  //cavit
  renderButtons = (buttonsState) => {
    this.setState({ buttonGroupShow: buttonsState });
  };
  //cavit end
  validateForm = (hasError) => {
    if (hasError > 0) {
      console.error("Answer form has error/s!!!");
      this.setState({
        saveButtonIsActive: false,
      });
    } else {
      this.setState({
        saveButtonIsActive: true,
      });
    }
  };

  getImage = () => {
    const { activePort } = this.props;
    if (cornerstone.getEnabledElements().length)
      return cornerstone.getImage(
        cornerstone.getEnabledElements()[activePort]["element"]
      );
    return "";
  };

  setAutoFill = (checked) => {
    this.setState({ autoFill: checked });
  };

  render() {
    return (
      <div className="editorForm">
        AutoFill :
        <Switch
          onChange={this.setAutoFill}
          checked={this.state.autoFill}
          onColor="#86d3ff"
          onHandleColor="#2693e6"
          handleDiameter={10}
          uncheckedIcon={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: 11,
                color: "#861737",
                paddingRight: 2,
              }}
            >
              Off
            </div>
          }
          checkedIcon={
            <svg viewBox="0 0 10 10" height="100%" width="100%">
              <circle r={3} cx={5} cy={5} />
            </svg>
          }
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          // height={15}
          // width={20}
          className="react-switch"
        />
        <br />
        <div id="questionaire" />
        {this.state.buttonGroupShow && (
          <div className="AimEditorButtonGroup">
            <button
              className="btn btn-sm btn-outline-light AimEditorButton"
              onClick={this.save}
            >
              Save
            </button>
            &nbsp;
            <button
              className="btn btn-sm btn-outline-light AimEditorButton"
              onClick={() => this.props.onCancel(true)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  getAccession = () => {
    return this.image.data.string("x00080050") || "";
  };

  save = () => {
    if (!this.checkAimTemplate()) return;
    if (!this.state.saveButtonIsActive) {
      window.alert(
        "Please fill required answers or use required geometric shape"
      );
      return;
    }
    const answers = this.semanticAnswers.saveAim();
    try {
      this.createAim(answers);
    } catch (error) {
      console.warn("Error:", error);
      window.alert("Error saving Aim: ", error);
    }
  };

  checkAimTemplate = () => {
    if (this.semanticAnswers.templateSelectedIndex === -1) {
      alert("Please select an Aim template!");
      return false;
    }
    return true;
  };

  checkSegmentationFrames = () => {
    // check if it has multiple frames
    const element = this.getActiveElement();
    const labelmapIndex = this.getActiveLabelMapIndex();
    const { getters } = cornerstoneTools.getModule("segmentation");
    const { labelmaps3D } = getters.labelmaps3D(element);
    if (!labelmaps3D) {
      return 0;
    }
    const labelmap3D = labelmaps3D[labelmapIndex];
    const labelmaps2D = labelmap3D.labelmaps2D;
    if (Object.values(labelmaps2D).length < 2) {
      alert(
        "This version of ePAD lite currently doesn't support single slice segmentations. Please make sure you have multiple slice of segmentations! "
      );
      return false;
    }
    return true;
  };

  createAim = async (answers) => {
    const { hasSegmentation } = this.props;
    const markupsToSave = this.getNewMarkups();
    // try {
    if (hasSegmentation) {
      // if (!this.checkSegmentationFrames()) return;
      // segmentation and markups
      this.createAimSegmentation(answers).then(
        ({ aim, segmentationBlob, segId }) => {
          // also add the markups to aim if there is any
          if (Object.entries(markupsToSave).length !== 0)
            this.createAimMarkups(aim, markupsToSave);
          this.saveAim(aim, segmentationBlob, segId);
        }
      );
    } else if (Object.entries(markupsToSave).length !== 0) {
      // markups without segmentation
      const seedData = this.getAimSeedDataFromMarkup(markupsToSave, answers);
      const aim = new Aim(
        seedData,
        enumAimType.imageAnnotation,
        this.updatedAimId
      );
      this.createAimMarkups(aim, markupsToSave);
      this.saveAim(aim);
    } else {
      //Non markup image annotation
      const { activePort } = this.props;
      const { element } = cornerstone.getEnabledElements()[activePort];
      const image = cornerstone.getImage(element);
      const seedData = this.getAimSeedDataFromCurrentImage(image, answers);

      const aim = new Aim(
        seedData,
        enumAimType.imageAnnotation,
        this.updatedAimId
      );
      this.saveAim(aim);
    }
    // } catch (error) {
    //   throw new Error("Error creating aim", error);
    // }
  };

  getActiveElement = () => {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort] || {};
    return element;
  };

  getActiveLabelMapIndex = () => {
    const { getters } = cornerstoneTools.getModule("segmentation");
    const element = this.getActiveElement();
    return getters.activeLabelmapIndex(element);
  };

  createAimSegmentation = async (answers) => {
    try {
      const activeLabelMapIndex = this.getActiveLabelMapIndex();

      const {
        segBlob,
        segStats,
        imageIdx,
        image,
      } = await this.createSegmentation3D(activeLabelMapIndex);

      // praper the seed data and create aim
      const seedData = getAimImageData(image);
      this.addSemanticAnswersToSeedData(seedData, answers);
      this.addUserToSeedData(seedData);
      const aim = new Aim(
        seedData,
        enumAimType.imageAnnotation,
        this.updatedAimId
      );

      let dataset = await this.getDatasetFromBlob(segBlob);
      // set segmentation series description with the aim name
      dataset.SeriesDescription = answers.name.value;

      // if update segmentation Uid should be same as the previous one

      // fill the segmentation related aim parts
      const segEntityData = this.getSegmentationEntityData(dataset, imageIdx);
      const segId = this.addSegmentationToAim(aim, segEntityData, segStats);

      // create the modified blob
      const segmentationBlob = dcmjs.data.datasetToBlob(dataset);

      return { aim, segmentationBlob, segId };
    } catch (error) {
      throw new Error("Error creating segmentation", error);
    }
  };

  createAimMarkups = (aim, markupsToSave) => {
    Object.entries(markupsToSave).forEach(([key, values]) => {
      values.map((value) => {
        const { type, markup, shapeIndex, imageId, frameNum } = value;
        switch (type) {
          case "point":
            this.addPointToAim(aim, markup, shapeIndex, imageId, frameNum);
            break;
          case "line":
            this.addLineToAim(aim, markup, shapeIndex, imageId, frameNum);
            break;
          case "circle":
            this.addCircleToAim(aim, markup, shapeIndex, imageId, frameNum);
            break;
          case "polygon":
            this.addPolygonToAim(aim, markup, shapeIndex, imageId, frameNum);
            break;
          case "bidirectional":
            this.addBidirectionalToAim(
              aim,
              markup,
              shapeIndex,
              imageId,
              frameNum
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
    const markedImageIds = imageIds.filter((imageId) => {
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

  saveAim = (aim, segmentationBlob, segId) => {
    const aimJson = aim.getAim();
    const aimSaved = JSON.parse(aimJson);

    // If file upload service will be used instead of aim save service reagrding
    // the aim size purposes then aim blob should be sent with the following code

    // const aimBlob = new Blob([aimJson], {
    //   type: "application/octet-stream",
    // });

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
      comment,
    };

    uploadAim(aimSaved, projectID, this.state.isUpdate, this.updatedAimId)
      .then(() => {
        if (segmentationBlob) this.saveSegmentation(segmentationBlob, segId);
        // var objectUrl = URL.createObjectURL(segBlobGlobal);
        // window.open(objectUrl);

        // toast.success("Aim succesfully saved.", {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        // });
        this.props.dispatch(
          getSingleSerie({ patientID, projectID, seriesUID, studyUID })
        );
        this.props.dispatch(
          updateSingleSerie({
            subjectID: patientID,
            projectID,
            seriesUID,
            studyUID,
          })
        );
        this.props.dispatch(updatePatientOnAimSave(aimRefs));
        this.props.updateTreeDataOnSave(aimRefs);
      })
      .catch((error) => {
        alert(
          "Annotation could not be saved! More information about the error can be found in the logs."
        );
        console.error(error);
      });
    this.props.onCancel(false);
  };

  getNewMarkups = () => {
    const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    const markedCSImageIds = this.getMarkedImageIds();
    // check for markups
    var shapeIndex = 1;
    var markupsToSave = {};
    markedCSImageIds.map((CSImageId) => {
      const markUps = toolState[CSImageId];
      const imageUid = this.getstripCsImageId(CSImageId);
      const { imageId, frameNum } = this.parseImageUid(imageUid);
      Object.keys(markUps).map((tool) => {
        switch (tool) {
          case "FreehandRoi3DTool":
            const polygons3d = markUps[tool].data;
            polygons3d.map((polygon) => {
              if (!polygon.aimId || polygon.aimId === this.updatedAimId) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  CSImageId,
                  {
                    type: "polygon",
                    markup: polygon,
                    shapeIndex,
                    imageId,
                    frameNum,
                  },
                  markupsToSave
                );
                shapeIndex++;
              }
            });
            break;
          case "FreehandRoi": //Saved Polygons3Ds are rendered as normal
            const polygons = markUps[tool].data;
            polygons.map((polygon) => {
              if (!polygon.aimId || polygon.aimId === this.updatedAimId) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  CSImageId,
                  {
                    type: "polygon",
                    markup: polygon,
                    shapeIndex,
                    imageId,
                    frameNum,
                  },
                  markupsToSave
                );
                shapeIndex++;
              }
            });
            break;
          case "Bidirectional":
            const bidirectionals = markUps[tool].data;
            bidirectionals.map((bidirectional) => {
              if (
                !bidirectional.aimId ||
                bidirectional.aimId === this.updatedAimId
              ) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  CSImageId,
                  {
                    type: "bidirectional",
                    markup: bidirectional,
                    shapeIndex,
                    imageId,
                    frameNum,
                  },
                  markupsToSave
                );
                shapeIndex = shapeIndex + 2; //because bidirectional consists of two lines inc the shapeindex by two
              }
            });
            break;
          case "CircleRoi":
            const circles = markUps[tool].data;
            circles.map((circle) => {
              if (!circle.aimId || circle.aimId === this.updatedAimId) {
                // //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  CSImageId,
                  {
                    type: "circle",
                    markup: circle,
                    shapeIndex,
                    imageId,
                    frameNum,
                  },
                  markupsToSave
                );
                shapeIndex++;
              }
            });
            break;
          case "Length":
            const lines = markUps[tool].data;
            lines.map((line) => {
              if (!line.aimId || line.aimId === this.updatedAimId) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  CSImageId,
                  {
                    type: "line",
                    markup: line,
                    shapeIndex,
                    imageId,
                    frameNum,
                  },
                  markupsToSave
                );
                shapeIndex++;
              }
            });
            break;
          case "Probe":
            const points = markUps[tool].data;
            points.map((point) => {
              if (!point.aimId || point.aimId === this.updatedAimId) {
                //dont save the same markup to different aims
                this.storeMarkupsToBeSaved(
                  CSImageId,
                  {
                    type: "point",
                    markup: point,
                    shapeIndex,
                    imageId,
                    frameNum,
                  },
                  markupsToSave
                );
                shapeIndex++;
              }
            });
            break;
        }
      });
    });
    return markupsToSave;
  };

  addModalityObjectToSeedData = (seedData) => {
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
      typeCode,
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

  addUserToSeedData = (seedData) => {
    let obj = {};
    obj.loginName = sessionStorage.getItem("username");
    obj.name = sessionStorage.getItem("displayName");
    seedData.user = obj;
  };

  // get the image object by index
  getCornerstoneImagebyIdx = (imageIdx) => {
    const { imageCache } = cornerstone.imageCache;
    const imageId = Object.keys(imageCache)[imageIdx];
    return imageCache[imageId].image;
  };

  getCornerstoneImagebyId = (imageId) => {
    return cornerstone.imageCache.imageCache[imageId].image;
  };

  storeMarkupsToBeSaved = (imageId, markupData, markupsToSave) => {
    if (!markupsToSave[imageId]) markupsToSave[imageId] = [];
    markupsToSave[imageId].push(markupData);
  };

  addSegmentationToAim = (aim, segEntityData, segStats) => {
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
      const volumeId = aim.createVolumeCalcEntity({
        value: volume,
        unit: "mm3",
      });
      aim.createImageAnnotationStatement(2, segId, volumeId);
    }
    return segId.root;
  };

  parseImageUid = (imageUid) => {
    if (imageUid.includes("frame=")) {
      const obj = {};
      [obj.imageId, obj.frameNum] = imageUid.split("&frame=");
      return obj;
    }
    return { imageId: imageUid, frameNum: 1 }; //default frame number is always 1
  };

  addPolygonToAim = (aim, polygon, shapeIndex, imageId, frameNum) => {
    const { points } = polygon.handles;
    const markupId = aim.addMarkupEntity(
      "TwoDimensionPolyline",
      shapeIndex,
      points,
      imageId,
      frameNum
    );

    // find out the unit about statistics to write to aim
    let unit, mean, stdDev, min, max;
    if (polygon.meanStdDev) {
      ({ mean, stdDev, min, max } = polygon.meanStdDev);
      unit = "hu";
    } else if (polygon.meanStdDevSUV) {
      ({ mean, stdDev, min, max } = polygon.meanStdDev);
      unit = "suv";
    }

    const meanId = aim.createMeanCalcEntity({ mean, unit });
    aim.createImageAnnotationStatement(1, markupId, meanId);

    const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit });
    aim.createImageAnnotationStatement(1, markupId, stdDevId);

    const minId = aim.createMinCalcEntity({ min, unit });
    aim.createImageAnnotationStatement(1, markupId, minId);

    const maxId = aim.createMaxCalcEntity({ max, unit });
    aim.createImageAnnotationStatement(1, markupId, maxId);
  };

  addPointToAim = (aim, point, shapeIndex, imageId, frameNum) => {
    const { end } = point.handles;
    aim.addMarkupEntity(
      "TwoDimensionPoint",
      shapeIndex,
      [end],
      imageId,
      frameNum
    );
  };

  addLineToAim = (aim, line, shapeIndex, imageId, frameNum) => {
    const { start, end } = line.handles;
    const markupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex,
      [start, end],
      imageId,
      frameNum
    );

    const lengthId = aim.createLengthCalcEntity({
      value: line.length,
      unit: line.unit,
    });
    aim.createImageAnnotationStatement(1, markupId, lengthId);
  };

  addCircleToAim = (aim, circle, shapeIndex, imageId, frameNum) => {
    const { start, end } = circle.handles;
    const markupId = aim.addMarkupEntity(
      "TwoDimensionCircle",
      shapeIndex,
      [start, end],
      imageId,
      frameNum
    );

    let unit;
    if (circle.unit === "HU") unit = "hu";
    else if (circle.unit === "SUV") unit = "suv";

    const { mean, stdDev, min, max } = circle.cachedStats;

    const meanId = aim.createMeanCalcEntity({ mean, unit });
    aim.createImageAnnotationStatement(1, markupId, meanId);

    const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit });
    aim.createImageAnnotationStatement(1, markupId, stdDevId);

    const minId = aim.createMinCalcEntity({ min, unit });
    aim.createImageAnnotationStatement(1, markupId, minId);

    const maxId = aim.createMaxCalcEntity({ max, unit });
    aim.createImageAnnotationStatement(1, markupId, maxId);

    // aim.add;
  };

  addBidirectionalToAim = (
    aim,
    bidirectional,
    shapeIndex,
    imageId,
    frameNum
  ) => {
    const { longAxis, shortAxis } = this.getAxisOfBidirectional(bidirectional);

    // add longAxis
    const longAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex,
      [longAxis.start, longAxis.end],
      imageId,
      frameNum
    );
    const longAxisLengthId = aim.createLongAxisCalcEntity({
      value: longAxis.length,
      unit: "mm",
    });
    aim.createImageAnnotationStatement(1, longAxisMarkupId, longAxisLengthId);

    // add shortAxis
    const shortAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex + 1,
      [shortAxis.start, shortAxis.end],
      imageId,
      frameNum
    );
    const shortAxisLengthId = aim.createShortAxisCalcEntity({
      value: shortAxis.length,
      unit: "mm",
    });
    aim.createImageAnnotationStatement(1, shortAxisMarkupId, shortAxisLengthId);
  };

  getAxisOfBidirectional = (bidirectional) => {
    // takes two lines of b.directional and distincs the short and long axis
    const { element } = cornerstone.getEnabledElements()[this.props.activePort];
    const { rowPixelSpacing, columnPixelSpacing } = cornerstone.getViewport(
      element
    ).displayedArea;
    const {
      start,
      end,
      perpendicularStart,
      perpendicularEnd,
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
          length: perpendicularLength,
        },
      };
    else
      return {
        longAxis: {
          start: perpendicularStart,
          end: perpendicularEnd,
          length: perpendicularLength,
        },
        shortAxis: { start, end, length },
      };
  };

  createSegmentation3D = async (labelmapIndex) => {
    // following is to know the image index which has the first segment
    let firstSegImageIndex;

    const { element } = cornerstone.getEnabledElements()[this.props.activePort];
    const stackToolState = cornerstoneTools.getToolState(element, "stack");
    const imageIds = stackToolState.data[0].imageIds;
    let imagePromises = [];
    for (let i = 0; i < imageIds.length; i++) {
      imagePromises.push(cornerstone.loadImage(imageIds[i]));
    }
    const { getters } = cornerstoneTools.getModule("segmentation");
    const { labelmaps3D } = getters.labelmaps3D(element);
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
      segmentsOnLabelmap.forEach((segmentIndex) => {
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

    getters.labelmapStats(element, 1, labelmapIndex).then((stats) => {
      Object.assign(segStats, stats);
    });

    const images = await Promise.all(imagePromises);

    const segBlob = dcmjs.adapters.Cornerstone.Segmentation.generateSegmentation(
      images,
      labelmap3D,
      { rleEncode: false }
    );

    return {
      segBlob,
      segStats,
      imageIdx: firstSegImageIndex,
      image: images[firstSegImageIndex],
    };
  };

  getDatasetFromBlob = (segBlob) => {
    return new Promise((resolve) => {
      let segArrayBuffer;
      var fileReader = new FileReader();
      fileReader.onload = (event) => {
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

  saveSegmentation = (segmentation, segId) => {
    const { openSeries, activePort } = this.props;
    const { projectID } = openSeries[activePort];
    uploadSegmentation(segmentation, segId, projectID)
      .then(() => {
        // this.props.onCancel();
        // toast.success("Segmentation succesfully saved.", {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        // });
        return "success";
      })
      .catch((error) => {
        console.error(error);
        return "error";
      });
  };

  generateMockMetadata = (segmentIndex) => {
    // TODO -> Use colors from the cornerstoneTools LUT.
    const RecommendedDisplayCIELabValue = dcmjs.data.Colors.rgb2DICOMLAB([
      1,
      0,
      0,
    ]);
    return {
      SegmentedPropertyCategoryCodeSequence: {
        CodeValue: "T-D0050",
        CodingSchemeDesignator: "SRT",
        CodeMeaning: "Tissue",
      },
      SegmentNumber: segmentIndex.toString(),
      SegmentLabel: "Tissue " + segmentIndex.toString(),
      SegmentAlgorithmType: "SEMIAUTOMATIC",
      SegmentAlgorithmName: "ePAD",
      RecommendedDisplayCIELabValue,
      SegmentedPropertyTypeCodeSequence: {
        CodeValue: "T-D0050",
        CodingSchemeDesignator: "SRT",
        CodeMeaning: "Tissue",
      },
    };
  };

  getstripCsImageId = (imageId) => {
    if (imageId.includes("objectUID=")) return imageId.split("objectUID=")[1];
    return imageId.split("/").pop();
  };
}

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    templates: state.annotationsListReducer.templates,
    projectMap: state.annotationsListReducer.projectMap,
  };
};

export default connect(mapStateToProps)(AimEditor);
