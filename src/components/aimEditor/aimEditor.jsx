import React, { Component } from "react";
import Draggable from "react-draggable";
import * as questionaire from "../../utils/AimEditorReactV1/parseClass";
import "./aimEditor.css";
import Aim from "./Aim";

const enumAimType = {
  imageAnnotation: 1,
  seriesAnnotation: 2,
  studyAnnotation: 3
};

class AimEditor extends Component {
  constructor(props) {
    super(props);
    this.seriesUid = this.props.series.seriesId;
    this.studyUid = this.props.series.studyId;
    this.csTools = this.props.csTools;
    this.cornerstone = this.props.cornerstone;
    this.person = this.props.person;
    this.equipment = this.props.equipment;
    this.accession = this.props.accession;
  }

  componentDidMount() {
    var shoutOutValidation = message => {
      alert(message);
    };
    var semanticAnswers = new questionaire.AimEditor(
      document.getElementById("questionaire"),
      shoutOutValidation
    );
    semanticAnswers.loadTemplates(questionaire.myA);
    semanticAnswers.createViewerWindow();
  }

  render() {
    return (
      <div id="questionaire" className="editorForm">
        <button type="button" onClick={this.save}>
          Save
        </button>
      </div>
    );
    // return <div id="questionaire" />;
  }

  save = () => {
    this.createAim();
  };

  createAim = () => {
    const hasSegmentation = false; //TODO:keep this in store and look dynamically
    var aim = new Aim(
      this.studyUid,
      this.equipment,
      this.accession,
      this.person,
      enumAimType.imageAnnotation,
      hasSegmentation
    );
    const { toolState } = this.csTools.globalImageIdSpecificToolStateManager;
    var shapeIndex = 1;
    console.log("Toolstate ", this.csTools);
    Object.entries(toolState).forEach(([imgId, annotations]) => {
      console.log(annotations);
      const imageReferenceUid = this.parseImgeId(imgId);
      Object.keys(annotations).map(annotation => {
        switch (annotation) {
          case "FreehandMouse":
            console.log("FreeHandMouse");
            const polygons = annotations[annotation].data;
            polygons.map(polygon => {
              this.addPolygonToAim(aim, polygon, shapeIndex, imageReferenceUid);
              shapeIndex++;
            });
            break;
          case "brush":
            console.log("brush");
            console.log("Brush ", annotations[annotation]);
            shapeIndex++;
            break;
          case "Bidirectional":
            console.log("FreeHandMouse");
            console.log("Bidirectional ", annotations[annotation]);
            shapeIndex++;
            break;
          case "RectangleRoi":
            console.log("RectangleRoi ", annotations[annotation]);
            shapeIndex++;
            break;
          case "EllipticalRoi":
            console.log("EllipticalRoi ", annotations[annotation]);
            shapeIndex++;
            break;
          case "Length":
            const lines = annotations[annotation].data;
            lines.map(line => {
              this.addLineToAim(aim, line, shapeIndex);
              shapeIndex++;
            });
        }
      });
    });
    aim.save();
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

  parseImgeId = imageId => {
    return imageId.split("objectUID=")[1].split("&")[0];
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

export default AimEditor;
