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
  segUploadStarted,
  segUploadRemove
} from "../annotationsList/action";
import RecistTable from "./RecistTable";
import { Aim, getAimImageData, modalities } from "aimapi";
import { prepAimForParseClass, getMarkups, addSemanticAnswersToSeedData, addUserToSeedData, enumAimType } from "./Helpers";
import * as questionaire from "./parseClass.js";
import * as dcmjs from "dcmjs";
import Switch from "react-switch";
import { Modal } from "react-bootstrap";
import "./aimEditor.css";

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
      const { aimId, trackingUniqueIdentifier } = this.props.aimId;
      this.updatedAimId = aimId;
      this.state.isUpdate = true;
      this.state.trackingUId = trackingUniqueIdentifier;
    }
  }

  componentDidMount() {
    const element = document.getElementById("questionaire");
    let {
      templates: allTemplates,
      openSeries,
      activePort,
      setAimDirty,
    } = this.props;
    const { projectID } = openSeries[activePort];

    const lastSavedAim = sessionStorage.getItem("lastSavedAim");

    if (this.state.autoFill && Object.keys(lastSavedAim).length)
      this.semanticAnswers = new questionaire.AimEditor(
        element,
        this.validateForm,
        this.renderButtons,
        this.getDefaultLesionName(),
        setAimDirty,
        prepAimForParseClass(JSON.parse(lastSavedAim)) // becasue there is the whole aim json in the session storage, pass only necessary parts to autofill
      );
    else
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
    if (aimId != null && Object.entries(aimId).length) {
      try {
        this.semanticAnswers.loadAimJson(aimId);
      } catch (error) {
        console.error("Error loading aim to aim editor:", error);
      }
    }
    window.addEventListener("checkShapes", this.checkShapes);
  }

  componentDidUpdate(prevProps) {
    if ((this.props.aimId !== undefined) && (prevProps.aimId !== undefined) && (prevProps.aimId.aimId !== this.props?.aimId?.aimId))
      this.semanticAnswers.loadAimJson(this.props.aimId);
    const { isSegUploaded } = this.props;
    const { uploadingSegId } = this.state;
    if (isSegUploaded[uploadingSegId]) {
      this.setState({ showModal: false });
      this.uploadCompleted();
      toast.success("Segmentation succesfully saved.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      this.props.dispatch(segUploadRemove(uploadingSegId));
      this.setState({ uploadingSegId: "" });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("checkShapes", this.checkShapes);
  }

  loadAim = (event) => {
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
      console.warn("Answer form has error/s!!!");
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
    if (checked) {
      const lastSavedAim = sessionStorage.getItem("lastSavedAim");
      if (lastSavedAim && Object.keys(lastSavedAim).length) {
        const aimForParseClass = prepAimForParseClass(JSON.parse(lastSavedAim));
        this.semanticAnswers.triggerAutoFillAim(aimForParseClass);
      }
    }
  };

  selectBaseline = async (aim) => {
    const trackingUId = this.getTrackingUId(aim);
    await this.setState({ trackingUId });
  }

  getTrackingUId = (aim) => {
    return aim.ImageAnnotationCollection?.imageAnnotations?.ImageAnnotation[0]?.trackingUniqueIdentifier.root;
  }

  render() {
    const { openSeries, activePort } = this.props;
    const { patientID, projectID } = openSeries[activePort];
    return (
      <div className="editor-form">
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
        <div
          className="base-line-selection"
          onClick={() => this.setState({ showRecist: true })}
        >
          Select Baseline
        </div>
        {this.state.showRecist && (
          <RecistTable
            subjectId={patientID}
            projectId={projectID}
            semanticAnswers={this.semanticAnswers}
            onSelect={this.selectBaseline}
            onClose={() => this.setState({ showRecist: false })}
          />
        )}
        <br />
        <div id="questionaire" />
        {this.state.buttonGroupShow && (
          <div className="aim-editor-button-group">
            <button
              className="btn btn-sm btn-outline-light aim-editor-button"
              onClick={this.save}
            >
              Save
            </button>
            &nbsp;
            <button
              className="btn btn-sm btn-outline-light aim-editor-button"
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

  checkMarkupsForTemplate = () => {
    const templateType = this.semanticAnswers.getSelectedTemplateType();
    if (templateType === "Study" || templateType === "Series") {
      const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
      if (!toolState || toolState === "undefined")
        return
      const shapes = getMarkups(toolState);
      if (shapes && Object.keys(shapes).length) {
        const answer = window.confirm(
          `No markups can be saved with template type: ${templateType}! All previously unsaved markups will be lost! Do you want to continue?`
        );
        if (!answer) return 0;
        this.props.onCancel(false);
      }
    }
    return 1;
  };

  save = () => {
    // Check if the template selected and if the selected template type is compatible to have markups
    if (!this.checkAimTemplate() || !this.checkMarkupsForTemplate()) return;

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

  fixAimType = (aim, templateType) => {
    if (
      templateType === "Study" &&
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
        .imageReferenceEntityCollection
    ) {
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy.imageSeries.instanceUid.root =
        "";
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy.imageSeries.modality = {
        code: "99EPADM0",
        codeSystemName: "99EPAD",
        "iso:displayName": {
          "xmlns:iso": "uri:iso.org:21090",
          value: "NA",
        },
      };
    }
    if (
      (templateType === "Study" || templateType === "Series") &&
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
        .imageReferenceEntityCollection
    ) {
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy.imageSeries.imageCollection.Image[0].sopClassUid.root =
        "";
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy.imageSeries.imageCollection.Image[0].sopInstanceUid.root =
        "";
      // remove instance number from comment
      if (
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
          .comment
      ) {
        const commentParts = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value.split(
          "/"
        );
        if (commentParts.length > 3) {
          commentParts[2] = " ";
          aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value = commentParts.join(
            "/"
          );
        }
      }
    }
    return aim;
  };

  createAim = async (answers) => {
    const { hasSegmentation } = this.props;
    const markupsToSave = this.getNewMarkups();
    const templateType = this.semanticAnswers.getSelectedTemplateType();
    try {
      if (hasSegmentation) {
        // if (!this.checkSegmentationFrames()) return;
        // segmentation and markups
        this.createAimSegmentation(answers).then(
          ({ aim, segmentationBlob, segId }) => {
            // also add the markups to aim if there is any
            if (Object.entries(markupsToSave).length !== 0)
              this.createAimMarkups(aim, markupsToSave);
            this.saveAim(aim, templateType, segmentationBlob, segId);
          }
        );
      } else if (Object.entries(markupsToSave).length !== 0) {
        // markups without segmentation
        const seedData = this.getAimSeedDataFromMarkup(markupsToSave, answers);
        const aim = new Aim(
          seedData,
          enumAimType.imageAnnotation,
          this.updatedAimId,
          this.state.trackingUId
        );
        this.createAimMarkups(aim, markupsToSave);
        this.saveAim(aim, templateType);
      } else {
        //Non markup image annotation
        const { activePort } = this.props;
        const { element } = cornerstone.getEnabledElements()[activePort];
        const image = cornerstone.getImage(element);
        const seedData = this.getAimSeedDataFromCurrentImage(image, answers);
        const aim = new Aim(
          seedData,
          enumAimType.imageAnnotation,
          this.updatedAimId,
          this.state.trackingUId
        );
        this.saveAim(aim, templateType);
      }
    } catch (error) {
      throw new Error("Error creating aim", error);
    }
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
    let aimName = answers.name.value;
    // try {
    const activeLabelMapIndex = this.getActiveLabelMapIndex();

    const {
      segBlob,
      segStats,
      imageIdx,
      image,
    } = await this.createSegmentation3D(activeLabelMapIndex, aimName);

    // praper the seed data and create aim
    const seedData = getAimImageData(image);
    addSemanticAnswersToSeedData(seedData, answers);
    addUserToSeedData(seedData);
    const aim = new Aim(
      seedData,
      enumAimType.imageAnnotation,
      this.updatedAimId,
      this.state.trackingUId
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
    // } catch (error) {
    //   throw new Error("Error creating segmentation", error);
    // }
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
    addSemanticAnswersToSeedData(seedData, answers);
    addUserToSeedData(seedData);
    return seedData;
  };

  getAimSeedDataFromCurrentImage = (image, answers) => {
    const seedData = getAimImageData(image);
    addSemanticAnswersToSeedData(seedData, answers);
    addUserToSeedData(seedData);
    return seedData;
  };

  saveAim = (aim, templateType, segmentationBlob, segId) => {
    const aimJson = aim.getAim();
    let aimSaved = JSON.parse(aimJson);
    const isStudyAim = templateType === "Study" ? true : false;

    // If file upload service will be used instead of aim save service reagrding
    // the aim size purposes then aim blob should be sent with the following code

    // const aimBlob = new Blob([aimJson], {
    //   type: "application/octet-stream",
    // });
    aimSaved = this.fixAimType(aimSaved, templateType);
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
      isStudyAim
    };

    uploadAim(aimSaved, projectID, this.state.isUpdate, this.updatedAimId)
      .then(() => {
        // Write the aim to session storage for further autoFill
        sessionStorage.setItem("lastSavedAim", JSON.stringify(aimSaved));

        if (segmentationBlob) this.saveSegmentation(segmentationBlob, segId);
        else this.uploadCompleted(aimRefs)
      })
      .catch((error) => {
        alert(
          "Annotation could not be saved! More information about the error can be found in the logs."
        );
        console.error(error);
      });
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
    const segId = aim.createSegmentationEntity(segEntityData).root;

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
    return segEntityData.sopInstanceUid;
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

    const { unit, calcUnit, length, min, max, mean, stdDev } = line;

    const lengthId = aim.createLengthCalcEntity({ value: length, unit });
    aim.createImageAnnotationStatement(1, markupId, lengthId);

    let _calcUnit; // unit if calculations
    if (calcUnit === "HU") _calcUnit = "hu";
    else if (calcUnit === "SUV") _calcUnit = "suv";

    const minId = aim.createMinCalcEntity({ min, unit: _calcUnit });
    aim.createImageAnnotationStatement(1, markupId, minId);

    const maxId = aim.createMaxCalcEntity({ max, unit: _calcUnit });
    aim.createImageAnnotationStatement(1, markupId, maxId);

    const meanId = aim.createMeanCalcEntity({ mean, unit: _calcUnit });
    aim.createImageAnnotationStatement(1, markupId, meanId);

    const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit: _calcUnit });
    aim.createImageAnnotationStatement(1, markupId, stdDevId);

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

  getElementsActiveLayerImageIds = (element) => {
    // Check if there are layers
    const activeLayer = cornerstone.getActiveLayer(element);
    if (!activeLayer) {
      const stackToolState = cornerstoneTools.getToolState(element, "stack");
      return stackToolState.data[0].imageIds;
    }
    // If there are multiple layers (fused image) return active layer's corres
    // corresponding imageIds
    const activeLayerImageId = activeLayer.image.imageId;
    const enabledElements = cornerstone.getEnabledElements();
    for (let i = 0; i < enabledElements.length; i++) {
      const { element } = enabledElements[i];
      const stackToolState = cornerstoneTools.getToolState(element, "stack");
      if (stackToolState.data[0].imageIds.includes(activeLayerImageId))
        return stackToolState.data[0].imageIds;
    }

  }

  createSegmentation3D = async (labelmapIndex, aimName) => {
    // following is to know the image index which has the first segment
    let firstSegImageIndex;

    const { element } = cornerstone.getEnabledElements()[this.props.activePort];
    const imageIds = this.getElementsActiveLayerImageIds(element);
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

      // Leave the seg metadata intact if its an updated
      if (!this.state.isUpdate) {
        const segmentsOnLabelmap = labelmaps2D[i].segmentsOnLabelmap;
        segmentsOnLabelmap.forEach((segmentIndex) => {
          // CSCHECK::Original was as below but it wasn't adding metadata since 3Dbrush is already 
          // adding metadata
          // if (segmentIndex !== 0 && !labelmap3D.metadata[segmentIndex]) {
          if (segmentIndex !== 0) {
            labelmap3D.metadata[segmentIndex] = this.generateMockMetadata(
              segmentIndex, aimName
            );
          }
        });
      }
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
    const promise = new Promise((resolve, reject) => {
      uploadSegmentation(segmentation, segId, projectID)
        .then(() => {
          this.props.dispatch(segUploadStarted(segId));
          this.setState({ uploadingSegId: segId, showModal: true });
          resolve("success");
        })
        .catch((error) => {
          console.error(error);
          reject("error");
        });
    });
    return promise;
  };

  generateMockMetadata = (segmentIndex, aimName) => {
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
      // SegmentLabel: "Tissue " + segmentIndex.toString(),
      SegmentLabel: aimName || "Tissue " + segmentIndex.toString(),
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

  uploadCompleted = (aimRefs) => {
    const { openSeries, activePort } = this.props;
    const { patientID, projectID, seriesUID, studyUID } = openSeries[
      activePort
    ];
    toast.success("Aim succesfully saved.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    const isStudyAim = aimRefs ? aimRefs.isStudyAim : false; //If upload has segmentation it can't be study aim
    if (isStudyAim) {
      openSeries.forEach(({ seriesUID, studyUID }) => {
        if (openSeries[
          activePort
        ].studyUID === studyUID && openSeries[
          activePort
        ].seriesUID !== seriesUID)
          this.props.dispatch(
            getSingleSerie({ patientID, projectID, seriesUID, studyUID })
          );
      });
    }
    this.props.dispatch(
      getSingleSerie({ patientID, projectID, seriesUID, studyUID })
    );
    // Delete after tests Sept 2021
    // this.props.dispatch(
    //   updateSingleSerie({
    //     subjectID: patientID,
    //     projectID,
    //     seriesUID,
    //     studyUID,
    //   })
    // );

    // this.props.dispatch(updatePatientOnAimSave(aimRefs));
    this.props.updateTreeDataOnSave(aimRefs);
    this.props.onCancel(false); //close the aim editor
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
    isSegUploaded: state.annotationsListReducer.isSegUploaded,
  };
};

export default connect(mapStateToProps)(AimEditor);
