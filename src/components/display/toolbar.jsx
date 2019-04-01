import React, { Component } from "react";
import { connect } from "react-redux";
import MetaData from "./metaData";
import Draggable from "react-draggable";

import { FaLocationArrow } from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import { FiSunset } from "react-icons/fi";
import { FiZoomIn } from "react-icons/fi";
import { FaAdjust } from "react-icons/fa";
import { MdLoop } from "react-icons/md";
import { MdPanTool } from "react-icons/md";
import { FaListAlt } from "react-icons/fa";
import { FiRotateCw } from "react-icons/fi";
import { TiPipette } from "react-icons/ti";
import { TiDeleteOutline } from "react-icons/ti";
import { TiPencil } from "react-icons/ti";
import { MdWbIridescent } from "react-icons/md";
//import { FaDraftingCompass } from "react-icons/fa";

import "./toolbar.css";
import "../../font-icons/styles.css";

const mapStateToProps = state => {
  return {
    cornerstone: state.searchViewReducer.cornerstone,
    cornerstoneTools: state.searchViewReducer.cornerstoneTools,
    activeVP: state.searchViewReducer.activeVP
  };
};

const tools = [
  { name: "Wwwc" },
  { name: "Pan" },
  {
    name: "Zoom",
    configuration: {
      minScale: 0.3,
      maxScale: 25,
      preventZoomOutsideImage: true
    }
  },
  { name: "Probe" },
  { name: "Length" },
  { name: "EllipticalRoi" },
  {
    name: "RectangleRoi",
    configuration: {
      showMinMax: true
      // showHounsfieldUnits: true
    }
  },
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  { name: "Probe" },
  { name: "FreehandMouse" },
  { name: "Eraser" },
  { name: "Bidirectional" },
  { name: "Brush" }
];

class Toolbar extends Component {
  state = { activeTool: "", showDrawing: false };

  constructor(props) {
    super(props);
    this.tools = tools;
    this.csTools = this.props.cornerstoneTools;
    //this.initializeTools();
  }

  initializeTools = () => {
    Array.from(this.tools).forEach(tool => {
      const apiTool = this.csTools[`${tool.name}Tool`];
      if (apiTool) {
        this.csTools.addTool(apiTool, tool);
      } else {
        throw new Error(`Tool not found: ${tool.name}Tool`);
      }
    });
    const WwwcTool = this.csTools.WwwcTool;
  };

  disableAllTools = () => {
    Array.from(this.tools).forEach(tool => {
      const apiTool = this.csTools[`${tool.name}Tool`];
      if (apiTool) {
        this.csTools.setToolPassive(tool.name);
      } else {
        throw new Error(`Tool not found: ${tool.name}Tool`);
      }
    });
  };

  //sets the selected tool active for all of the enabled elements
  setToolActive = (toolName, mouseMask = 1) => {
    this.disableAllTools();
    this.csTools.setToolActive(toolName, {
      mouseButtonMask: mouseMask
    });
    console.log(this.csTools);
  };

  //sets the selected tool active for an enabled elements
  setToolActiveForElement = (toolName, mouseMask = 1) => {
    const elem = document.getElementById(this.props.activeVP);
    this.disableAllTools();
    this.csTools.setToolActiveForElement(elem, toolName, {
      mouseButtonMask: mouseMask
    });
  };

  invert = () => {
    const element = document.getElementById(this.props.activeVP);
    if (element) {
      const viewport = this.props.cornerstone.getViewport(element);
      viewport.invert = !viewport.invert;
      this.props.cornerstone.setViewport(element, viewport);
    }
  };

  reset = () => {
    this.disableAllTools();
    const element = document.getElementById(this.props.activeVP);
    this.props.cornerstone.reset(element);
  };

  toggleMetaData = () => {
    this.disableAllTools();
    const element = document.getElementById("myForm");
    element.style.display = "block";
  };

  probe = () => {
    /*console.log(this.props.cornerstoneTools);
    const element = document.getElementById(this.props.activeVP);
    console.log(
      this.props.cornerstoneTools.getElementToolStateManager(element)
    );*/
    console.log("Saving state");
    const element = [document.getElementById(this.props.activeVP)];
    //var appState = this.props.cornerstoneTools.getToolState(element);
    //var serializedState = JSON.stringify(appState);
    //var parsed = JSON.parse(appState);
    console.log(this.props.cornerstoneTools.state);
    console.log(this.dxm);
    this.dxm[
      "wadouri:http://epad-dev6.stanford.edu:8080/epad/wado/?requestType=WADO&studyUID=1.2.840.113619.2.55.1.1762384564.2037.1100004161.949&seriesUID=1.2.840.113619.2.55.1.1762384564.2037.1100004161.950&objectUID=1.3.12.2.1107.5.8.2.484849.837749.68675556.2004110916031631&contentType=application%2Fdicom"
    ].Length.data[0].handles.textBox = "";
    console.log(this.dxm);
    this.props.cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      this.dxm
    );
    /*this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.probe.activate(elements[i], 1);
    }*/
  };

  anotate = () => {
    this.disableAllTools();
    this.setState({ showDrawing: !this.state.showDrawing });
    console.log(
      this.props.cornerstoneTools.globalImageIdSpecificToolStateManager
        .toolState[
        "wadouri:http://epad-dev6.stanford.edu:8080/epad/wado/?requestType=WADO&studyUID=1.2.840.113619.2.55.1.1762384564.2037.1100004161.949&seriesUID=1.2.840.113619.2.55.1.1762384564.2037.1100004161.950&objectUID=1.3.12.2.1107.5.8.2.484849.837749.68675556.2004110916031631&contentType=application%2Fdicom"
      ]
    );
    this.dxm = {
      ...this.props.cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState()
    };
    console.log(this.dxm);
  };

  point = () => {
    /*console.log(this.props.cornerstoneTools);
    const element = document.getElementById(this.props.activeVP);
    console.log(
      this.props.cornerstoneTools.getElementToolStateManager(element)
    );*/
    console.log("Saving state");
    const element = [document.getElementById(this.props.activeVP)];
    //var appState = this.props.cornerstoneTools.getToolState(element);
    //var serializedState = JSON.stringify(appState);
    //var parsed = JSON.parse(appState);
    console.log(this.props.cornerstoneTools.state);
    console.log(this.dxm);
    this.props.cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      this.dxm
    );
  };

  line = () => {
    this.disableAllTools();
    const element = document.getElementById(this.props.activeVP);
    this.props.cornerstoneTools.length.activate(element, 1);
  };

  erase = () => {
    const elem = document.getElementById(this.props.activeVP);
    this.props.cornerstoneTools.globalImageIdSpecificToolStateManager.clear(
      elem
    );
    console.log(this.props.cornerstoneTools);
  };

  render() {
    return (
      <div className="toolbar">
        <div
          id="noop"
          tabIndex="0"
          className="toolbarSectionButton active"
          onClick={this.disableAllTools}
        >
          <div className="toolContainer">
            <FaLocationArrow />
          </div>
          <div className="buttonLabel">
            <span>No Op</span>
          </div>
        </div>
        <div
          id="wwwc"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={() => this.setToolActive("Wwwc")}
        >
          <div className="toolContainer">
            <FiSun />
          </div>
          <div className="buttonLabel">
            <span>Levels</span>
          </div>
        </div>
        <div id="preset" tabIndex="1" className="toolbarSectionButton">
          <div className="toolContainer">
            <FiSunset />
          </div>
          <div className="buttonLabel">
            <span>Presets</span>
          </div>
        </div>
        <div
          id="zoom"
          tabIndex="2"
          className="toolbarSectionButton"
          onClick={() => this.setToolActive("Zoom")}
        >
          <div className="toolContainer">
            <FiZoomIn />
          </div>
          <div className="buttonLabel">
            <span>Zoom</span>
          </div>
        </div>
        <div
          id="invert"
          tabIndex="3"
          className="toolbarSectionButton"
          onClick={this.invert}
        >
          <div className="toolContainer">
            <FaAdjust />
          </div>
          <div className="buttonLabel">
            <span>Invert</span>
          </div>
        </div>
        <div
          id="reset"
          tabIndex="4"
          className="toolbarSectionButton"
          onClick={this.reset}
        >
          <div className="toolContainer">
            <MdLoop />
          </div>
          <div className="buttonLabel">
            <span>Reset</span>
          </div>
        </div>
        <div
          id="pan"
          tabIndex="5"
          className="toolbarSectionButton"
          onClick={() => this.setToolActive("Pan", [1])}
        >
          <div className="toolContainer">
            <MdPanTool />
          </div>
          <div className="buttonLabel">
            <span>Pan</span>
          </div>
        </div>
        <div
          id="data"
          tabIndex="6"
          className="toolbarSectionButton"
          onClick={this.toggleMetaData}
        >
          <div className="toolContainer">
            <FaListAlt />
          </div>
          <div className="buttonLabel">
            <span>SeriesData</span>
          </div>
        </div>
        <MetaData />
        {/*<div
          id="angle"
          tabIndex="7"
          className="toolbarSectionButton"
          onClick={() => this.setToolActive("Angle")}
        >
          <div className="toolContainer" />
          <div className="buttonLabel">
            <span>Angle</span>
          </div>
        </div>*/}
        <div
          id="rotate"
          tabIndex="8"
          className="toolbarSectionButton"
          onClick={() => this.setToolActive("Rotate")}
        >
          <div className="toolContainer">
            <FiRotateCw />
          </div>
          <div className="buttonLabel">
            <span>Rotate</span>
          </div>
        </div>
        <div
          id="wwwcRegion"
          tabIndex="9"
          className="toolbarSectionButton"
          onClick={() => this.setToolActive("WwwcRegion")}
        >
          <div className="toolContainer">
            <FaListAlt />
          </div>
          <div className="buttonLabel">
            <span>Region</span>
          </div>
        </div>
        <div
          id="probe"
          tabIndex="10"
          className="toolbarSectionButton"
          onClick={this.probe}
          //onClick={() => this.setToolActive("Probe")}
        >
          <div className="toolContainer">
            <TiPipette />
          </div>
          <div className="buttonLabel">
            <span>Probe</span>
          </div>
        </div>
        <div
          id="drawing"
          tabIndex="12"
          className="toolbarSectionButton"
          onClick={this.anotate}
        >
          <div className="toolContainer">
            <TiPencil />
          </div>
          <div className="buttonLabel">
            <span>Anotate</span>
          </div>
        </div>
        <div
          id="eraser"
          tabIndex="13"
          className="toolbarSectionButton"
          onClick={this.erase}
          //onClick={() => this.setToolActive("Eraser")}
        >
          <div className="toolContainer">
            <TiPencil />
          </div>
          <div className="buttonLabel">
            <span>Eraser</span>
          </div>
        </div>
        {/* Drawing Bar Starts here. Extract it to another component later  */}
        {this.state.showDrawing && (
          <Draggable
            handle=".handle"
            defaultPosition={{ x: 0, y: 5 }}
            position={null}
            grid={[10, 10]}
            scale={1}
            onStart={this.handleStart}
            onDrag={this.handleDrag}
            onStop={this.handleStop}
          >
            <div className="drawBar">
              <TiDeleteOutline />

              <div
                id="point"
                tabIndex="1"
                className="toolbarSectionButton"
                onClick={this.point}
              >
                <div className="toolContainer">
                  <FiSun />
                </div>
                <div className="buttonLabel">
                  <span>Point</span>
                </div>
              </div>
              <div
                id="line"
                tabIndex="2"
                className="toolbarSectionButton"
                onClick={() => this.setToolActiveForElement("Length")}
              >
                <div className="toolContainer">
                  <FiSun />
                </div>
                <div className="buttonLabel">
                  <span>Line</span>
                </div>
              </div>
              <div
                id="ellipse"
                tabIndex="3"
                className="toolbarSectionButton"
                onClick={() => this.setToolActiveForElement("EllipticalRoi")}
              >
                <div className="toolContainer">
                  <FiSun />
                </div>
                <div className="buttonLabel">
                  <span>Ellipse</span>
                </div>
              </div>
              <div
                id="rectangle"
                tabIndex="4"
                className="toolbarSectionButton"
                onClick={() => this.setToolActiveForElement("RectangleRoi")}
              >
                <div className="toolContainer">
                  <FiSun />
                </div>
                <div className="buttonLabel">
                  <span>Rectangle</span>
                </div>
              </div>
              <div
                id="polygon"
                tabIndex="5"
                className="toolbarSectionButton"
                onClick={() => this.setToolActiveForElement("FreehandMouse")}
              >
                <div className="toolContainer">
                  <FiSun />
                </div>
                <div className="buttonLabel">
                  <span>Polygon</span>
                </div>
              </div>
              <div
                id="spline"
                tabIndex="6"
                className="toolbarSectionButton"
                onClick={this.spline}
              >
                <div className="toolContainer">
                  <FiSun />
                </div>
                <div className="buttonLabel">
                  <span>Spline</span>
                </div>
              </div>
              <div
                id="perpendicular"
                tabIndex="7"
                className="toolbarSectionButton"
                onClick={() => this.setToolActiveForElement("Bidirectional")}
              >
                <div className="icon-perpendicular" />
                <div className="buttonLabel">
                  <span>Perpendicular</span>
                </div>
              </div>
              <div
                id="brush"
                tabIndex="8"
                className="toolbarSectionButton"
                onClick={() => this.setToolActiveForElement("Brush")}
              >
                <div className="icon-brush" />
                <div className="buttonLabel">
                  <span>Brush</span>
                </div>
              </div>
            </div>
          </Draggable>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Toolbar);
