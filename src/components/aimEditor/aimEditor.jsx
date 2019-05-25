import React, { Component } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import { getTemplates } from "../../services/templateServices";
import * as questionaire from "../../utils/AimEditorReactV1/parseClass.js";
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
    this.cornerstone = this.props.cornerstone;
    this.csTools = this.props.csTools;
    this.image = this.getImage();
    this.person = this.getPatientData(this.image);
    this.equipment = this.getEquipmentData(this.image);
    this.accession = this.getAccession(this.image);
  }

  componentDidMount() {
    console.log("mete", document.getElementById("questionaire"));
    const element = document.getElementById("questionaire");
    // const templateId = "1";
    // const {
    //   data: {
    //     ResultSet: { Result: templates }
    //   }
    // } = await getTemplates(templateId);
    //
    // Change the static projectId above with the value in store
    //

    var shoutOutValidation = message => {
      alert(message);
    };
    var semanticAnswers = new questionaire.AimEditor(
      element,
      shoutOutValidation
    );
    semanticAnswers.loadTemplates(questionaire.templateArray);
    semanticAnswers.createViewerWindow(element);
    // if (Object.entries(this.props.aim).length)
    //   semanticAnswers.loadAimJson(this.props.aim);
  }

  getImage = () => {
    return this.cornerstone.getImage(
      this.cornerstone.getEnabledElements()[this.props.activePort]["element"]
    );
  };

  getPatientData = image => {
    const sex = image.data.string("x00100040") || "";
    const name = image.data.string("x00100010") || "";
    const patientId = image.data.string("x00100020") || "";
    const birthDate = image.data.string("x00100030") || "";
    const person = {
      sex: { value: sex },
      name: { value: name },
      id: { value: patientId },
      birthDate: { value: birthDate }
    };
  };

  getEquipmentData = image => {
    const manuName = image.data.string("x00080070") || "";
    const manuModel = image.data.string("x00081090") || "";
    const sw = image.data.string("x00181020") || "";
    const equipment = {
      manufacturerName: manuName,
      manufacturerModelName: manuModel,
      softwareVersion: sw
    };
  };

  getAccession = image => {
    return image.data.string("x00080050") || "";
  };

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
    console.log("cstools are", this.csTools);
    console.log(
      this.csTools.getElementToolStateManager(
        this.cornerstone.getEnabledElements()[0]["element"]
      )
    );
    this.createAim();
  };

  createAim = () => {
    const hasSegmentation = false; //TODO:keep this in store and look dynamically
    var aim = new Aim(
      this.image,
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
const mapStateToProps = state => {
  return {
    series: state.searchViewReducer.series,
    activePort: state.annotationsListReducer.activePort
  };
};
export default connect(mapStateToProps)(AimEditor);
