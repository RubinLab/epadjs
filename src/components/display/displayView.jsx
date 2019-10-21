import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import {
  getImageIds,
  getWadoImagePath,
  getSegmentation
} from "../../services/seriesServices";
import { getAnnotations2 } from "../../services/annotationServices";
import { connect } from "react-redux";
import { wadoUrl, isLite } from "../../config.json";
import { Redirect } from "react-router";
import { withRouter } from "react-router-dom";
import Aim from "../aimEditor/Aim";
import AimEditor from "../aimEditor/aimEditor";
import "./flex.css";
import "./viewport.css";
import { changeActivePort, updateImageId } from "../annotationsList/action";
import ContextMenu from "./contextMenu";
import { MenuProvider } from "react-contexify";
import CornerstoneViewport from "../../reactCornerstoneViewport";
import { freehand } from "./Freehand";
import { line } from "./Line";
import { probe } from "./Probe";
import { circle } from "./Circle";
import RightsideBar from "../RightsideBar/RightsideBar";
import * as dcmjs from "dcmjs";

const tools = [
  { name: "Wwwc", mouseButtonMasks: [1] },
  { name: "Pan", mouseButtonMasks: [1] },
  {
    name: "Zoom",
    configuration: {
      minScale: 0.3,
      maxScale: 25,
      preventZoomOutsideImage: true
    },
    mouseButtonMasks: [1, 2]
  },
  { name: "Probe", mouseButtonMasks: [1] },
  { name: "Length", mouseButtonMasks: [1] },
  {
    name: "EllipticalRoi",
    configuration: {
      showMinMax: true
    }
  },
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
    },
    mouseButtonMasks: [1]
  },
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  { name: "Probe" },
  // { name: "FreehandRoi", mouseButtonMasks: [1] },
  { name: "Eraser" },
  { name: "Bidirectional", mouseButtonMasks: [1] },
  { name: "Brush" },
  // { name: "FreehandRoiSculptor" },
  { name: "StackScroll", mouseButtonMasks: [1] },
  { name: "PanMultiTouch" },
  { name: "ZoomTouchPinch" },
  { name: "StackScrollMouseWheel" },
  { name: "StackScrollMultiTouch" },
  { name: "FreehandScissors", mouseButtonMasks: [1] },
  { name: "RectangleScissors", mouseButtonMasks: [1] },
  { name: "CircleScissors", mouseButtonMasks: [1] },
  { name: "CorrectionScissors", mouseButtonMasks: [1] }
];

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    loading: state.annotationsListReducer.loading,
    cornerstone: state.searchViewReducer.cornerstone,
    cornerstoneTools: state.searchViewReducer.cornerstoneTools,
    activePort: state.annotationsListReducer.activePort,
    aimList: state.annotationsListReducer.aimsList
  };
};

class DisplayView extends Component {
  constructor(props) {
    super(props);
    // this.cornerstone = this.props.cornerstone;
    this.cornerstoneTools = this.props.cornerstoneTools;
    this.state = {
      width: "100%",
      height: "calc(100% - 60px)",
      hiding: false,
      data: [],
      isLoading: true,
      selectedAim: undefined,
      refs: props.refs,
      showAnnDetails: true,
      hasSegmentation: false
    };
  }

  componentDidMount() {
    this.getViewports();
    this.getData();
    window.addEventListener("markupSelected", this.handleMarkupSelected);
    window.addEventListener("markupCreated", this.handleMarkupCreated);
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.series !== this.props.series &&
      prevProps.loading === true &&
      this.props.loading === false
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
    var promises = [];
    for (let i = 0; i < this.props.series.length; i++) {
      const promise = this.getImageStack(this.props.series[i]);
      promises.push(promise);
    }
    Promise.all(promises).then(res => {
      this.setState({ data: res, isLoading: false });
      this.sleep(3900).then(() => {
        this.props.series.forEach(serie => {
          console.log("Serie", serie);
          if (serie.imageAnnotations)
            this.parseAims(serie.imageAnnotations, serie.seriesUID);
        });
      });
    });
  }

  async getImages(serie) {
    const {
      data: {
        ResultSet: { Result: urls }
      }
    } = await getImageIds(serie); //get the Wado image ids for this series
    return urls;
  }

  getImageStack = async serie => {
    let stack = {};
    let cornerstoneImageIds = [];
    const imageUrls = await this.getImages(serie);
    imageUrls.map(url => {
      const baseUrl = wadoUrl + url.lossyImage;
      if (url.multiFrameImage === true) {
        for (var i = 0; i < url.numberOfFrames; i++) {
          let multiFrameUrl = !isLite
            ? baseUrl + "&contentType=application%2Fdicom?frame=" + i
            : baseUrl;
          cornerstoneImageIds.push(multiFrameUrl);
        }
      } else {
        let singleFrameUrl = !isLite
          ? baseUrl + "&contentType=application%2Fdicom"
          : baseUrl;
        cornerstoneImageIds.push(singleFrameUrl);
      }

      //  if (url.multiFrameImage === true) {
      //     for (var i = 0; i < url.numberOfFrames; i++) {
      //       tempArray.push(
      //         wadoUrl +
      //           url.lossyImage +
      //           "&contentType=application%2Fdicom?frame=" +
      //           i
      //       );
      //     }
      //   } else
      //     tempArray.push(
      //       wadoUrl + url.lossyImage + "&contentType=application%2Fdicom"
      //     );
    });
    let imageIndex = 0;
    if (serie.aimID) {
      imageIndex = this.getImageIndex(serie, cornerstoneImageIds);
    }
    stack.currentImageIdIndex = parseInt(imageIndex, 10);
    stack.imageIds = [...cornerstoneImageIds];
    return { stack };
  };

  getImageIndex = (serie, cornerstoneImageIds) => {
    let { aimID, imageAnnotations } = serie;
    if (imageAnnotations) {
      for (let [key, values] of Object.entries(imageAnnotations)) {
        for (let value of values) {
          if (value.aimUid === aimID) {
            const cornerstoneImageId = getWadoImagePath(
              this.props.series[this.props.activePort],
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

  measurementChanged = (event, action) => {
    const { toolType } = event.detail;
    const toolsOfInterest = [
      "Probe",
      "Length",
      "CircleRoi",
      "FreehandRoi3D",
      "Bidirectional"
    ];
    if (toolsOfInterest.includes(toolType)) {
      this.setState({ showAimEditor: true, selectedAim: undefined });
    }
  };

  handleMarkupSelected = event => {
    if (
      this.props.aimList[this.props.series[this.props.activePort].seriesUID][
        event.detail
      ]
    ) {
      const aimJson = this.props.aimList[
        this.props.series[this.props.activePort].seriesUID
      ][event.detail].json;
      const markupTypes = this.getMarkupTypesForAim(event.detail);
      aimJson["markupType"] = [...markupTypes];
      if (this.state.showAimEditor && this.state.selectedAim !== aimJson)
        this.setState({ showAimEditor: false });
      this.setState({ showAimEditor: true, selectedAim: aimJson });
    }
  };

  handleMarkupCreated = event => {
    console.log("Event", event);
    const { detail } = event;
    this.setState({ showAimEditor: true, selectedAim: undefined });
    if (detail === "brush") this.setState({ hasSegmentation: true });
  };

  setActive = i => {
    this.props.dispatch(changeActivePort(i));
    if (this.props.activePort !== i) {
      this.setState({ activePort: i });
    }
  };

  parseAims = (aimList, seriesUid) => {
    console.log();
    Object.entries(aimList).forEach(([key, values]) => {
      values.forEach(value => {
        const { markupType, aimUid } = value;
        console.log("Value", value);
        if (markupType === "DicomSegmentationEntity")
          this.getSegmentationData(aimUid);
        const color = this.getColorOfMarkup(value.aimUid, seriesUid);
        this.renderMarkup(key, value, color);
      });
    });
  };

  getSegmentationData = aimId => {
    const { series, activePort, aimList } = this.props;
    const { seriesUID, studyUID } = series[activePort];

    const segmentationEntity =
      aimList[seriesUID][aimId].json.segmentationEntityCollection
        .SegmentationEntity[0];

    const { seriesInstanceUid, sopInstanceUid } = segmentationEntity;

    const pathVariables = { studyUID, seriesUID: seriesInstanceUid.root };

    getSegmentation(pathVariables, sopInstanceUid.root).then(segData => {
      // segData.arrayBuffer().then(segBuffer => {
      console.log("Seg Data is", segData.data);
      this.renderSegmentation(segData.data);
      // });
    });
  };

  renderSegmentation = arrayBuffer => {
    const cornerstoneTools = this.cornerstoneTools;
    const cornerstone = this.props.cornerstone;

    const { element } = cornerstone.getEnabledElements()[this.props.activePort];
    const stackToolState = this.props.cornerstoneTools.getToolState(
      element,
      "stack"
    );
    console.log("Stack toolstate", stackToolState);
    const imageIds = stackToolState.data[0].imageIds;
    const t0 = performance.now();
    const {
      labelmapBuffer,
      segMetadata,
      segmentsOnFrame
    } = dcmjs.adapters.Cornerstone.Segmentation.generateToolState(
      imageIds,
      arrayBuffer,
      cornerstone.metaData
    );
    const t1 = performance.now();
    const { setters, state } = cornerstoneTools.getModule("segmentation");
    setters.labelmap3DByFirstImageId(
      imageIds[0],
      labelmapBuffer,
      0,
      segMetadata,
      imageIds.length,
      segmentsOnFrame
    );
  };

  getColorOfMarkup = (aimUid, seriesUid) => {
    return this.props.aimList[seriesUid][aimUid].color.button.background;
  };

  renderMarkup = (imageId, markup, color) => {
    const type = markup.markupType;
    switch (type) {
      case "TwoDimensionPolyline":
        this.renderPolygon(imageId, markup, color);
        break;
      case "TwoDimensionMultiPoint":
        this.renderLine(imageId, markup, color);
        break;
      case "TwoDimensionCircle":
        this.renderCircle(imageId, markup, color);
        break;
      case "TwoDimensionPoint":
        this.renderPoint(imageId, markup, color);
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

  renderLine = (imageId, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      imageId
    );
    const data = JSON.parse(JSON.stringify(line));
    data.color = color;
    data.aimId = markup.aimUid;
    this.createLinePoints(data, markup.coordinates);
    const currentState = this.cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Length");
    currentState[imgId]["Length"].data.push(data);
    this.cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createLinePoints = (data, points) => {
    data.handles.start.x = points[0].x.value;
    data.handles.start.y = points[0].y.value;
    data.handles.end.x = points[1].x.value;
    data.handles.end.y = points[1].y.value;
  };

  renderPolygon = (imageId, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      imageId
    );
    const data = JSON.parse(JSON.stringify(freehand));
    data.color = color;
    data.aimId = markup.aimUid;
    this.createPolygonPoints(data, markup.coordinates);
    const currentState = this.cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "FreehandMouse");
    currentState[imgId]["FreehandMouse"].data.push(data);
    this.cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
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

  renderPoint = (imageId, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      imageId
    );
    const data = JSON.parse(JSON.stringify(probe));
    data.color = color;
    data.aimId = markup.aimUid;
    data.handles.end.x = markup.coordinates.x.value;
    data.handles.end.y = markup.coordinates.y.value;
    const currentState = this.cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Probe");
    currentState[imgId]["Probe"].data.push(data);
    this.cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  renderCircle = (imageId, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      imageId
    );
    const data = JSON.parse(JSON.stringify(circle));
    data.color = color;
    data.aimId = markup.aimUid;
    data.handles.start.x = markup.coordinates[0].x.value;
    data.handles.start.y = markup.coordinates[0].y.value;
    data.handles.end.x = markup.coordinates[1].x.value;
    data.handles.end.y = markup.coordinates[1].y.value;
    const currentState = this.cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "CircleRoi");
    currentState[imgId]["CircleRoi"].data.push(data);
    this.cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  closeAimEditor = () => {
    this.setState({ showAimEditor: false, selectedAim: undefined });
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

  render() {
    return !Object.entries(this.props.series).length ? (
      <Redirect to="/search" />
    ) : (
      // <div className="displayView-main">
      <React.Fragment>
        {/* <Toolbar
          cornerstone={this.cornerstone}
          cornerstoneTools={this.cornerstoneTools}
        /> */}
        <RightsideBar
          cornerstone={this.props.cornerstone}
          csTools={this.cornerstoneTools}
          showAimEditor={this.state.showAimEditor}
          aimId={this.state.selectedAim}
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
                    viewportData={data}
                    viewportIndex={i}
                    availableTools={tools}
                    onMeasurementsChanged={this.measurementChanged}
                    setViewportActive={() => this.setActive(i)}
                    onNewImage={event =>
                      this.props.dispatch(updateImageId(event))
                    }
                    // onRightClick={this.showRightMenu}
                  />
                </MenuProvider>
              </div>
              // <div
              //   className={"viewportContainer"}
              //   key={i}
              //   style={{
              //     width: this.state.width,
              //     height: this.state.height,
              //     padding: "2px",
              //     display: "inline-block"
              //   }}
              //   onDoubleClick={() => this.hideShow(i)}
              // >

              // {this.state.showAimEditor && (
              //   <AimEditor
              //     cornerstone={this.props.cornerstone}
              //     csTools={this.cornerstoneTools}
              //   />
              // )}

              //{" "}
              // </div>
            ))}
          <ContextMenu />
        </RightsideBar>
      </React.Fragment>
    );
    // </div>
  }
}

export default withRouter(connect(mapStateToProps)(DisplayView));
