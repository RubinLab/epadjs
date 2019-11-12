import React, { Component } from "react";
import { connect } from "react-redux";
import MetaData from "../MetaData/MetaData";
import { WindowLevel } from "../WindowLevel/WindowLevel";
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
  FaStopCircle,
  FaBroom,
  FaAngleRight,
  FaHandScissors,
  FaCut,
  FaCircle
} from "react-icons/fa";
import { FiSun, FiSunset, FiZoomIn, FiRotateCw } from "react-icons/fi";
import { MdLoop, MdPanTool } from "react-icons/md";
import { TiDeleteOutline, TiPencil, TiScissorsOutline } from "react-icons/ti";
import { MdWbIridescent } from "react-icons/md";
import AnnotationList from "../annotationsList";
import ResizeAndDrag from "../management/common/resizeAndDrag";
import CustomModal from "../management/common/resizeAndDrag";
import {
  showAnnotationWindow,
  showAnnotationDock,
  getWholeData
} from "../annotationsList/action";
import Spinner from "../common/circleSpinner";
import "../../font-icons/styles.css";
import "react-input-range/lib/css/index.css";
import Collapsible from "react-collapsible";
import "./ToolMenu.css";
import InputRange from "react-input-range";
import Switch from "react-switch";
import ToolMenuItem from "../ToolMenu/ToolMenuItem";

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
  { name: "Bidirectional" },
  { name: "Eraser" }

  // { name: "FreehandRoi3D" },
  // { name: "FreehandRoi3DSculptor" },
  // { name: "Brush3D" },
  // { name: "Brush3DHUGated" },
  // { name: "Brush3DAutoGated" }
];

class ToolMenu extends Component {
  //Tools are initialized in viewport.jsx since they are activated on elements. I don't really like this logic, we shall think of a better way.

  constructor(props) {
    super(props);
    this.tools = tools;
    this.cornerstone = this.props.cornerstone;
    this.cornerstoneTools = this.props.cornerstoneTools;
    this.invert = this.invert.bind(this);

    this.state = {
      showDrawing: false,
      showSegmentation: false,
      showPresets: false,
      playing: false,
      customBrush: {
        min: -1000,
        max: 3000
      },
      rangeDisabled: true,
      interpolate: false,
      activeToolIdx: 0
    };

    this.imagingTools = [
      { name: "No Op", icon: <FaLocationArrow /> },
      { name: "Levels", icon: <FiSun />, tool: "Wwwc" },
      { name: "Presets", icon: <FiSunset />, tool: "Presets" },
      { name: "Zoom", icon: <FiZoomIn />, tool: "Zoom" },
      { name: "Invert", icon: <FaAdjust />, tool: "Invert" },
      { name: "Reset", icon: <MdLoop />, tool: "Reset" },
      { name: "Pan", icon: <MdPanTool />, tool: "Pan" },
      { name: "SeriesData", icon: <FaListAlt />, tool: "MetaData" },
      { name: "Rotate", icon: <FiRotateCw />, tool: "Rotate" },
      { name: "Region", icon: <FaListAlt />, tool: "WwwcRegion" }
    ];

    this.markupTools = [
      {
        name: "Point",
        icon: <div className="icon-point fontastic-icons" />,
        tool: "Probe"
      },
      {
        name: "Line",
        icon: <FaRulerHorizontal />,
        tool: "Length"
      },
      {
        name: "Circle",
        icon: <div className="icon-circle fontastic-icons" />,
        tool: "CircleRoi"
      },
      {
        name: "Perpendicular",
        icon: <div className="icon-perpendicular fontastic-icons" />,
        tool: "Bidirectional"
      },
      {
        name: "Poly/Freehand",
        icon: <div className="icon-polygon fontastic-icons" />,
        tool: "Presets",
        tool: "FreehandRoi3D",
        child: (
          <span>
            Interpolation{" "}
            <Switch
              onChange={this.setInterpolation}
              checked={this.state.interpolate}
              onColor="#86d3ff"
              onHandleColor="#2693e6"
              handleDiameter={10}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={5}
              width={20}
              className="react-switch"
              id="material-switch"
            />
          </span>
        )
      },
      {
        name: "Sculpt",
        icon: <FaScrewdriver />,
        tool: "FreehandRoi3DSculptor"
      },
      { name: "Eraser", icon: <FaEraser />, tool: "Eraser" }
    ];

    this.segmentationTools = [
      { name: "Brush", icon: <div className="icon-brush" />, tool: "Brush" },
      {
        name: "Brush HU Gated",
        icon: <FaBroom />,
        tool: "Brush3DHUGated"
      },
      {
        name: "Freehand Scissors",
        icon: <FaHandScissors />,
        tool: "FreehandScissors"
      },
      { name: "Circle Scissors", icon: <FaCircle />, tool: "CircleScissors" },
      {
        name: "Correction Scissors",
        icon: <TiScissorsOutline />,
        tool: "CorrectionScissors"
      }
    ];
  }

  //TODO: instead of disabling all tools we can just disable the active tool
  disableAllTools = () => {
    this.setState({ activeToolIdx: 0 });
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
    // this.disableAllTools();
    this.cornerstoneTools.setToolActive(toolName, {
      mouseButtonMask: mouseMask
    });
  };

  //sets the selected tool active for an enabled elements
  setToolActiveForElement = (toolName, mouseMask = 1) => {
    this.disableAllTools();
    console.log("CStools", this.cornerstoneTools);
    if (toolName == "Brush3DHUGatedTool") {
      this.cornerstoneTools.store.modules.brush.setters.activeGate("muscle");
    }
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

  invert() {
    const activeElement = this.cornerstone.getEnabledElements()[
      this.props.activeVP
    ].element;
    const viewport = this.cornerstone.getViewport(activeElement);
    viewport.invert = !viewport.invert;
    this.cornerstone.setViewport(activeElement, viewport);
  }

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

  closeSegmentationMenu = () => {
    this.setState({ showSegmentation: false });
  };

  handleBrushChange = gateName => {
    alert("hop");
    if (gateName === "custom") this.setState({ rangeDisabled: false });
    else this.setState({ rangeDisabled: true });
    this.cornerstoneTools.store.modules.segmentation.setters.activeGate(
      gateName
    );
  };

  applyCustomBrushValues = values => {
    const { min, max } = values;
    this.cornerstoneTools.store.modules.segmentation.customGateRange(min, max);
  };

  setInterpolation = checked => {
    this.setState({ interpolate: checked });
    this.cornerstoneTools.store.modules.freehand3D.state.interpolate = this.state.interpolate;
  };

  handleToolClicked = (index, tool) => {
    this.disableAllTools();
    if (tool === "Noop") {
      this.setState({ activeToolIdx: index });
      return;
    } else if (tool === "Presets") this.showPresets();
    else if (tool === "Invert") this.invert();
    else if (tool === "Reset") this.reset();
    else if (tool === "MetaData") this.toggleMetaData();
    else {
      this.setState({ activeToolIdx: index }, () => {
        this.setToolActive(tool);
      });
    }
  };

  render() {
    console.log("Cs Tools", this.cornerstoneTools);
    const inputRange = {
      top: "5em"
    };
    const brushModule = this.cornerstoneTools.store.modules.segmentation;
    return (
      <div className="toolbar">
        <Collapsible trigger={"Imaging Tools"} transitionTime={100}>
          {this.imagingTools.map((imagingTool, i) => {
            return (
              <ToolMenuItem
                key={imagingTool.name}
                name={imagingTool.name}
                icon={imagingTool.icon}
                index={i}
                isActive={this.state.activeToolIdx === i}
                onClick={() => this.handleToolClicked(i, imagingTool.tool)}
              />
            );
          })}

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
              <Spinner
                loading={this.props.patientLoading}
                unit="rem"
                size={3}
              />
            ) : (
              <>
                <div className="toolContainer patient-icon">
                  <FaRegFolderOpen />
                </div>
                <div className="buttonLabel">
                  <span>Patient</span>
                </div>
              </>
            )}
          </div>
        </Collapsible>
        <Collapsible trigger={"Markup Tools"} transitionTime={100}>
          {this.markupTools.map((markupTool, i) => {
            i = i + this.imagingTools.length;
            return (
              <ToolMenuItem
                key={markupTool.name}
                name={markupTool.name}
                icon={markupTool.icon}
                index={i}
                isActive={this.state.activeToolIdx === i}
                onClick={() => this.handleToolClicked(i, markupTool.tool)}
              />
            );
          })}
          {/* <div
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
              </div> 
                    <div
                        id="circle"
                        tabIndex="3"
                        className="drawingSectionButton"
                        onClick={() => this.setToolActive("CircleRoi")}
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
              </div> 
                    <div
                        id="polygon"
                        tabIndex="5"
                        className="drawingSectionButton"
                        onClick={() => this.setToolActiveForElement("FreehandRoi3D")}
                    >
                        <div className="icon-polygon fontastic-icons" />
                        <div className="buttonLabel">
                            <span>Poly/Freehand</span>
                            <br />
                            <span>
                                Interpolation{" "}
                                <Switch
                                    onChange={this.setInterpolation}
                                    checked={this.state.interpolate}
                                    onColor="#86d3ff"
                                    onHandleColor="#2693e6"
                                    handleDiameter={10}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                    height={5}
                                    width={20}
                                    className="react-switch"
                                    id="material-switch"
                                />
                            </span>
                        </div>
                    </div>
                    <div
                        id="sculpter"
                        tabIndex="6"
                        className="drawingSectionButton"
                        onClick={() =>
                            this.setToolActiveForElement("FreehandRoi3DSculptor")
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
                    </div> */}
        </Collapsible>
        <Collapsible trigger={"Segmentation Tools"} transitionTime={100}>
          {this.segmentationTools.map((segmentationTool, i) => {
            i = i + this.imagingTools.length + this.markupTools.length;
            return (
              <ToolMenuItem
                key={segmentationTool.name}
                name={segmentationTool.name}
                icon={segmentationTool.icon}
                index={i}
                isActive={this.state.activeToolIdx === i}
                onClick={() => this.handleToolClicked(i, segmentationTool.tool)}
              />
            );
          })}
          {/* <div
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
                        id="brush"
                        tabIndex="9"
                        className="drawingSectionButton"
                        onClick={() => {
                            this.setToolActiveForElement("Brush3DHUGated");
                        }}
                        onMouseOver={() => {
                            this.setState({ showSegmentation: true });
                        }}
                    >
                        <FaBroom />
                        <div className="buttonLabel">
                            <span>
                                Brush HU Gated <FaAngleRight />
                            </span>
                        </div>
                    </div> */}
          {/* <div
                id="brush"
                tabIndex="10"
                className="drawingSectionButton"
                onClick={() =>
                  this.setToolActiveForElement("Brush3DAutoGatedTool")
                }
              >
                <div className="icon-brush" />
                <div className="buttonLabel">
                  <span>Brush Auto Gated</span>
                </div>
              </div> */}
          {/* <div
                        id="freehandScisssors"
                        tabIndex="9"
                        className="drawingSectionButton"
                        onClick={() => this.setToolActiveForElement("FreehandScissors")}
                    >
                        <div className="toolContainer">
                            <FaHandScissors />
                        </div>
                        <div className="buttonLabel">
                            <span>Freehand Scissors</span>
                        </div>
                    </div>
                    <div
                        id="circleScissors"
                        tabIndex="10"
                        className="drawingSectionButton"
                        onClick={() => this.setToolActiveForElement("CircleScissors")}
                    >
                        <div className="toolContainer">
                            <FaCircle />
                        </div>
                        <div className="buttonLabel">
                            <span>Circle Scissors</span>
                        </div>
                    </div>
                    <div
                        id="correctionScissors"
                        tabIndex="11"
                        className="drawingSectionButton"
                        onClick={() => this.setToolActiveForElement("CorrectionScissors")}
                    >
                        <div className="toolContainer">
                            <TiScissorsOutline />
                        </div>
                        <div className="buttonLabel">
                            <span>Correction Scissors</span>
                        </div>
                    </div>
                    <div
                        id="eraser"
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
                    </div> */}

          {/* <div
                        className="segmentation-menu"
                    // onMouseLeave={() => this.closeSegmentationMenu()}
                    >
                        <div className="buttonLabel">
                            <span>Preset Brushes</span>
                        </div>
                        <div className="brush-presets">
                            {brushModule.state.gates.map((gate, i) => (
                                <div key={i}>
                                    <input
                                        type="radio"
                                        name="brushPresets"
                                        value={gate.name}
                                        onChange={() => this.handleBrushChange(gate.name)}
                                        defaultChecked={
                                            gate.name === brushModule.getters.activeGate()
                                        }
                                    />
                                    {gate.name !== "custom" &&
                                        " " +
                                        gate.displayName +
                                        " [" +
                                        gate.range.toString() +
                                        "]" +
                                        " HU"}
                                    {gate.name === "custom" &&
                                        " " +
                                        gate.displayName +
                                        " [" +
                                        this.state.customBrush.min +
                                        ", " +
                                        this.state.customBrush.max +
                                        "]" +
                                        " HU"}
                                    {gate.name === "custom" && (
                                        <div className="range-container">
                                            <InputRange
                                                style={inputRange}
                                                disabled={this.state.rangeDisabled}
                                                step={1}
                                                maxValue={3000}
                                                minValue={-1000}
                                                // formatLabel={value => `${value} HU`}
                                                value={this.state.customBrush}
                                                onChange={value =>
                                                    this.setState({ customBrush: value })
                                                }
                                                onChangeComplete={value =>
                                                    this.applyCustomBrushValues(value)
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div> */}
        </Collapsible>

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

export default connect(mapStateToProps)(ToolMenu);
