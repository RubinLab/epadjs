import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import {
  getImageIds,
  getWadoImagePath,
  getSegmentation
} from "../../services/seriesServices";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { withRouter } from "react-router-dom";
import "./flex.css";
import "./viewport.css";
import {
  changeActivePort,
  updateImageId,
  clearActivePortAimID
} from "../annotationsList/action";
import ContextMenu from "./contextMenu";
import { MenuProvider } from "react-contexify";
import CornerstoneViewport from "react-cornerstone-viewport";
import OHIFSegmentationExtension from "../../ohif-segmentation-plugin";
import { freehand } from "./Freehand";
import { line } from "./Line";
import { probe } from "./Probe";
import { circle } from "./Circle";
import { bidirectional } from "./Bidirectional";
import RightsideBar from "../RightsideBar/RightsideBar";
import * as dcmjs from "dcmjs";
const mode = sessionStorage.getItem("mode");
const wadoUrl = sessionStorage.getItem("wadoUrl");

const tools = [
  { name: "Wwwc", modeOptions: { mouseButtonMasks: 1 }, mode: "active" },
  { name: "Pan", modeOptions: { mouseButtonMasks: 1 } },
  {
    name: "Zoom",
    configuration: {
      minScale: 0.3,
      maxScale: 25,
      preventZoomOutsideImage: true
    },
    modeOptions: { mouseButtonMasks: [1, 2] }
  },
  { name: "Probe", modeOptions: { mouseButtonMasks: 1 }, mode: "passive" },
  { name: "Length", modeOptions: { mouseButtonMasks: 1 }, mode: "passive" },
  // {
  //   name: "EllipticalRoi",
  //   configuration: {
  //     showMinMax: true
  //   }
  // },
  // {
  //   name: "RectangleRoi",
  //   configuration: {
  //     showMinMax: true
  //   }
  // },
  {
    name: "CircleRoi",
    configuration: {
      showMinMax: true
    },
    modeOptions: { mouseButtonMask: 1 },
    mode: "passive"
  },
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  {
    name: "FreehandRoi",
    modeOptions: { mouseButtonMask: [1] },
    mode: "passive"
  },
  { name: "FreehandRoiSculptor", modeOptions: { mouseButtonMask: 1 } },
  {
    name: "FreehandRoi3DTool",
    modeOptions: { mouseButtonMask: 1 },
    mode: "passive"
  },
  { name: "FreehandRoiSculptorTool", modeOptions: { mouseButtonMask: 1 } },
  { name: "Eraser" },
  {
    name: "Bidirectional",
    modeOptions: { mouseButtonMask: 1 },
    mode: "passive"
  },
  { name: "Brush3DTool" },
  { name: "StackScroll", modeOptions: { mouseButtonMask: 1 } },
  { name: "PanMultiTouch" },
  { name: "ZoomTouchPinch" },
  { name: "StackScrollMouseWheel", mode: "active" },
  { name: "StackScrollMultiTouch" },
  { name: "FreehandScissors", modeOptions: { mouseButtonMask: 1 } },
  { name: "RectangleScissors", modeOptions: { mouseButtonMask: 1 } },
  { name: "CircleScissors", modeOptions: { mouseButtonMask: 1 } },
  { name: "CorrectionScissors", modeOptions: { mouseButtonMask: 1 } }
];

Array.prototype.pairs = function(func) {
  const ret = [];
  for (var i = 0; i < this.length - 1; i++) {
    for (var j = i; j < this.length - 1; j++) {
      ret.push([this[i], this[j + 1]]);
      // func([this[i], this[j + 1]]);
    }
  }
  return ret;
};

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    loading: state.annotationsListReducer.loading,
    activePort: state.annotationsListReducer.activePort,
    aimList: state.annotationsListReducer.aimsList
  };
};

class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: "100%",
      height: "calc(100% - 60px)",
      hiding: false,
      data: [],
      isLoading: true,
      selectedAim: undefined,
      refs: props.refs,
      showAnnDetails: true,
      hasSegmentation: false,
      redirect: this.props.series.length < 1 ? true : false
    };
  }

  componentDidMount() {
    if (this.props.series.length < 1) return;
    this.getViewports();
    this.getData();
    window.addEventListener("markupSelected", this.handleMarkupSelected);
    window.addEventListener("markupCreated", this.handleMarkupCreated);
  }

  async componentDidUpdate(prevProps) {
    if (this.props.series.length < 1) return;
    if (
      (prevProps.series !== this.props.series &&
        prevProps.loading === true &&
        this.props.loading === false) ||
      (prevProps.series.length !== this.props.series.length &&
        this.props.loading === false)
    ) {
      await this.setState({ isLoading: true });
      this.getViewports();
      this.getData();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("markupSelected", this.handleMarkupSelected);
    window.removeEventListener("markupCreated", this.handleMarkupCreated);
  }

  // componentDidUpdate = async prevProps => {
  //   if (
  //     (this.props.loading !== prevProps.loading && !this.props.loading) ||
  //     this.props.series !== prevProps.series
  //   ) {
  //     await this.setState({ isLoading: true });

  //     this.getViewports();
  //     this.getData();
  //   }
  // };

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  getData() {
    // clear the toolState they will be rendered again on next load
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState({});
    // clear the segmentation data as well
    cornerstoneTools.store.modules.segmentation.state.series = {};

    const { series } = this.props;
    var promises = [];
    for (let i = 0; i < series.length; i++) {
      const promise = this.getImageStack(series[i], i);
      promises.push(promise);
    }
    Promise.all(promises).then(res => {
      this.setState({ data: res, isLoading: false });
      // clear the toolState they will be rendered again on next load
      cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
        {}
      );
      // clear the segmentation data as well
      // cornerstoneTools.store.modules.segmentation.state.series = {};
      series.forEach((serie, serieIndex) => {
        if (serie.imageAnnotations)
          this.parseAims(
            serie.imageAnnotations,
            serie.seriesUID,
            serie.studyUID,
            serieIndex
          );
      });
      this.props.dispatch(clearActivePortAimID());
      this.refreshAllViewports();
    });
  }

  async getImages(serie) {
    const { data: urls } = await getImageIds(serie); //get the Wado image ids for this series
    return urls;
  }

  getImageStack = async (serie, index) => {
    let stack = {};
    let cornerstoneImageIds = [];
    const imageUrls = await this.getImages(serie);
    imageUrls.map(url => {
      const baseUrl = wadoUrl + url.lossyImage;
      if (url.multiFrameImage === true) {
        for (var i = 0; i < url.numberOfFrames; i++) {
          let multiFrameUrl =
            mode !== "lite" ? baseUrl + "/frames/" + i : baseUrl;
          cornerstoneImageIds.push(multiFrameUrl);
        }
      } else {
        let singleFrameUrl = mode !== "lite" ? baseUrl : baseUrl;
        cornerstoneImageIds.push(singleFrameUrl);
        cornerstone.loadAndCacheImage(singleFrameUrl);
      }
    });
    //to jump to the same image after aim save
    let imageIndex;
    if (
      this.state.data.length &&
      this.state.data[index].stack.currentImageIdIndex
    )
      imageIndex = this.state.data[index].stack.currentImageIdIndex;
    else imageIndex = 0;

    // if serie is being open from the annotation jump to that image and load the aim editor
    if (serie.aimID) {
      imageIndex = this.getImageIndex(serie, cornerstoneImageIds);
      this.openAimEditor(serie);
    }

    stack.currentImageIdIndex = parseInt(imageIndex, 10);
    stack.imageIds = [...cornerstoneImageIds];
    return { stack };
  };

  openAimEditor = serie => {
    const { aimList } = this.props;
    const { aimID, seriesUID } = serie;
    if (Object.entries(aimList).length !== 0) {
      const aimJson = aimList[seriesUID][aimID].json;
      aimJson.aimID = aimID;
      const markupTypes = this.getMarkupTypesForAim(aimID);
      aimJson["markupType"] = [...markupTypes];
      if (this.state.showAimEditor && this.state.selectedAim !== aimJson)
        this.setState({ showAimEditor: false });
      this.setState({ showAimEditor: true, selectedAim: aimJson });
    }
  };

  getImageIndex = (serie, cornerstoneImageIds) => {
    let { aimID, imageAnnotations } = serie;
    const { series, activePort } = this.props;
    const { studyUID, seriesUID } = series[activePort];
    if (imageAnnotations) {
      for (let [key, values] of Object.entries(imageAnnotations)) {
        for (let value of values) {
          if (value.aimUid === aimID) {
            const cornerstoneImageId = getWadoImagePath(
              studyUID,
              seriesUID,
              key
            );
            const ret = this.getImageIndexFromImageId(
              cornerstoneImageIds,
              cornerstoneImageId
            );
            return ret;
          }
        }
      }
    }
    return 0;
  };

  getImageIndexFromImageId = (cornerstoneImageIds, cornerstoneImageId) => {
    for (let [key, value] of Object.entries(cornerstoneImageIds)) {
      if (value == cornerstoneImageId) return key;
    }
    return 0;
  };

  getViewports = () => {
    let numSeries = this.props.series.length;
    let numCols = numSeries % 3;
    if (numSeries > 3) {
      this.setState({ height: "calc((100% - 60px)/2)" });
      this.setState({ width: "33%" });
      return;
    }
    if (numCols === 1) {
      this.setState({ width: "100%" });
    } else if (numCols === 2) this.setState({ width: "50%" });
    else this.setState({ width: "33%", height: "calc(100% - 60px)" });
  };

  createRefs() {
    this.state.series.map(() =>
      this.props.dispatch(this.createViewport(React.createRef()))
    );
  }

  createViewport(viewportRef) {
    return {
      type: "CREATE_VIEWPORT",
      payload: viewportRef
    };
  }

  defaultSelectVP(id) {
    return {
      type: "SELECT_VIEWPORT",
      payload: id
    };
  }

  hideShow = current => {
    const elements = document.getElementsByClassName("viewportContainer");
    if (this.state.hiding === false) {
      for (var i = 0; i < elements.length; i++) {
        if (i != current) elements[i].style.display = "none";
      }
      this.setState({ height: "calc(100% - 60px)", width: "100%" });
    } else {
      this.getViewports();
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "inline-block";
      }
    }
    this.setState({ hiding: !this.state.hiding }, () =>
      window.dispatchEvent(new Event("resize"))
    );
  };

  // TODO: Can this be done without checking the tools of interest?
  measurementCompleted = (event, action) => {
    const { toolName, toolType } = event.detail;

    const toolsOfInterest = [
      "Probe",
      "Length",
      "CircleRoi",
      "FreehandRoi3DTool"
    ];
    if (toolsOfInterest.includes(toolName) || toolType === "Bidirectional") {
      this.setState({ showAimEditor: true });
    }
  };

  handleMarkupSelected = event => {
    console.log("Event", event);
    const { aimList, series, activePort } = this.props;
    const { aimId, ancestorEvent } = event.detail;
    const { element, data } = ancestorEvent;

    if (aimList[series[activePort].seriesUID][aimId]) {
      const aimJson = aimList[series[activePort].seriesUID][aimId].json;
      console.log("Aim json", aimJson);
      const markupTypes = this.getMarkupTypesForAim(aimId);
      aimJson["markupType"] = [...markupTypes];
      aimJson["aimId"] = aimId;
      console.log("event", event);
      console.log("Aimjson", aimJson);
      console.log("state aimjson", this.state.selectedAim);
      // check if is already editing an aim
      if (this.state.showAimEditor && this.state.selectedAim !== aimJson) {
        let message = "";
        if (this.state.selectedAim) {
          message = this.prepWarningMessage(
            this.state.selectedAim.name.value,
            aimJson.name.value
          );
        }
        // event.detail.ancestorEvent.preventDefault();
        const shouldContinue = this.closeAimEditor(true, message);
        if (!shouldContinue) {
          event.preventDefault();
          data.active = false;
          cornerstone.updateImage(element);
          return;
        }
        console.log("Should continue", shouldContinue);
        // continue to the event that has been canceled
        // if (sourceTool === "eraser" && shouldContinue) {
        //   console.log("Cancel Ancestor", shouldContinue);
        //   cornerstoneTools.removeToolState(element, targetTool, data);
        //   cornerstone.updateImage(element);
        // }

        // if (!cancelAncestor)
      }

      this.setState({ showAimEditor: true, selectedAim: aimJson });
      // console.log("Selected Aim", this.state.selectedAim);
    }
  };

  prepWarningMessage = (currentAim, destinationAim) => {
    return `You are trying to edit Aim named: ${destinationAim}. All unsaved changes in Aim named: ${currentAim} will be lost!!!`;
  };

  handleMarkupCreated = event => {
    const { detail } = event;
    if (!this.state.selectedAim)
      this.setState({ showAimEditor: true, selectedAim: undefined });
    if (detail === "brush") this.setState({ hasSegmentation: true });
  };

  setActive = i => {
    if (this.props.activePort !== i) {
      if (this.state.showAimEditor) {
        if (!this.closeAimEditor(true)) {
          //means going to another viewport in the middle of creating/editing an aim
          return;
        }
      }
      this.setState({ activePort: i });
      this.props.dispatch(changeActivePort(i));
    }
  };

  parseAims = (aimList, seriesUid, studyUid, serieIndex) => {
    Object.entries(aimList).forEach(([key, values], aimIndex) => {
      this.linesToPerpendicular(values); //change the perendicular lines to bidirectional to render by CS
      values.forEach(value => {
        const { markupType, aimUid } = value;
        if (markupType === "DicomSegmentationEntity")
          this.getSegmentationData(
            seriesUid,
            studyUid,
            aimUid,
            aimIndex,
            serieIndex
          );
        const color = this.getColorOfMarkup(value.aimUid, seriesUid);
        this.renderMarkup(key, value, color, seriesUid, studyUid);
      });
    });
  };

  linesToPerpendicular = values => {
    // Takes two lines on the same image, checks if they belong to same Aima and if they are perpendicular.
    // If so, merges two lines on line1, cnahges the markup type from line to perpendicular
    // And deletes the second line not to be reRendered as line agai
    const lines = values.filter(this.checkIfLine);

    const groupedLines = Object.values(this.groupBy(lines, "aimUid"));
    groupedLines.forEach(lines => {
      if (lines.length > 1)
        lines.pairs().forEach(pair => {
          if (this.checkIfPerpendicular(pair)) {
            // there are multiple lines on the same image that belongs to same aim, a potential perpendicular
            // they are perpendicular, remove them from the values list and render them as perpendicular
            pair[0].markupType = "Bidirectional";
            pair[0].calculations = pair[0].calculations.concat(
              pair[1].calculations
            );
            pair[0].coordinates = pair[0].coordinates.concat(
              pair[1].coordinates
            );

            const index = values.indexOf(pair[1]);
            if (index > -1) {
              values.splice(index, 1);
            }
          }
        });
    });
  };

  checkIfPerpendicular = lines => {
    const slope1 = this.getSlopeOfLine(
      lines[0]["coordinates"][0],
      lines[0]["coordinates"][1]
    );
    const slope2 = this.getSlopeOfLine(
      lines[1]["coordinates"][0],
      lines[1]["coordinates"][1]
    );
    if (Math.round((slope1 * slope2 * 100) / 100) == -1) return true;
    return false;
  };

  getSlopeOfLine = (p1, p2) => {
    return (p1.x.value - p2.x.value) / (p1.y.value - p2.y.value);
  };

  checkIfLine = markup => {
    if (markup) {
      return markup.markupType === "TwoDimensionMultiPoint";
    }
  };

  groupBy = (xs, key) => {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  getSegmentationData = (seriesUID, studyUID, aimId, aimIndex, serieIndex) => {
    const { aimList } = this.props;

    const segmentationEntity =
      aimList[seriesUID][aimId].json.segmentationEntityCollection
        .SegmentationEntity[0];

    const { seriesInstanceUid, sopInstanceUid } = segmentationEntity;

    const pathVariables = { studyUID, seriesUID: seriesInstanceUid.root };

    getSegmentation(pathVariables, sopInstanceUid.root).then(({ data }) => {
      this.renderSegmentation(data, aimIndex, serieIndex);
    });
  };

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  renderSegmentation = (arrayBuffer, aimIndex, serieIndex) => {
    const { imageIds } = this.state.data[serieIndex].stack;

    var imagePromises = imageIds.map(imageId => {
      return cornerstone.loadAndCacheImage(imageId);
    });

    Promise.all(imagePromises).then(() => {
      // const stackToolState = cornerstoneTools.getToolState(element, "stack");

      // const imageIds = stackToolState.data[0].imageIds;
      const {
        labelmapBuffer,
        segMetadata,
        segmentsOnFrame
      } = dcmjs.adapters.Cornerstone.Segmentation.generateToolState(
        imageIds,
        arrayBuffer,
        cornerstone.metaData
      );

      const { setters, state } = cornerstoneTools.getModule("segmentation");
      setters.labelmap3DByFirstImageId(
        imageIds[0],
        labelmapBuffer,
        aimIndex,
        segMetadata,
        imageIds.length,
        segmentsOnFrame
      );
      this.refreshAllViewports();
    });
  };

  refreshAllViewports = () => {
    if (cornerstone.getEnabledElements().length) {
      const enabledElements = cornerstone.getEnabledElements();
      enabledElements.map(({ element }) => {
        try {
          cornerstone.updateImage(element); //update the image to show newly loaded segmentations}
        } catch (error) {
          console.warn("Error:", error);
        }
      });
    }
  };

  getColorOfMarkup = (aimUid, seriesUid) => {
    return this.props.aimList[seriesUid][aimUid].color.button.background;
  };

  renderMarkup = (imageId, markup, color, seriesUid, studyUid) => {
    const type = markup.markupType;
    switch (type) {
      case "TwoDimensionPolyline":
        this.renderPolygon(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionMultiPoint":
        this.renderLine(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionCircle":
        this.renderCircle(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionPoint":
        this.renderPoint(imageId, markup, color, seriesUid, studyUid);
        break;
      case "Bidirectional":
        this.renderBidirectional(imageId, markup, color, seriesUid, studyUid);
        break;
      default:
        return;
    }
  };

  checkNCreateToolForImage = (toolState, imageId, tool) => {
    if (!toolState.hasOwnProperty(imageId))
      toolState[imageId] = { [tool]: { data: [] } };
    else if (!toolState[imageId].hasOwnProperty(tool))
      toolState[imageId] = { ...toolState[imageId], [tool]: { data: [] } };
  };

  renderBidirectional = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(bidirectional));
    data.color = color;
    data.aimId = markup.aimUid;
    data.invalidated = true;
    this.createBidirectionalPoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Bidirectional");
    currentState[imgId]["Bidirectional"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createBidirectionalPoints = (data, points) => {
    data.handles.start.x = points[0].x.value;
    data.handles.start.y = points[0].y.value;
    data.handles.end.x = points[1].x.value;
    data.handles.end.y = points[1].y.value;
    data.handles.perpendicularStart.x = points[2].x.value;
    data.handles.perpendicularStart.y = points[2].y.value;
    data.handles.perpendicularEnd.x = points[3].x.value;
    data.handles.perpendicularEnd.y = points[3].y.value;
    // need to set the text box coordinates for this too
    data.handles.textBox.x = points[0].x.value;
    data.handles.textBox.y = points[0].y.value;
  };

  renderLine = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(line));
    data.color = color;
    data.aimId = markup.aimUid;
    data.invalidated = true;
    this.createLinePoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Length");
    currentState[imgId]["Length"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createLinePoints = (data, points) => {
    data.handles.start.x = points[0].x.value;
    data.handles.start.y = points[0].y.value;
    data.handles.end.x = points[1].x.value;
    data.handles.end.y = points[1].y.value;
  };

  renderPolygon = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(freehand));
    data.color = color;
    data.aimId = markup.aimUid;
    data.invalidated = true;
    this.createPolygonPoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "FreehandRoi");
    currentState[imgId]["FreehandRoi"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createPolygonPoints = (data, points) => {
    const freehandPoints = [];
    const modulo = points.length;
    points.forEach((point, index) => {
      const linesIndex = (index + 1) % modulo;
      const freehandPoint = {};
      freehandPoint.x = point.x.value;
      freehandPoint.y = point.y.value;
      freehandPoint.highlight = true;
      freehandPoint.active = true;
      freehandPoint.lines = [
        { x: points[linesIndex].x.value, y: points[linesIndex].y.value }
      ];
      freehandPoints.push(freehandPoint);
    });
    data.handles.points = [...freehandPoints];
  };

  renderPoint = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(probe));
    data.color = color;
    data.aimId = markup.aimUid;
    data.handles.end.x = markup.coordinates[0].x.value;
    data.handles.end.y = markup.coordinates[0].y.value;
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Probe");
    currentState[imgId]["Probe"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  renderCircle = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(circle));
    data.color = color;
    data.aimId = markup.aimUid;
    data.handles.start.x = markup.coordinates[0].x.value;
    data.handles.start.y = markup.coordinates[0].y.value;
    data.handles.end.x = markup.coordinates[1].x.value;
    data.handles.end.y = markup.coordinates[1].y.value;
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "CircleRoi");
    currentState[imgId]["CircleRoi"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  closeAimEditor = (isCancel, message = "") => {
    // if aim editor has been cancelled ask to user
    if (isCancel === true) {
      if (message === "")
        message = "All unsaved data will be lost! Do you want to continue?";
      var answer = window.confirm(message);
      if (!answer) {
        return 0;
      }
    }
    this.setState({ showAimEditor: false, selectedAim: undefined });
    // clear all unsaved markups by calling getData
    this.getData();
    this.refreshAllViewports();
    return 1;
  };

  handleHideAnnotations = () => {
    this.setState({ showAnnDetails: false });
  };

  getMarkupTypesForAim = aimUid => {
    let markupTypes = [];
    const imageAnnotations = this.props.series[this.props.activePort]
      .imageAnnotations;
    Object.entries(imageAnnotations).forEach(([key, values]) => {
      values.forEach(value => {
        if (value.aimUid === aimUid) markupTypes.push(value.markupType);
      });
    });
    return markupTypes;
  };
  newImage = event => {
    const { activePort } = this.props;
    const tempData = this.state.data;
    const activeElement = cornerstone.getEnabledElements()[activePort];
    const { data } = cornerstoneTools.getToolState(
      activeElement.element,
      "stack"
    );
    tempData[activePort].stack = data[0];
    // set the state to preserve the imageId
    this.setState({ data: tempData });
    // dispatch to write the newImageId to store
    this.props.dispatch(updateImageId(event));
  };

  onAnnotate = () => {
    this.setState({ showAimEditor: true });
  };

  render() {
    if (this.state.redirect) return <Redirect to="/search" />;
    return !Object.entries(this.props.series).length ? (
      <Redirect to="/search" />
    ) : (
      <React.Fragment>
        <RightsideBar
          showAimEditor={this.state.showAimEditor}
          selectedAim={this.state.selectedAim}
          onCancel={this.closeAimEditor}
          hasSegmentation={this.state.hasSegmentation}
        >
          {!this.state.isLoading &&
            Object.entries(this.props.series).length &&
            this.state.data.map((data, i) => (
              <div
                className={
                  "viewportContainer" +
                  (this.props.activePort == i ? " selected" : "")
                }
                key={i}
                id={"viewportContainer" + i}
                style={{
                  width: this.state.width,
                  height: this.state.height,
                  padding: "2px",
                  display: "inline-block"
                }}
                onDoubleClick={() => this.hideShow(i)}
              >
                <MenuProvider
                  id="menu_id"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "inline-block"
                  }}
                >
                  <CornerstoneViewport
                    key={i}
                    imageIds={data.stack.imageIds}
                    imageIdIndex={data.stack.currentImageIdIndex}
                    viewportIndex={i}
                    tools={tools}
                    eventListeners={[
                      {
                        target: "element",
                        eventName: "cornerstonetoolsmeasurementcompleted",
                        handler: this.measurementCompleted
                      },
                      {
                        target: "element",
                        eventName: "cornerstonenewimage",
                        handler: this.newImage
                      }
                    ]}
                    setViewportActive={() => this.setActive(i)}
                    isStackPrefetchEnabled={true}
                  />
                </MenuProvider>
              </div>
            ))}
          <ContextMenu onAnnotate={this.onAnnotate} />
        </RightsideBar>
      </React.Fragment>
    );
    // </div>
  }
}

export default withRouter(connect(mapStateToProps)(DisplayView));
