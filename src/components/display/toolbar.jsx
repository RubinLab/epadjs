import React, { Component } from "react";
import { connect } from "react-redux";
import MetaData from "./metaData";
import Draggable from "react-draggable";
import { WindowLevel } from "./WindowLevel";
import {
  FaLocationArrow,
  FaEraser,
  FaAdjust,
  FaList,
  FaListAlt,
  FaRegFolderOpen,
  FaRulerHorizontal,
  FaScrewdriver,
  FaPlayCircle,
  FaStopCircle
} from "react-icons/fa";
import { FiSun, FiSunset, FiZoomIn, FiRotateCw } from "react-icons/fi";
import { MdLoop, MdPanTool } from "react-icons/md";
import { TiDeleteOutline, TiPencil } from "react-icons/ti";
import { MdWbIridescent } from "react-icons/md";
import AnnotationList from "../annotationsList";
import ResizeAndDrag from "../management/common/resizeAndDrag";
import CustomModal from "../management/common/resizeAndDrag";
import {
  showAnnotationWindow,
  showAnnotationDock,
  getWholeData
} from "../annotationsList/action";
import Spinner from "../common/spinner";
import "./toolbar.css";
import "../../font-icons/styles.css";

const mapStateToProps = state => {
  return {
    cornerstone: state.searchViewReducer.cornerstone,
    cornerstoneTools: state.searchViewReducer.cornerstoneTools,
    activeVP: state.annotationsListReducer.activePort,
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    patientLoading: state.annotationsListReducer.patientLoading,
    listOpen: state.annotationsListReducer.listOpen
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
    }
  },
  {
    name: "CircleRoi",
    configuration: {
      showMinMax: true
    }
  },
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  { name: "Probe" },
  {
    name: "FreehandMouse",
    configuration: {
      showMinMax: true
      // showHounsfieldUnits: true
    }
  },
  { name: "Eraser" },
  { name: "Bidirectional" },
  { name: "Brush" },
  { name: "FreehandSculpterMouse" }
];

class Toolbar extends Component {
  //Tools are initialized in viewport.jsx since they are activated on elements. I don't really like this logic, we shall think of a better way.

  constructor(props) {
    super(props);
    this.tools = tools;
    this.cornerstone = this.props.cornerstone;
    this.cornerstoneTools = this.props.cornerstoneTools;

    this.state = {
      activeTool: "",
      showDrawing: false,
      showPresets: false,
      playing: false
    };
  }

  //TODO: instead of disabling all tools we can just disable the active tool
  disableAllTools = () => {
    Array.from(this.tools).forEach(tool => {
      const apiTool = this.cornerstoneTools[`${tool.name}Tool`];
      if (apiTool) {
        this.cornerstoneTools.setToolPassive(tool.name);
      } else {
        throw new Error(`Tool not found: ${tool.name}Tool`);
      }
    });
  };

  //sets the selected tool active for all of the enabled elements
  setToolActive = (toolName, mouseMask = 1) => {
    this.disableAllTools();
    this.cornerstoneTools.setToolActive(toolName, {
      mouseButtonMask: mouseMask
    });
  };

  //sets the selected tool active for an enabled elements
  setToolActiveForElement = (toolName, mouseMask = 1) => {
    this.disableAllTools();
    this.cornerstoneTools.setToolActiveForElement(
      this.cornerstone.getEnabledElements()[this.props.activeVP]["element"],
      toolName,
      {
        mouseButtonMask: mouseMask
      }
    );
    this.setState({ showDrawing: false });
  };

  handlePatientClick = async () => {
    // const showStatus = this.state.showAnnotationList;

    const { openSeries, patients } = this.props;
    for (let port of openSeries) {
      const { patientID, seriesUID, studyUID, aimID } = port;

      const serie = patients[patientID].studies[studyUID].series[seriesUID];
      if (!patients[port.patientID]) {
        await this.props.dispatch(getWholeData(port, null, aimID));
      } else {
        if (serie.isDisplayed === false) {
          serie.isDisplayed = true;
          for (let ann in serie.annotations) {
            serie.annotations[ann].isDisplayed = true;
          }
        }
      }
    }

    await this.setState(state => ({
      showAnnotationList: !state.showAnnotationList
    }));
    this.props.dispatch(showAnnotationWindow());
  };

  handleAnnotationsDockClick = async () => {
    // const showStatus = this.state.showAnnotationList;
    await this.setState(state => ({
      dockOpen: !state.dockOpen
    }));
    this.props.dispatch(showAnnotationDock());
  };

  invert = () => {
    const activeElement = this.cornerstone.getEnabledElements()[
      this.props.activeVP
    ].element;
    const viewport = this.cornerstone.getViewport(activeElement);
    viewport.invert = !viewport.invert;
    this.cornerstone.setViewport(activeElement, viewport);
  };

  reset = () => {
    const element = this.cornerstone.getEnabledElements()[this.props.activeVP]
      .element;
    this.props.cornerstone.reset(element);
  };

  toggleMetaData = () => {
    this.disableAllTools();
    // this.state.activeElement.style.display = "block";
  };

  anotate = () => {
    this.setState({ showDrawing: !this.state.showDrawing });
  };

  handleClip = () => {
    const element = this.cornerstone.getEnabledElements()[this.props.activeVP]
      .element;
    if (!this.state.playing) this.cornerstoneTools.playClip(element, 40);
    else this.cornerstoneTools.stopClip(element);
    this.setState({ playing: !this.state.playing });
  };

  showPresets = () => {
    this.setState({ showPresets: !this.state.showPresets });
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
        <div
          id="preset"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.showPresets}
        >
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
          id="palyClip"
          tabIndex="10"
          className="toolbarSectionButton"
          onClick={this.anotate}
        >
          <div className="toolContainer">
            <TiPencil />
          </div>
          <div className="buttonLabel">
            <span>Annotate</span>
          </div>
        </div>
        <div
          id="drawing"
          tabIndex="11"
          className="toolbarSectionButton"
          onClick={this.handleClip}
        >
          <div className="toolContainer">
            {(!this.state.playing && <FaPlayCircle />) ||
              (this.state.playing && <FaStopCircle />)}
          </div>
          <div className="buttonLabel">
            <span>
              {(!this.state.playing && "Play") ||
                (this.state.playing && "Stop")}
            </span>
          </div>
        </div>
        <div
          tabIndex="12"
          className="toolbarSectionButton"
          onClick={this.handlePatientClick}
        >
          {this.props.patientLoading ? (
            <Spinner loading={this.props.patientLoading} unit="rem" size={3} />
          ) : (
            <>
              <div className="toolContainer">
                <FaRegFolderOpen />
              </div>
              <div className="buttonLabel">
                <span>Patient</span>
              </div>
            </>
          )}
        </div>
        <div
          tabIndex="13"
          className="toolbarSectionButton"
          onClick={this.handleAnnotationsDockClick}
        >
          <div className="toolContainer">
            <FaList />
          </div>
          <div className="buttonLabel">
            <span>Annotations</span>
          </div>
        </div>

        {/* Drawing Bar Starts here. Extract it to another component later  */}
        {this.state.showDrawing && (
          <Draggable>
            <div className="drawBar">
              <TiDeleteOutline onClick={this.anotate} />

              <div
                id="point"
                tabIndex="1"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("Probe")}
              >
                <div className="icon-point fontastic-icons" />
                <div className="buttonLabel">
                  <span>Point</span>
                </div>
              </div>
              <div
                id="line"
                tabIndex="2"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("Length")}
              >
                <div className="toolContainer">
                  <FaRulerHorizontal />
                </div>
                <div className="buttonLabel">
                  <span>Length</span>
                </div>
              </div>
              {/* <div
                id="ellipse"
                tabIndex="3"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("CircleRoi")}
              >
                <div className="icon-ellipse fontastic-icons" />
                <div className="buttonLabel">
                  <span>Ellipse</span>
                </div>
              </div> */}
              <div
                id="circle"
                tabIndex="3"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("CircleRoi")}
              >
                <div className="icon-circle fontastic-icons" />
                <div className="buttonLabel">
                  <span>Circle</span>
                </div>
              </div>
              {/* <div
                id="rectangle"
                tabIndex="4"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("RectangleRoi")}
              >
                <div className="icon-rectangle fontastic-icons" />
                <div className="buttonLabel">
                  <span>Rectangle</span>
                </div>
              </div> */}
              <div
                id="polygon"
                tabIndex="5"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("FreehandMouse")}
              >
                <div className="icon-polygon fontastic-icons" />
                <div className="buttonLabel">
                  <span>Poly/Freehand</span>
                </div>
              </div>
              <div
                id="sculpter"
                tabIndex="6"
                className="drawingSectionButton"
                onClick={() =>
                  this.setToolActiveForElement("FreehandSculpterMouse")
                }
              >
                <div className="toolContainer">
                  <FaScrewdriver />
                </div>
                <div className="buttonLabel">
                  <span>Sculpt</span>
                </div>
              </div>
              <div
                id="perpendicular"
                tabIndex="7"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("Bidirectional")}
              >
                <div className="icon-perpendicular fontastic-icons" />
                <div className="buttonLabel">
                  <span>Perpendicular</span>
                </div>
              </div>
              <div
                id="brush"
                tabIndex="8"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("Brush")}
              >
                <div className="icon-brush" />
                <div className="buttonLabel">
                  <span>Brush</span>
                </div>
              </div>
              <div
                id="line"
                tabIndex="9"
                className="drawingSectionButton"
                onClick={() => this.setToolActiveForElement("Eraser")}
              >
                <div className="toolContainer">
                  <FaEraser />
                </div>
                <div className="buttonLabel">
                  <span>Eraser</span>
                </div>
              </div>
            </div>
          </Draggable>
        )}
        {this.state.showPresets && (
          <WindowLevel
            cornerstone={this.props.cornerstone}
            activeElement={
              this.cornerstone.getEnabledElements()[this.props.activeVP][
                "element"
              ]
            }
            onClose={this.showPresets}
          />
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Toolbar);
