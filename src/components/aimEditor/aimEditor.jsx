import React, { Component } from "react";
import Draggable from "react-draggable";
import * as aim from "../../utils/AimEditorReactV1/parseClass";
import "./aimEditor.css";

class AimEditor extends Component {
  constructor(props) {
    console.log(props);
    super(props);
    this.csTools = this.props.csTools;
  }

  componentDidMount() {
    //console.log("qr", QEditor);
    var shoutOutValidation = message => {
      alert(message);
    };
    var instanceAimEditor = new aim.AimEditor(
      document.getElementById("questionaire"),
      shoutOutValidation
    );
    instanceAimEditor.loadTemplates(aim.myA);
    instanceAimEditor.createViewerWindow();
  }

  render() {
    return <div id="questionaire" className="editorForm" />;
    // return <div id="questionaire" />;
  }
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
