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

  createAim = answers => {
    console.log("Segmentation", this.props.hasSegmentation);
    let hasSegmentation = this.props.hasSegmentation;
    const updatedAimId = this.props.aimId;

    // if (hasSegmentation) {
    //   this.handleSegmentation();
    //   return;
    // }

    console.log(
      "cstools",
      this.props.csTools.globalImageIdSpecificToolStateManager
    );
    const {
      toolState
    } = this.props.csTools.globalImageIdSpecificToolStateManager;
    console.log("Tool state", this.props.csTools);

    // get the imagesIds for active viewport
    const element = this.props.cornerstone.getEnabledElements()[
      this.props.activePort
    ]["element"];
    const stackToolState = this.props.csTools.getToolState(element, "stack");
    const imageIds = stackToolState.data[this.props.activePort].imageIds;

    // check which images has markup or segmentation
    const markedImageIds = imageIds.filter(imageId => {
      if (toolState[imageId] === undefined) return false;
      return true;
    });

    // if has segmentation retrieve the images to generate dicomseg, most should be cached already
    if (hasSegmentation) {
      var imagePromises = [];
      imageIds.map(imageId => {
        imagePromises.push(this.props.cornerstone.loadImage(imageId));
      });
      // this.createSegmentation(toolState, imagePromises, markedImageIds);
      this.createSegmentation3D();
      return;
    }

    console.log("Marked Images", markedImageIds);

    // check for markups
    var shapeIndex = 1;
    var markupsToSave = {};
    markedImageIds.map(imageId => {
      const imageReferenceUid = this.parseImgeId(imageId);
      const markUps = toolState[imageId];
      Object.keys(markUps).map(tool => {
        switch (tool) {
          case "FreehandMouse":
            // console.log("FreeHandMouse");
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
            // console.log("Bidirectional ", markUps[tool]);
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
            // console.log("CircleRoi ", markUps[tool]);
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
          case "brush":
            const brush = markUps[tool].data;
            hasSegmentation = true;
          // TODO: check if it's a new brush data
        }
      });
    });

    const cornerStoneImageId = Object.keys(markupsToSave)[0];
    const image = this.getCornerstoneImage(cornerStoneImageId, markupsToSave);
    let seedData = getAimImageData(image);
    this.addSemanticAnswersToSeedData(seedData, answers);
    this.addUserToSeedData(seedData);
    // this.addModalityObjectToSeedData(seedData);

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

    uploadAim(JSON.parse(aimJson))
      .then(() => {
        this.props.onCancel();
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

  hadleSegmentation = () => {};

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

  getCornerstoneImage = (imageId, markupsToSave) => {
    return this.props.cornerstone.default.imageCache.imageCache[
      Object.keys(markupsToSave)[0]
    ].image;
  };

  storeMarkupsToBeSaved = (imageId, markupData, markupsToSave) => {
    if (!markupsToSave[imageId]) markupsToSave[imageId] = [];
    markupsToSave[imageId].push(markupData);
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

  createSegmentation = (toolState, imagePromises, markedImageIds) => {
    const segments = [];
    markedImageIds
      .filter(imageId => {
        if (
          toolState[imageId].brush === undefined ||
          toolState[imageId].brush.data === undefined
        )
          return false;
        return true;
      })
      .map(imageId => {
        this.setSegmentMetaData(toolState, imageId, segments);
      });
    const brushData = {
      toolState,
      segments
    };
    Promise.all(imagePromises).then(images => {
      console.log("images are", images, "brush data is", brushData);
      const segBlob = dcmjs.adapters.Cornerstone.Segmentation.generateSegmentation(
        images,
        brushData
      );
      console.log(segBlob);
      // Create a URL for the binary.
      // var objectUrl = URL.createObjectURL(segBlob);
      // window.open(objectUrl);
    });
  };

  createSegmentation3D = () => {
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
      imagePromises.push(this.cornerstone.loadImage(imageIds[i]));
    }

    const { getters } = this.csTools.getModule("segmentation");
    const { labelmaps3D } = getters.labelmaps3D(element);
    if (!labelmaps3D) {
      return;
    }

    for (
      let labelmapIndex = 0;
      labelmapIndex < labelmaps3D.length;
      labelmapIndex++
    ) {
      const labelmap3D = labelmaps3D[labelmapIndex];
      const labelmaps2D = labelmap3D.labelmaps2D;

      for (let i = 0; i < labelmaps2D.length; i++) {
        if (!labelmaps2D[i]) {
          continue;
        }
        const segmentsOnLabelmap = labelmaps2D[i].segmentsOnLabelmap;
        segmentsOnLabelmap.forEach(segmentIndex => {
          if (segmentIndex !== 0 && !labelmap3D.metadata[segmentIndex]) {
            labelmap3D.metadata[segmentIndex] = this.generateMockMetadata(
              segmentIndex
            );
          }
        });
      }
    }
    Promise.all(imagePromises)
      .then(images => {
        const segBlob = dcmjs.adapters.Cornerstone.Segmentation.generateSegmentation(
          images,
          labelmaps3D
        );
        this.saveSegmentation(segBlob);
      })
      .catch(err => console.log(err));
  };

  saveSegmentation = segmentation => {
    const { patientID, projectID } = this.props.series[this.props.activePort];
    console.log("IDS", patientID, projectID);
    uploadSegmentation(segmentation, patientID, projectID)
      .then(() => {
        this.props.onCancel();
        toast.success("Segmentation succesfully saved.", {
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
      SegmentNumber: (segmentIndex + 1).toString(),
      SegmentLabel: "Tissue " + (segmentIndex + 1).toString(),
      SegmentAlgorithmType: "SEMIAUTOMATIC",
      SegmentAlgorithmName: "Slicer Prototype",
      RecommendedDisplayCIELabValue,
      SegmentedPropertyTypeCodeSequence: {
        CodeValue: "T-D0050",
        CodingSchemeDesignator: "SRT",
        CodeMeaning: "Tissue"
      }
    };
  };

  setSegmentMetaData = (toolState, imageId, segments) => {
    console.log("imageIds are", imageId, "segments are", segments);
    const RecommendedDisplayCIELabValue = dcmjs.data.Colors.rgb2DICOMLAB([
      1,
      0,
      0
    ]);
    const brushData = toolState[imageId].brush.data;
    console.log("brush data is", brushData);
    for (let segIdx = 0; segIdx < 4; segIdx++) {
      // If there is pixelData for this segment, set the segment metadata
      // if it hasn't been set yet.
      if (
        brushData[segIdx] &&
        brushData[segIdx].pixelData &&
        !segments[segIdx]
      ) {
        segments[segIdx] = {
          SegmentedPropertyCategoryCodeSequence: {
            CodeValue: "T-D0050",
            CodingSchemeDesignator: "SRT",
            CodeMeaning: "Tissue"
          },
          SegmentNumber: (segIdx + 1).toString(),
          SegmentLabel: "Tissue " + (segIdx + 1).toString(),
          SegmentAlgorithmType: "SEMIAUTOMATIC",
          SegmentAlgorithmName: "ePAD",
          RecommendedDisplayCIELabValue,
          SegmentedPropertyTypeCodeSequence: {
            CodeValue: "T-D0050",
            CodingSchemeDesignator: "SRT",
            CodeMeaning: "Tissue"
          }
        };
      }
    }
  };

  addSegmentationToAim = (aim, image) => {
    // aim.
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
