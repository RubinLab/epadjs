import React, { Component } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import MetaData from "../MetaData/MetaData";
import SmartBrushMenu from "../SmartBrushMenu/SmartBrushMenu";
import AddToWorklist from "../searchView/addWorklist";
import BrushSizeSelector from "./BrushSizeSelector";
import { WindowLevel } from "../WindowLevel/WindowLevel";
import ColormapSelector from "./ColormapSelector";
import FuseSelector from "./FuseSelector";
import cornerstoneTools from "cornerstone-tools";
import { setSignificantSeries } from "../../services/seriesServices";

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
  FaDotCircle,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import { BsArrowUpLeft } from "react-icons/bs";
import { FiSun, FiSunset, FiZoomIn, FiRotateCw } from "react-icons/fi";
import { IoMdEgg } from "react-icons/io";
import { MdLoop, MdPanTool } from "react-icons/md";
import { TbReplace } from "react-icons/tb";
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
import { clearGrid } from "../annotationsList/action";
import Spinner from "../common/circleSpinner";
import "../../font-icons/styles.css";
import "react-input-range/lib/css/index.css";
import Collapsible from "react-collapsible";
import "./ToolMenu.css";
import ToolMenuItem from "../ToolMenu/ToolMenuItem";
import Interpolation from "./Interpolation";

let mode;
let wadoUrl;
let maxPort;

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
  { name: "ArrowAnnotate" },
];

class ToolMenu extends Component {
  //Tools are initialized in viewport.jsx since they are activated on elements. I don"t really like this logic, we shall think of a better way.

  constructor(props) {
    super(props);
    mode = sessionStorage.getItem("mode");
    wadoUrl = sessionStorage.getItem("wadoUrl");
    maxPort = sessionStorage.getItem("maxPort");
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
      activeToolIdx: 1,
      fuse: false,
    };

    this.imagingTools = [
      {
        name: "Close All",
        icon: <FaTimes />,
        tool: "ClearGrid",
        teaching: true,
      },
      {
        name: "Select",
        icon: <FaMousePointer />,
        tool: "Noop",
        teaching: true,
      },
      { name: "Levels", icon: <FiSun />, tool: "Wwwc", teaching: true },
      { name: "Presets", icon: <FiSunset />, tool: "Presets", teaching: true },
      { name: "Zoom", icon: <FiZoomIn />, tool: "Zoom", teaching: true },
      { name: "Invert", icon: <FaAdjust />, tool: "Invert", teaching: true },
      { name: "Reset", icon: <MdLoop />, tool: "Reset", teaching: true },
      { name: "Pan", icon: <MdPanTool />, tool: "Pan", teaching: true },
      // { name: "MetaData", icon: <FaListAlt />, tool: "MetaData", teaching: true },
      { name: "Rotate", icon: <FiRotateCw />, tool: "Rotate", teaching: true },
      // { name: "Region", icon: <FaListAlt />, tool: "WwwcRegion" },
      { name: "Color", icon: <FaPalette />, tool: "colorLut" },
      { name: "Fusion", icon: <FaObjectUngroup />, tool: "fuse" },
    ];

    this.markupTools = [
      {
        name: "Point",
        icon: <div className="icon-point fontastic-icons" />,
        tool: "Probe",
        teaching: true,
      },
      {
        name: "Line",
        icon: <FaRulerHorizontal />,
        tool: "Length",
        teaching: true,
      },
      {
        name: "Arrow",
        icon: <BsArrowUpLeft />,
        tool: "ArrowAnnotate",
        teaching: true,
      },
      {
        name: "Circle",
        icon: <div className="icon-circle fontastic-icons" />,
        tool: "CircleRoi",
        teaching: true,
      },
      {
        name: "Perpendicular",
        icon: <div className="icon-perpendicular fontastic-icons" />,
        tool: "Bidirectional",
        teaching: true,
      },
      {
        name: "Poly/Freehand",
        icon: <div className="icon-polygon fontastic-icons" />,
        tool: "FreehandRoi3DTool",
        teaching: true,
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
        teaching: true,
      },
      {
        name: "Sculpt 3D",
        icon: <FaScrewdriver />,
        tool: "FreehandRoi3DSculptor",
        teaching: true,
      },
      { name: "Eraser", icon: <FaEraser />, tool: "Eraser", teaching: true },
    ];

    this.managementTools = [
      { name: "Save order", icon: <TbReplace />, tool: "order", teaching: true },
    ]

    this.segmentationTools = [
      {
        name: "Brush",
        icon: <div className="icon-brush" />,
        tool: "Brush3D",
      },
      {
        name: "Gated",
        icon: <FaBroom />,
        tool: "Brush3DHUGated",
      },
      {
        name: "Spherical Gated",
        icon: <FaDotCircle />,
        tool: "BrushSphericalHUGated",
      },
      {
        name: "Auto Gated",
        icon: <FaBroom />,
        tool: "Brush3DAutoGated",
      },
      {
        name: "Spherical",
        icon: <IoMdEgg />,
        tool: "SphericalBrush",
      },
      {
        name: "Freehand Scissors",
        icon: <FaHandScissors />,
        tool: "FreehandScissors",
      },
      { name: "Circle Scissors", icon: <FaCircle />, tool: "CircleScissors" },
      {
        name: "Correction Scissors",
        icon: <TiScissorsOutline />,
        tool: "CorrectionScissors",
      },
    ];
    if (mode === "teaching") {
      this.imagingTools = this.imagingTools.filter((tool) => tool.teaching);
    }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyPressed);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyPressed);
    sessionStorage.removeItem("activeTool");
  }

  handleKeyPressed = (event) => {
    // space bar => Reset
    if (
      event.target.nodeName !== "INPUT" &&
      event.target.nodeName !== "TEXTAREA"
    ) {
      if (event.keyCode == 32) {
        this.handleToolClicked(1, "Reset");
      }
      // d => Length
      else if (event.keyCode == 68) {
        const index = mode === "teaching" ? 10 : 12;
        this.handleToolClicked(index, "Length");
      }
      // o => Perpendicular/Bidirectional
      else if (event.keyCode == 79) {
        const index = mode === "teaching" ? 13 : 15;
        this.handleToolClicked(index, "Bidirectional");
      }
      // f => Arrow
      else if (event.keyCode == 70) {
        const index = mode === "teaching" ? 11 : 13;
        this.handleToolClicked(index, "ArrowAnnotate");
      }
      // r => Circle
      else if (event.keyCode == 82) {
        const index = mode === "teaching" ? 12 : 14;
        this.handleToolClicked(index, "CircleRoi");
      }
      // z => zoom
      else if (event.keyCode == 90) {
        this.handleToolClicked(4, "Zoom");
      }
      // p => Pan
      else if (event.keyCode == 80) {
        this.handleToolClicked(7, "Pan");
      }
      // w => Wwwc
      else if (event.keyCode == 87) {
        this.handleToolClicked(2, "Wwwc");
      }
      // s => Select
      else if (event.keyCode == 83) {
        this.handleToolClicked(1, "Noop");
      }
    }
  };

  //TODO: instead of disabling all tools we can just disable the active tool
  disableAllTools = () => {
    const { activeTool } = this.state;
    if (activeTool) {
      if (
        activeTool === "FreehandRoiTool" ||
        activeTool === "FreehandRoi3DTool"
      ) {
        this.deselectFreehand();
      }
      this.setState({ activeToolIdx: 1 });
      this.setToolStateForAllElements(this.state.activeTool, "passive");
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

  saveSignificantOrder = () => {
    let projectID, subjectUID, studyUID = null;
    const significantSeries = [];
    let differentStudy = false;
    for (let i = 0; i < this.props.openSeries.length; i++) {
      if (i === 0) {
        ({projectID, subjectUID, studyUID } = this.props.openSeries[i]);
        subjectUID = subjectUID ? subjectUID : this.props.openSeries[i].patientID
        significantSeries.push({seriesUID: this.props.openSeries[i].seriesUID, significanceOrder: i + 1});
      } else {
        if (studyUID !== this.props.openSeries[i].studyUID) {
          differentStudy = studyUID !== this.props.openSeries[i].studyUID;
          toast.warning(`All series should be from the same study`);
        } else {
          significantSeries.push({seriesUID: this.props.openSeries[i].seriesUID, significanceOrder: i + 1});
        }
      } 
    }
    if (!differentStudy) {
      setSignificantSeries(projectID, subjectUID, studyUID, significantSeries).then(res => {
        toast.success('The signifance order is successfully saved');
      }).catch((err) => toast.error('Could not save the signifance order'));
    }
  }

  handleToolClicked = (index, tool) => {
    sessionStorage.setItem("activeTool", tool);
    if (tool === "Noop") {
      this.disableAllTools();
      this.setState({ activeTool: "", activeToolIdx: index });
      return;
    } else if (tool === "ClearGrid") {
      this.props.dispatch(clearGrid());
      sessionStorage.removeItem("wwwc");
      const max = parseInt(maxPort);
      const imgStatus = new Array(max);
      sessionStorage.setItem("imgStatus", JSON.stringify(imgStatus));
      if (mode === "thick") this.props.onSwitchView("list");
      else this.props.onSwitchView("search");
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
      if (this.checkIfMultiframe()) {
        alert("Segmentation tools only works with singleframe images");
        return;
      }
      this.setState({
        showBrushSize: true,
        isHuGated: true,
        showSmartBrush: true,
        isSpherical: false,
      });
    } else if (tool === "BrushSphericalHUGated") {
      if (this.checkIfMultiframe()) {
        alert("Segmentation tools only works with singleframe images");
        return;
      }
      this.setState({
        showBrushSize: true,
        isHuGated: true,
        showSmartBrush: true,
        isSpherical: true,
      });
    } else if (tool === "Brush3DAutoGated") {
      if (this.checkIfMultiframe()) {
        alert("Segmentation tools only works with singleframe images");
        return;
      }
      this.setState({
        showBrushSize: true,
        isHuGated: false,
        showSmartBrush: true,
        isSpherical: false,
      });
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
    } else if (tool === 'order') {
      this.saveSignificantOrder();
      return;
    }
    // else if (tool === "FreehandRoiTool") {
    //   this.selectFreehand();
    // }

    this.disableAllTools();
    this.setState({ activeTool: tool, activeToolIdx: index }, () => {
      this.setToolStateForAllElements(tool, "active");
    });
  };

  selectFreehand = () => {
    window.addEventListener("escPressed", this.cancelPolygon);
  };

  deselectFreehand = () => {
    window.removeEventListener("escPressed", this.cancelPolygon);
  };

  cancelPolygon = () => {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    let tools = cornerstoneTools.store.state.tools;

    tools = tools.filter(
      (tool) => tool.element === element && tool.mode === "active"
    );
    tools = tools.filter((tool) => tool.name === "FreehandRoi3DTool");
    tools[0].cancelDrawing(element);
  };

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
    const wadors = wadoUrl.includes("wadors");
    if (wadors) {
      const imgMetadata = cornerstoneWADOImageLoader.wadors.metaDataManager.get(
        image.imageId
      );
      return imgMetadata.isMultiframe;
    } else if (!wadors && image.data.string("x00280008")) return true;
    else return false;
  };

  invert() {
    this.props.onInvertClick(true, this.props.activePort);
  }

  reset = () => {
    const elem = cornerstone.getEnabledElements()[this.props.activePort];
    const element = elem.element;
    const layers = cornerstone.getLayers(element);
    const { colormap } = elem.viewport;
    if (layers.length || (colormap && colormap !== "gray"))
      this.resetRenderCanvas(element);
    cornerstone.reset(element);
    window.dispatchEvent(new CustomEvent("resetViewportImageStatus"));
  };

  resetRenderCanvas = (element) => {
    const enabledElement = cornerstone.getEnabledElement(element);

    enabledElement.renderingTools.colormapId = undefined;
    enabledElement.renderingTools.colorLut = undefined;

    const renderCanvas = enabledElement.renderingTools.renderCanvas;
    const canvasContext = renderCanvas.getContext("2d");

    // NOTE - we need to fill the render canvas with white pixels since we
    // control the luminance using the alpha channel to improve rendering performance.
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

    const renderCanvasData = canvasContext.getImageData(
      0,
      0,
      renderCanvas.width,
      renderCanvas.height
    );

    enabledElement.renderingTools.renderCanvasContext = canvasContext;
    enabledElement.renderingTools.renderCanvasData = renderCanvasData;
  };

  showMetaData = () => {
    this.setState({ showMetaData: !this.state.showMetaData });
  };

  handleClip = () => {
    const element =
      cornerstone.getEnabledElements()[this.props.activePort].element;
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
    });
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
  };

  closeFuse = () => {
    this.setState({ showFuse: false });
  };

  render() {
    const { activeTool } = this.state;
    if (
      activeTool !== undefined &&
      activeTool !== "" &&
      activeTool !== "FreehandRoiSculptor"
    )
      this.setToolStateForAllElements(activeTool, "active");
    return (
      <div className="toolbar">
        {this.imagingTools.map(({ name, icon, tool }, i) => {
          return (
            <ToolMenuItem
              key={name}
              name={name}
              icon={icon}
              index={i}
              isActive={this.state.activeToolIdx === i}
              onClick={() => this.handleToolClicked(i, tool)}
            />
          );
        })}

        {/* {this.state.showMetaData && (<MetaData onClose={this.showMetaData} />)} */}
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
        {this.markupTools.map(({ name, icon, tool, child }, i) => {
          i = i + this.imagingTools.length;
          return (
            <ToolMenuItem
              key={name}
              name={name}
              icon={icon}
              index={i}
              isActive={this.state.activeToolIdx === i}
              onClick={() => this.handleToolClicked(i, tool)}
              children={child}
            />
          );
        })}
        {/* {mode === 'teaching' && this.managementTools.length > 0 && <div className="toolbarSectionButton" id="toolmenu-mng"></div>} */}
        {mode === 'teaching' && this.managementTools.map(({ name, icon, tool, child }, i) => {
          return (
            <ToolMenuItem
              key={name}
              name={name}
              icon={icon}
              index={i}
              onClick={() => this.handleToolClicked(i, tool)}
              children={child}
              style={i=== 0 ? {paddingLeft: '5px'} : {}}
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
        <AddToWorklist toolMenu={true} parent="display"/>
        {mode !== "teaching" &&
          this.segmentationTools.map((segmentationTool, i) => {
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
        {(this.state.activeTool === "Brush3DHUGated" ||
          this.state.activeTool === "BrushSphericalHUGated" ||
          this.state.activeTool === "Brush3DAutoGated") &&
          this.state.showSmartBrush && (
            <SmartBrushMenu
              activePort={this.props.activePort}
              onClose={this.closeSmartBrushMenu}
              isHuGated={this.state.isHuGated}
              isSphericalBrush={this.state.isSpherical}
            />
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
          )}
        {this.state.showColormap && (
          <ColormapSelector
            activePort={this.props.activePort}
            onClose={this.closeColormap}
          />
        )}
        {this.state.showFuse && <FuseSelector onClose={this.closeFuse} />}
      </div>
    );
  }
}

export default connect(mapStateToProps)(ToolMenu);
