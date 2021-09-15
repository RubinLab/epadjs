import React, { Component } from "react";
import { connect } from "react-redux";
import MetaData from "../MetaData/MetaData";
import SmartBrushMenu from "../SmartBrushMenu/SmartBrushMenu";
import BrushSizeSelector from "./BrushSizeSelector";
import { WindowLevel } from "../WindowLevel/WindowLevel";
import ColormapSelector from "./ColormapSelector";
import FuseSelector from "./FuseSelector";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
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
  FaCircle,
  FaMousePointer,
  FaPalette,
  FaObjectUngroup,
  FaDotCircle
} from "react-icons/fa";
import { FiSun, FiSunset, FiZoomIn, FiRotateCw } from "react-icons/fi";
import { IoMdEgg } from "react-icons/io";
import { MdLoop, MdPanTool } from "react-icons/md";
import {
  TiDeleteOutline,
  TiPencil,
  TiScissorsOutline,
  TiEject,
} from "react-icons/ti";
import { MdWbIridescent } from "react-icons/md";
import AnnotationList from "../annotationsList";
import ResizeAndDrag from "../management/common/resizeAndDrag";
import CustomModal from "../management/common/resizeAndDrag";
import {
  showAnnotationWindow,
  showAnnotationDock,
  getWholeData,
} from "../annotationsList/action";
import Spinner from "../common/circleSpinner";
import "../../font-icons/styles.css";
import "react-input-range/lib/css/index.css";
import Collapsible from "react-collapsible";
import "./ToolMenu.css";
import ToolMenuItem from "../ToolMenu/ToolMenuItem";
import Interpolation from "./Interpolation";

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    patientLoading: state.annotationsListReducer.patientLoading,
    activePort: state.annotationsListReducer.activePort,
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
      preventZoomOutsideImage: true,
    },
  },
  { name: "Probe" },
  { name: "Length" },
  {
    name: "FreehandRoi",
    configuration: {
      showMinMax: true,
    },
  },
  { name: "FreehandRoiSculptor" },
  {
    name: "CircleRoi",
    configuration: {
      showMinMax: true,
    },
  },
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  { name: "Probe" },
  { name: "Bidirectional" },
  { name: "Eraser" },

  { name: "FreehandRoi3DTool" },
  { name: "FreehandRoi3DSculptor" },
  { name: "Brush3D" },
  { name: "SphericalBrush" },
  { name: "Brush3DHUGated" },
  { name: "BrushSphericalHUGated" },
  { name: "Brush3DAutoGated" },
];

class ToolMenu extends Component {
  //Tools are initialized in viewport.jsx since they are activated on elements. I don"t really like this logic, we shall think of a better way.

  constructor(props) {
    super(props);
    this.tools = tools;
    this.invert = this.invert.bind(this);

    this.state = {
      showDrawing: false,
      showBrushMenu: false,
      showPresets: false,
      showMetaData: false,
      playing: false,
      customBrush: {
        min: -1000,
        max: 3000,
      },
      showBrushSize: false,
      showSmartBrush: false,
      rangeDisabled: true,
      showInterpolation: false,
      activeTool: "",
      activeToolIdx: 0,
      fuse: false
    };

    this.imagingTools = [
      { name: "Select", icon: <FaMousePointer />, tool: "Noop" },
      { name: "Levels", icon: <FiSun />, tool: "Wwwc" },
      { name: "Presets", icon: <FiSunset />, tool: "Presets" },
      { name: "Zoom", icon: <FiZoomIn />, tool: "Zoom" },
      // { name: "Invert", icon: <FaAdjust />, tool: "Invert" },
      { name: "Reset", icon: <MdLoop />, tool: "Reset" },
      { name: "Pan", icon: <MdPanTool />, tool: "Pan" },
      { name: "MetaData", icon: <FaListAlt />, tool: "MetaData" },
      { name: "Rotate", icon: <FiRotateCw />, tool: "Rotate" },
      { name: "Region", icon: <FaListAlt />, tool: "WwwcRegion" },
      { name: "Color", icon: <FaPalette />, tool: "colorLut" },
      { name: "Fusion", icon: <FaObjectUngroup />, tool: "fuse" },
    ];

    this.markupTools = [
      {
        name: "Point",
        icon: <div className="icon-point fontastic-icons" />,
        tool: "Probe",
      },
      {
        name: "Line",
        icon: <FaRulerHorizontal />,
        tool: "Length",
      },
      {
        name: "Circle",
        icon: <div className="icon-circle fontastic-icons" />,
        tool: "CircleRoi",
      },
      {
        name: "Perpendicular",
        icon: <div className="icon-perpendicular fontastic-icons" />,
        tool: "Bidirectional",
      },
      {
        name: "Poly/Freehand",
        icon: <div className="icon-polygon fontastic-icons" />,
        tool: "FreehandRoi3DTool",
        // child: (
        //   <span>
        //     Interpolation{" "}
        //     <Switch
        //       onChange={this.setInterpolation}
        //       checked={this.state.interpolate}
        //       onColor="#86d3ff"
        //       onHandleColor="#2693e6"
        //       handleDiameter={10}
        //       uncheckedIcon={false}
        //       checkedIcon={false}
        //       boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
        //       activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
        //       height={5}
        //       width={20}
        //       className="react-switch"
        //       id="material-switch"
        //     />
        //   </span>
        // ),
      },
      {
        name: "Sculpt 2D",
        icon: <FaScrewdriver />,
        tool: "FreehandRoiSculptor",
      },
      {
        name: "Sculpt 3D",
        icon: <FaScrewdriver />,
        tool: "FreehandRoi3DSculptor",
      },
      { name: "Eraser", icon: <FaEraser />, tool: "Eraser" },
    ];

    this.segmentationTools = [
      // {
      //   name: "Brush",
      //   icon: <div className="icon-brush" />,
      //   tool: "Brush3D",
      // },
      // {
      //   name: "Gated",
      //   icon: <FaBroom />,
      //   tool: "Brush3DHUGated",
      // },
      // {
      //   name: "Spherical Gated",
      //   icon: <FaDotCircle />,
      //   tool: "BrushSphericalHUGated",
      // },
      // {
      //   name: "Auto Gated",
      //   icon: <FaBroom />,
      //   tool: "Brush3DAutoGated",
      // },
      // {
      //   name: "Spherical",
      //   icon: <IoMdEgg />,
      //   tool: "SphericalBrush",
      // },
      // {
      //   name: "Freehand Scissors",
      //   icon: <FaHandScissors />,
      //   tool: "FreehandScissors"
      // },
      // { name: "Circle Scissors", icon: <FaCircle />, tool: "CircleScissors" },
      // {
      //   name: "Correction Scissors",
      //   icon: <TiScissorsOutline />,
      //   tool: "CorrectionScissors"
      // }
    ];
  }

  componentWillUnmount() {
    sessionStorage.removeItem("activeTool");
  }

  //TODO: instead of disabling all tools we can just disable the active tool
  disableAllTools = () => {
    const { activeTool } = this.state;
    if (activeTool) {
      if (activeTool === "FreehandRoiTool" || activeTool === "FreehandRoi3DTool") {
        this.deselectFreehand();
      }
      this.setToolStateForAllElements(this.state.activeTool, "passive");
      this.setState({ activeToolIdx: 0 });
      this.setCursor("default");
    }

    // Array.from(this.tools).forEach((tool) => {
    //   if (tool !== "FreehandRoiSculptor")
    //     this.setToolStateForAllElements(tool.name, "passive");
    //   // const apiTool = cornerstoneTools[`${tool.name}Tool`];
    //   // if (apiTool) {
    //   //   cornerstoneTools.setToolPassive(tool.name);
    //   // } else {
    //   //   throw new Error(`Tool not found: ${tool.name}Tool`);
    //   // }
    // });
  };

  setToolStateForAllElements = (toolName, state, mouseMask = 1) => {
    const enabledElements = cornerstone.getEnabledElements();

    enabledElements.forEach(({ element }) => {
      if (state === "passive")
        cornerstoneTools.setToolPassiveForElement(element, toolName);
      else
        cornerstoneTools.setToolActiveForElement(element, toolName, {
          mouseButtonMask: mouseMask,
        });
    });
  };

  //sets the selected tool active for all of the enabled elements
  setToolActive = (toolName, mouseMask = 1) => {
    cornerstoneTools.setToolActive(toolName, {
      mouseButtonMask: mouseMask,
    });
  };

  handleToolClicked = (index, tool) => {
    if (tool === "Noop") {
      this.disableAllTools();
      this.setState({ activeTool: "", activeToolIdx: index });
      return;
    } else if (tool === "Presets") {
      this.showPresets();
      return;
    } else if (tool === "Invert") {
      this.invert();
      return;
    } else if (tool === "Reset") {
      this.reset();
      return;
    } else if (tool === "MetaData") {
      this.showMetaData();
      return;
      // } else if (index === 14) {
      //   this.setInterpolation(!this.state.interpolate);
      // this should not return to set polygon tool active
    } else if (tool === "Brush3D" || tool === "SphericalBrush") {
      if (this.checkIfMultiframe()) {
        alert("Segmentation only works in singleframe images!");
        return;
      } //Dont" select the HUGated if the modality is not CT
      this.setState({ showBrushSize: true });
    } else if (tool === "Brush3DHUGated") {
      if (this.checkIfMultiframe()) { alert("Segmentation tools only works with singleframe images"); return; }
      this.setState({ showBrushSize: true, isHuGated: true, showSmartBrush: true, isSpherical: false });
    } else if (tool === "BrushSphericalHUGated") {
      if (this.checkIfMultiframe()) { alert("Segmentation tools only works with singleframe images"); return; }
      this.setState({ showBrushSize: true, isHuGated: true, showSmartBrush: true, isSpherical: true });
    } else if (tool === "Brush3DAutoGated") {
      if (this.checkIfMultiframe()) { alert("Segmentation tools only works with singleframe images"); return; }
      this.setState({ showBrushSize: true, isHuGated: false, showSmartBrush: true, isSpherical: false });
    } else if (tool === "FreehandRoi3DTool") {
      this.selectFreehand();
      this.setState({ showInterpolation: true });
    } else if (tool === "colorLut") {
      this.setState({ showColormap: true });
      return;
    } else if (tool === "fuse") {
      this.setState({ showFuse: true });
      return;
      this.selectFreehand();
    }
    // else if (tool === "FreehandRoiTool") {
    //   this.selectFreehand();
    // }

    this.disableAllTools();
    this.setState({ activeTool: tool, activeToolIdx: index }, () => {
      this.setToolStateForAllElements(tool, "active");
    });
    sessionStorage.setItem("activeTool", tool);
  };

  selectFreehand = () => {
    window.addEventListener('escPressed', this.cancelPolygon);
  }

  deselectFreehand = () => {
    window.removeEventListener('escPressed', this.cancelPolygon);
  }

  cancelPolygon = () => {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    let tools = cornerstoneTools.store.state.tools;

    tools = tools.filter(tool => tool.element === element && tool.mode === 'active');
    tools = tools.filter(tool => (tool.name === "FreehandRoi3DTool"));
    tools[0].cancelDrawing(element);
  }

  getActiveImage = () => {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    return cornerstone.getImage(element);
  };

  // checkIfCT = () => {
  //   const image = this.getActiveImage();
  //   const seriesModule =
  //     cornerstone.metaData.get("generalSeriesModule", image.imageId) || {};
  //   const modality = seriesModule.modality;
  //   if (modality === "CT") return true;
  //   return false;
  // };

  checkIfMultiframe = () => {
    const image = this.getActiveImage();
    if (image.data.string("x00280008")) return true;
    return false;
  };

  invert() {
    const activeElement = cornerstone.getEnabledElements()[
      this.props.activePort
    ].element;
    const viewport = cornerstone.getViewport(activeElement);
    viewport.invert = !viewport.invert;
    cornerstone.setViewport(activeElement, viewport);
  }

  reset = () => {
    const element = cornerstone.getEnabledElements()[this.props.activePort]
      .element;
    const layers = cornerstone.getLayers(element);
    if (layers.length)
      this.resetRenderCanvas(element);
    cornerstone.reset(element);
  };

  resetRenderCanvas = (element) => {
    const enabledElement = cornerstone.getEnabledElement(element);

    enabledElement.renderingTools.colormapId = undefined;
    enabledElement.renderingTools.colorLut = undefined;

    const renderCanvas = enabledElement.renderingTools.renderCanvas;
    const canvasContext = renderCanvas.getContext('2d');

    // NOTE - we need to fill the render canvas with white pixels since we 
    // control the luminance using the alpha channel to improve rendering performance. 
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

    const renderCanvasData = canvasContext.getImageData(0, 0, renderCanvas.width, renderCanvas.height);

    enabledElement.renderingTools.renderCanvasContext = canvasContext;
    enabledElement.renderingTools.renderCanvasData = renderCanvasData;
  }

  showMetaData = () => {
    this.setState({ showMetaData: !this.state.showMetaData });
  };

  handleClip = () => {
    const element = cornerstone.getEnabledElements()[this.props.activePort]
      .element;
    if (!this.state.playing) cornerstoneTools.playClip(element, 40);
    else cornerstoneTools.stopClip(element);
    this.setState({ playing: !this.state.playing });
  };

  showPresets = () => {
    this.setState({ showPresets: !this.state.showPresets });
  };

  setCursor = (cursorStyle) => {
    const elements = cornerstone.getEnabledElements();
    elements.forEach(({ element }) => {
      element.style.cursor = cursorStyle;
    })
  };

  closeBrushSize = () => {
    this.setState({ showBrushSize: false });
  };

  closeSmartBrushMenu = () => {
    this.setState({ showSmartBrush: false });
  };

  showInterpolation = () => {
    this.setState({ showInterpolation: false });
  };

  closeColormap = () => {
    this.setState({ showColormap: false });
  }

  closeFuse = () => {
    this.setState({ showFuse: false });
  }

  render() {
    const { activeTool } = this.state;
    if (activeTool !== undefined && activeTool !== "" && activeTool !== "FreehandRoiSculptor")
      this.setToolStateForAllElements(activeTool, "active");
    return (
      <div className="toolbar">
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

        {this.state.showMetaData && (<MetaData onClose={this.showMetaData} />)}
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
              children={markupTool.child}
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
        {/* </Collapsible> */}
        {/* <Collapsible trigger={"Segmentation Tools"} transitionTime={100}> */}
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
        {/* </Collapsible> */}
        {(this.state.activeTool === "Brush3D" ||
          this.state.activeTool === "SphericalBrush" ||
          this.state.activeTool === "Brush3DHUGated" ||
          this.state.activeTool === "BrushSphericalHUGated" ||
          this.state.activeTool === "Brush3DAutoGated") &&
          this.state.showBrushSize && (
            <BrushSizeSelector onClose={this.closeBrushSize} />
          )}
        {(this.state.activeTool === "Brush3DHUGated" || this.state.activeTool === "BrushSphericalHUGated" || this.state.activeTool === "Brush3DAutoGated") &&
          this.state.showSmartBrush && (
            <SmartBrushMenu activePort={this.props.activePort} onClose={this.closeSmartBrushMenu} isHuGated={this.state.isHuGated} isSphericalBrush={this.state.isSpherical} />
          )}
        {this.state.showPresets && (
          <WindowLevel
            activePort={this.props.activePort}
            onClose={this.showPresets}
          />
        )}
        {this.state.activeTool === "FreehandRoi3DTool" &&
          this.state.showInterpolation && (
            <Interpolation onClose={this.showInterpolation} />
          )
        }
        {this.state.showColormap && (
          <ColormapSelector
            activePort={this.props.activePort}
            onClose={this.closeColormap}
          />
        )}
        {this.state.showFuse && (
          <FuseSelector
            onClose={this.closeFuse}
          />
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(ToolMenu);
