import React, { Component } from "react";
import Toolbar from "./toolbar";
import { getImageIds, getWadoImagePath } from "../../services/seriesServices";
import { getAnnotations2 } from "../../services/annotationServices";
import getImageIdAnnotations from "../aimEditor/aimHelper.js";
//import Viewport from "./viewport.jsx";
import ViewportSeg from "./viewportSeg.jsx";
import { connect } from "react-redux";
import { wadoUrl, isLite } from "../../config.json";
import { withRouter } from "react-router-dom";
// import CornerstoneViewport from "react-cornerstone-viewport";
import Aim from "../aimEditor/Aim";
import AimEditor from "../aimEditor/aimEditor";
import "./flex.css";
//import viewport from "./viewport.jsx";
import { changeActivePort } from "../annotationsList/action";
import ContextMenu from "./contextMenu";

import { MenuProvider } from "react-contexify";
import CornerstoneViewport from "react-cornerstone-viewport";
// import CornerstoneViewport from "../Viewport/CornerstoneViewport/CornerstoneViewport";
import { freehand } from "./Freehand";
import { line } from "./Line";
import { probe } from "./Probe";
import { circle } from "./Circle";

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
  { name: "FreehandRoi", mouseButtonMasks: [1] },
  { name: "Eraser" },
  { name: "Bidirectional", mouseButtonMasks: [1] },
  { name: "Brush" },
  { name: "FreehandRoiSculptor" },
  { name: "StackScroll", mouseButtonMasks: [1] },
  { name: "PanMultiTouch" },
  { name: "ZoomTouchPinch" },
  { name: "StackScrollMouseWheel" },
  { name: "StackScrollMultiTouch" }
];

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    cornerstone: state.searchViewReducer.cornerstone,
    cornerstoneTools: state.searchViewReducer.cornerstoneTools,
    activePort: state.annotationsListReducer.activePort,
    aimList: state.annotationsListReducer.aimsList
  };
};

class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.cornerstone = this.props.cornerstone;
    this.cornerstoneTools = this.props.cornerstoneTools;
    this.state = {
      width: "100%",
      height: "calc(100% - 60px)",
      hiding: false,
      data: [],
      isLoading: true,
      selectedAim: undefined,
      // height: "100%",
      refs: props.refs,
      showAnnDetails: true
    };
    //this.createRefs();
  }

  componentDidMount() {
    this.getViewports();
    this.getData();
    window.addEventListener(
      "annotationSelected",
      this.handleAnnotationSelected
    );
  }

  getData() {
    var promises = [];
    for (let i = 0; i < this.props.series.length; i++) {
      const promise = this.getImages(this.props.series[i], i);
      console.log("series", this.props.series[i]);
      promises.push(promise);
    }
    Promise.all(promises).then(res => {
      this.setState({ data: res, isLoading: false });
      // console.log(this.props.aimList);
      // if (this.props.aimList) this.parseAims(this.props.aimList);
    });
  }

  async getImages(seri, i) {
    let stack = {};
    let tempArray = [];
    const {
      data: {
        ResultSet: { Result: urls }
      }
    } = await getImageIds(seri); //get the Wado image ids for this series
    urls.map(url => {
      const baseUrl = wadoUrl + url.lossyImage;
      if (url.multiFrameImage === true) {
        for (var i = 0; i < url.numberOfFrames; i++) {
          let multiFrameUrl = !isLite
            ? baseUrl + "&contentType=application%2Fdicom?frame=" + i
            : baseUrl;
          tempArray.push(multiFrameUrl);
        }
      } else {
        let singleFrameUrl = !isLite
          ? baseUrl + "&contentType=application%2Fdicom"
          : baseUrl;
        tempArray.push(singleFrameUrl);
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
    stack.currentImageIdIndex = 0;
    stack.imageIds = [...tempArray];
    return { stack };
  }

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
    else this.setState({ width: "33%" });
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
      "Length",
      "CircleRoi",
      "FreehandMouse",
      "Bidirectional",
      "Probe"
    ];
    if (toolsOfInterest.includes(toolType)) {
      this.setState({ showAimEditor: true });
    }
  };

  setActive = i => {
    this.props.dispatch(changeActivePort(i));
    if (this.props.activePort !== i) {
      this.setState({ activePort: i });
    }
  };

  //parseAims,

  // parseAims = aimList => {
  //   // first clear the tool state
  //   // if (this.state.selectedAim) {
  //   //   const element = this.cornerstone.getEnabledElements()[
  //   //     this.props.activePort
  //   //   ]["element"];
  //   //   this.props.cornerstoneTools.globalImageIdSpecificToolStateManager.clear(
  //   //     element
  //   //   );
  //   // }
  //   console.log(this.props.cornerstoneTools);

  //   // now parse the aim and render the new marups
  //   Object.entries(aimList).forEach(([key, value]) => {
  //     Object.entries(value).forEach(([key, value]) => {
  //       // get markups for the aim
  //       if (
  //         value.json.imageAnnotations.ImageAnnotation.markupEntityCollection
  //       ) {
  //         const color = value.color.button.background;
  //         this.renderMarkups(key, Aim.getMarkups(value.json), color);
  //       }
  //     });
  //   });
  // };

  renderMarkups = (key, markups, color) => {
    console.log("Rendering Markups", key, markups, color);
    if (markups.constructor === Array) {
      markups.forEach(markup => {
        this.renderMarkup(key, markup, color);
      });
    } else this.renderMarkup(key, markups, color);
  };

  renderMarkup = (key, markup, color) => {
    const type = markup.markupType;
    switch (type) {
      case "TwoDimensionPolyline":
        this.renderPolygon(key, markup, color);
        break;
      case "TwoDimensionMultiPoint":
        this.renderLine(key, markup, color);
        break;
      case "TwoDimensionCircle":
        this.renderCircle(key, markup, color);
        break;
      case "TwoDimensionPoint":
        this.renderPoint(key, markup, color);
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

  renderLine = (key, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      markup.imageId
    );
    const data = JSON.parse(JSON.stringify(line));
    data.color = color;
    data.aimId = key;
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

  renderPolygon = (key, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      markup.imageId
    );
    const data = JSON.parse(JSON.stringify(freehand));
    data.color = color;
    data.aimId = key;
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

  renderPoint = (key, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      markup.imageId
    );
    const data = JSON.parse(JSON.stringify(probe));
    data.color = color;
    data.aimId = key;
    data.handles.end.x = markup.coordinates.x.value;
    data.handles.end.y = markup.coordinates.y.value;
    const currentState = this.cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Probe");
    currentState[imgId]["Probe"].data.push(data);
    this.cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  renderCircle = (key, markup, color) => {
    const imgId = getWadoImagePath(
      this.props.series[this.props.activePort],
      markup.imageId
    );
    const data = JSON.parse(JSON.stringify(circle));
    data.color = color;
    data.aimId = key;
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
    console.log("Current state is", currentState);
  };

  handleAnnotationSelected = event => {
    console.log("event is", event);
    if (
      this.props.aimList[this.props.series[this.props.activePort].seriesUID][
        event.detail
      ]
    ) {
      const aimJson = this.props.aimList[
        this.props.series[this.props.activePort].seriesUID
      ][event.detail].json;
      console.log("event", JSON.stringify(aimJson));
      this.setState({ showAimEditor: true, selectedAim: aimJson });
    }
  };

  closeAimEditor = () => {
    this.setState({ showAimEditor: false, selectedAim: undefined });
  };

  async componentDidUpdate(prevProps) {
    if (!this.state.isLoading && Object.entries(this.props.aimList).length) {
      // this.parseAims(this.props.aimList);
      //get the aims for test
      const { data: aims } = await getAnnotations2();
      console.log("csTool are", this.cornerstoneTools);
      console.log("aims are", aims);
      // debugger;
      getImageIdAnnotations(aims);

      // this.parseAims(aims);
      window.addEventListener(
        "annotationSelected",
        this.handleAnnotationSelected
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener(
      "annotationSelected",
      this.handleAnnotationSelected
    );
  }

  handleHideAnnotations = () => {
    this.setState({ showAnnDetails: false });
  };

  render() {
    if (!Object.entries(this.props.series).length)
      this.props.history.push("/search");
    return (
      // <div className="displayView-main">
      <React.Fragment>
        <Toolbar
          cornerstone={this.props.cornerstone}
          cornerstoneTools={this.props.cornerstoneTools}
        />
        {this.state.showAimEditor && (
          <AimEditor
            cornerstone={this.props.cornerstone}
            csTools={this.cornerstoneTools}
            aimId={this.state.selectedAim}
            onCancel={this.closeAimEditor}
          />
        )}
        {!this.state.isLoading &&
          Object.entries(this.props.series).length &&
          this.state.data.map((data, i) => (
            <div
              className={
                "viewportContainer" +
                (this.props.activePort == i ? " selected" : "")
              }
              key={i}
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
      </React.Fragment>
      // </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(DisplayView));
