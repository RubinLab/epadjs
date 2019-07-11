import React, { Component } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import { isLite } from "../../config.json";
import { toast } from "react-toastify";
import { getTemplates } from "../../services/templateServices";
import { uploadAim } from "../../services/annotationServices";
import * as questionaire from "./parseClass.js";
import Aim from "./Aim";
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
      console.log("TEMPLATES", result.data);
      this.semanticAnswers = new questionaire.AimEditor(
        element,
        this.validateForm
      );
      this.semanticAnswers.loadTemplates(questionaire.templateArray);
      this.semanticAnswers.createViewerWindow();
      if (this.props.aimId != null && Object.entries(this.props.aimId).length)
        this.semanticAnswers.loadAimJson(this.props.aimId);
      //this.semanticAnswers.loadTemplates(questionaire.templateArray);
    });
  }

  validateForm = hasError => {
    if (hasError) console.log("Answer form has error/s!!!");
  };

  getImage = () => {
    return this.cornerstone.getImage(
      this.cornerstone.getEnabledElements()[this.props.activePort]["element"]
    );
  };

  render() {
    return (
      <Draggable enableUserSelectHack={false}>
        <div className="editorForm">
          <div id="questionaire" />
          <button type="button" onClick={this.save}>
            Save
          </button>
          <button type="button" onClick={this.cancel}>
            Cancel
          </button>
        </div>
      </Draggable>
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
    console.log("cstools are", this.csTools);
    // get data from questions

    // Logic behind relies on the order of the data in array
    const answers = this.semanticAnswers.saveAim();
    this.createAim(answers);
  };

  createAim = answers => {
    const hasSegmentation = false; //TODO:keep this in store and look dynamically
    const updatedAimId = this.props.aimId;
    console.log("IMAGE is", this.image);

    var aim = new Aim(
      this.image,
      enumAimType.imageAnnotation,
      hasSegmentation,
      answers,
      updatedAimId
    );

    const { toolState } = this.csTools.globalImageIdSpecificToolStateManager;

    // get the imagesIds for active viewport
    const element = this.cornerstone.getEnabledElements()[
      this.props.activePort
    ]["element"];
    const stackToolState = this.csTools.getToolState(element, "stack");
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
        imagePromises.push(this.cornerstone.loadImage(imageId));
      });
      this.createSegmentation(toolState, imagePromises, markedImageIds);
    }

    // check for markups
    var shapeIndex = 1;
    markedImageIds.map(imageId => {
      const imageReferenceUid = this.parseImgeId(imageId);
      const markUps = toolState[imageId];
      Object.keys(markUps).map(tool => {
        switch (tool) {
          case "FreehandMouse":
            console.log("FreeHandMouse");
            const polygons = markUps[tool].data;
            polygons.map(polygon => {
              if (!polygon.aimId || polygon.aimId === updatedAimId) {
                //dont save the same markup to different aims
                this.addPolygonToAim(
                  aim,
                  polygon,
                  shapeIndex,
                  imageReferenceUid
                );
                shapeIndex++;
              }
            });
            break;
          case "Bidirectional":
            console.log("Bidirectional ", markUps[tool]);
            shapeIndex++;
            break;
          case "RectangleRoi":
            console.log("RectangleRoi ", markUps[tool]);
            shapeIndex++;
            break;
          case "EllipticalRoi":
            console.log("EllipticalRoi ", markUps[tool]);
            shapeIndex++;
            break;
          case "CircleRoi":
            console.log("CircleRoi ", markUps[tool]);
            const circles = markUps[tool].data;
            circles.map(circle => {
              if (!circle.aimId || circle.aimId === updatedAimId) {
                //dont save the same markup to different aims
                this.addCircleToAim(aim, circle, shapeIndex, imageReferenceUid);
                shapeIndex++;
              }
            });
            break;
          case "Length":
            const lines = markUps[tool].data;
            lines.map(line => {
              if (!line.aimId || line.aimId === updatedAimId) {
                //dont save the same markup to different aims
                this.addLineToAim(aim, line, shapeIndex);
                shapeIndex++;
              }
            });
        }
      });
    });
    const aimJson = aim.getAim();
    // const file = new Blob(aimJson, { type: "text/json" });
    // const series = this.props.series[this.props.activePort];
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

  addLineToAim = (aim, line, shapeIndex) => {
    const { start, end } = line.handles;
    const markupId = aim.addMarkupEntity("TwoDimensionPolyline", shapeIndex, [
      start,
      end
    ]);
    // aim.add;
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
    console.log("circle", circle, "mean", mean, "stdDev", stdDev);

    const meanId = aim.createMeanCalcEntity({ mean, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, meanId);

    const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, stdDevId);

    const minId = aim.createMinCalcEntity({ min, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, minId);

    const maxId = aim.createMaxCalcEntity({ max, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(1, markupId, maxId);
    console.log();
    // aim.add;
  };

  createSegmentation = (toolState, imagePromises, markedImageIds) => {
    const segments = [];
    console.log("marked Images are", markedImageIds);
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
        console.log("I am in");
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
          SegmentAlgorithmName: "Slicer Prototype",
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

  createDicomSeg = () => {};

  parseImgeId = imageId => {
    if (isLite) return imageId.split("/").pop();
    else return imageId.split("objectUID=")[1].split("&")[0];
  };
  // testAimEditor = () => {
  //   //console.log(document.getElementById("cont"));
  //   var instanceAimEditor = new aim.AimEditor(document.getElementById("cont"));
  //   var myA = [
  //     { key: "BeaulieuBoneTemplate_rev18", value: aim.myjson },
  //     { key: "asdf", value: aim.myjson1 }
  //   ];
  //   instanceAimEditor.loadTemplates(myA);

  //   instanceAimEditor.addButtonsDiv();

  //   instanceAimEditor.createViewerWindow();
  // };
}
const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};
export default connect(mapStateToProps)(AimEditor);
