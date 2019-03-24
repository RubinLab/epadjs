import React, { Component } from "react";
import { connect } from "react-redux";
import { getImageIds } from "../../services/seriesServices";
import { wadoUrl } from "../../config.json";
//import ImageScrollbar from "./imageScrollbar";

import "./viewport.css";

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
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  { name: "Probe" },
  { name: "FreehandMouse" },
  { name: "Eraser" },
  { name: "Bidirectional" },
  { name: "Brush" },
  { name: "StackScroll" },
  { name: "StackScrollMouseWheel" }
];

class ViewportSeg extends Component {
  constructor(props) {
    super(props);
    this.tools = tools;
    this.cornerstone = this.props.cs;
    this.cornerstoneTools = this.props.csT;
    this.onNewImage = this.onNewImage.bind(this);
    this.selectImage = this.selectImage.bind(this);
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onImageRendered = this.onImageRendered.bind(this);
    this.updateViewport = this.updateViewport.bind(this);

    const scrollToIndex = this.cornerstoneTools.import("util/scrollToIndex");

    this.state = {
      series: { ...this.props },
      images: {},
      imageIds: [],
      viewport: "",
      coordinates: { x: 0, y: 0, xm: 0, ym: 0 },
      pixelSpacing: { column: 0, row: 0 },
      imageX: 0,
      imageY: 0
    };

    this.stack = {
      currentImageIdIndex: 0,
      imageIds: this.state.imageIds
    };

    this.loadProgress = {
      imageIds: [],
      total: 0,
      remaining: 0,
      percentLoaded: 0
    };
  } //end of constructor

  onImageLoaded(event) {
    var eventData = event.detail;
    var imageId = eventData.image.imageId;
    var imageIds = this.loadProgress["imageIds"];

    // Remove all instances, in case the stack repeats imageIds
    for (var i = imageIds.length - 1; i >= 0; i--) {
      if (imageIds[i] === imageId) {
        imageIds.splice(i, 1);
      }
    }

    // Populate the load progress object
    this.loadProgress["remaining"] = imageIds.length;
    this.loadProgress["percentLoaded"] = parseInt(
      100 - (this.loadProgress["remaining"] / this.loadProgress["total"]) * 100,
      10
    );

    if (this.loadProgress["remaining"] / this.loadProgress["total"] === 0) {
    }

    // Write to a span in the DOM
    /*var currentValueSpan = document.getElementById("loadProgress");
    currentValueSpan.textContent = this.loadProgress["percentLoaded"];*/
  }

  onImageRendered(e) {
    const eventData = e.detail;
    const image = eventData.image;
    const viewport = eventData.viewport;
    const thickness = parseFloat(image.data.string("x00180050")).toFixed(2);
    const location = parseInt(image.data.string("x00201041"), 10);
    const seriesDate = this.formatDate(image.data.string("x00080021"));
    const patientName = image.data.string("x00100010");
    const modality = image.data.string("x00080060");
    const seriesDescription = image.data.string("x0008103e");
    const studyTime = this.formatTime(image.data.string("x00080030"));
    var rotation = "";
    if (Math.round(viewport.rotation) > 0)
      rotation = "Rotation: " + Math.round(viewport.rotation) + "°";
    this.setState({
      ww: Math.round(viewport.voi.windowWidth),
      wc: Math.round(viewport.voi.windowCenter),
      zoom: viewport.scale.toFixed(2),
      thickness: thickness,
      location: location,
      seriesDate: seriesDate,
      patientName: patientName,
      modality: modality,
      seriesDescription: seriesDescription,
      studyTime: studyTime,
      rotation: rotation
    });
    this.setImageOverlayData(image);
  }

  //remove these functions to a helper file
  formatDate(dateString) {
    if (dateString && dateString.length >= 8)
      return (
        dateString.substring(4, 6) +
        "/" +
        dateString.substring(6) +
        "/" +
        dateString.substring(0, 4)
      );
    return "01/01/1900";
  }

  formatTime(timeString) {
    if (timeString.length > 5)
      return (
        timeString.substring(0, 2) +
        ":" +
        timeString.substring(2, 4) +
        ":" +
        timeString.substring(4, 6)
      );
    return "";
  }

  initializeTools = () => {
    Array.from(this.tools).forEach(tool => {
      const apiTool = this.cornerstoneTools[`${tool.name}Tool`];
      if (apiTool) {
        this.cornerstoneTools.addToolForElement(
          this.state.viewport,
          apiTool,
          tool.configuration
        );
      } else {
        throw new Error(`Tool not found: ${tool.name}Tool`);
      }
    });
  };

  selectImage(event) {
    var targetElement = this.state.viewport;

    // Get the range input value
    var newImageIdIndex = parseInt(event.currentTarget.value, 10);

    // Get the stack data
    var stackToolDataSource = this.cornerstoneTools.getToolState(
      targetElement,
      "stack"
    );
    if (stackToolDataSource === undefined) {
      return;
    }
    var stackData = stackToolDataSource.data[0];

    // Switch images, if necessary
    if (
      newImageIdIndex !== stackData.currentImageIdIndex &&
      stackData.imageIds[newImageIdIndex] !== undefined
    ) {
      this.cornerstone
        .loadAndCacheImage(stackData.imageIds[newImageIdIndex])
        .then(image => {
          var viewport = this.cornerstone.getViewport(targetElement);
          stackData.currentImageIdIndex = newImageIdIndex;
          this.cornerstone.displayImage(targetElement, image, viewport);
        });
    }
  }

  onNewImage(e) {
    //var eventData = e.detail;
    var newImageIdIndex = this.stack.currentImageIdIndex;

    this.setState({ currentImageNum: newImageIdIndex + 1 });
  }

  async getImages() {
    const {
      data: {
        ResultSet: { Result: urls }
      }
    } = await getImageIds({ ...this.state.series }); //get the Wado image ids for this series
    urls.map(url => {
      if (url.multiFrameImage === true) {
        for (var i = 0; i < url.numberOfFrames; i++) {
          this.state.imageIds.push(
            wadoUrl +
              url.lossyImage +
              "&contentType=application%2Fdicom?frame=" +
              i
          );
        }
      } else
        this.state.imageIds.push(
          wadoUrl + url.lossyImage + "&contentType=application%2Fdicom"
        );
    });
    console.log(this.state.imageIds);
  }

  async componentDidMount() {
    console.log("state", this.state);
    await this.getImages();
    this.loadDisplayImage();
    this.state.viewport.addEventListener(
      "cornerstoneimagerendered",
      this.onImageRendered
    );
    this.state.viewport.addEventListener(
      "cornerstonenewimage",
      this.onNewImage
    );
    this.loadProgress.imageIds = this.state.imageIds.slice(0);
    this.loadProgress.remaining = this.loadProgress.total = this.state.imageIds.length;
    this.props.setClick(this.updateViewport);
    window.addEventListener("resize", this.updateViewport);
    this.initializeTools();
  }

  viewportRef = el => {
    this.setState({ viewport: el });
    //this.props.dispatch(this.createViewport(el));
  };

  selectViewport() {
    return this.props.dispatch({
      type: "SELECT_VIEWPORT",
      payload: this.props.id
    });
  }

  // Deep copy the imageIds

  loadDisplayImage() {
    const element = this.state.viewport;
    const stack = this.stack;

    this.cornerstone.events.addEventListener(
      "cornerstoneimageloaded",
      this.onImageLoaded
    );
    this.cornerstone.enable(element);

    this.cornerstone.loadImage(this.state.imageIds[0]).then(image => {
      // first image
      this.cornerstone.displayImage(element, image);
      //this.cornerstoneTools.orientationMarkers.enable(element);
      // Enable mouse, mouseWheel, touch, and keyboard input on the element
      //this.cornerstoneTools.mouseInput.enable(element);
      //this.cornerstoneTools.touchInput.enable(element);
      //this.cornerstoneTools.mouseWheelInput.enable(element);
      //this.cornerstoneTools.keyboardInput.enable(element);

      // add the stack tool state to the ekement
      this.cornerstoneTools.addStackStateManager(element, [
        "stack",
        "playClip",
        "referenceLines"
      ]);
      this.cornerstoneTools.addToolState(element, "stack", stack);

      // Set the div to focused, so keypress events are handled
      element.tabIndex = 0;
      element.focus();
      // Enable all tools we want to use with this element
      //this.cornerstoneTools.setToolActive("StackScroll");
      //this.cornerstoneTools.wwwc.activate(element, 1);
      //this.cornerstoneTools.pan.activate(element, 3);
      const zoomOptions = {
        mouseButtonMask: [1, 2]
      };
      this.cornerstoneTools.setToolActive("Zoom", zoomOptions);
      this.cornerstoneTools.setToolActive("StackScrollMouseWheel", {
        mouseButtonMask: 0,
        isTouchActive: true
      });
      //this.cornerstoneTools.scrollIndicator.enable(element);
      this.cornerstoneTools.stackPrefetch.enable(element);

      //this.cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
      //this.cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
    });
    /* cornerstone.loadImage(this.exampleImage)
    .then(function (image) {
      // console.log(this.viewport);
      cornerstone.displayImage(element, image)
    })*/
  }
  _onMouseMove(e) {
    const bounds = e.target.getBoundingClientRect(); // TODO: move this to another handler for performance tuning
    const px = e.clientX - bounds.left;
    const py = e.clientY - bounds.top;
    if (this.state.pixelSpacing) {
      this.setState({
        coordinates: {
          x: px.toFixed(2),
          y: py.toFixed(2),
          xm: (px * this.state.pixelSpacing.column).toFixed(2),
          ym: (py * this.state.pixelSpacing.row).toFixed(2)
        }
      });
    } else
      this.setState({
        coordinates: {
          x: px.toFixed(2),
          y: py.toFixed(2),
          xm: 0,
          ym: 0
        }
      });
  }

  setImageOverlayData(image) {
    try {
      const rows = image.data.uint16("x00280010");
      const columns = image.data.uint16("x00280011");
      //pixelspacing
      const pixSpacing = image.data.string("x00280030");
      if (pixSpacing.includes("\\")) {
        const spacingArray = pixSpacing.split("\\");
        this.setState({
          pixelSpacing: {
            column: spacingArray[1],
            row: spacingArray[0]
          }
        });
      }
      this.setState({
        imageX: rows,
        imageY: columns
      });
      //constant overlay data is set
    } catch (error) {}
  }

  updateViewport() {
    this.cornerstone.resize(this.state.viewport);
  }

  imageSliderOnInputCallback = value => {
    this.setViewportActive();
    /*
    Temporarily removed because it didn't seem to be performing well
    if (this.props.setViewportSpecificData) {
      this.props.setViewportSpecificData({ stack });
    }*/

    this.scrollToIndex(this.element, value);

    const stack = this.stack;
    stack.currentImageIdIndex = value;

    /*this.setState({
      stack
    });*/
  };

  render() {
    return (
      <React.Fragment>
        <div
          ref={this.viewportRef}
          className="cs"
          id={this.props.id}
          style={{
            height: "100%",
            width: "100%",
            position: "relative"
          }}
          onMouseMove={this._onMouseMove.bind(this)}
          onClick={this.selectViewport.bind(this)}
          //onDoubleClick={this.updateViewport}
        >
          <div
            id="mrtopleft"
            style={{
              position: "absolute",
              top: "3px",
              left: "3px"
            }}
          >
            <div id="imageSize">
              Image Size: {this.state.imageX} x {this.state.imageY}
            </div>
            <div id="viewSize">
              View Size: {this.state.viewX} x {this.state.viewY}
            </div>
            <div id="ww">
              WL: {this.state.wc} WW:
              {this.state.ww}
            </div>
            <div id="px">
              X: {this.state.coordinates.x}
              px Y: {this.state.coordinates.y}
              px
            </div>
            <div id="ps">
              X: {this.state.coordinates.xm}
              mm Y: {this.state.coordinates.ym}
              mm
            </div>
          </div>
          <div
            id="mrtopright"
            style={{ position: "absolute", top: "3px", right: "3px" }}
          >
            <div id="seriesDate">
              {this.state.seriesDate} {this.state.studyTime}
            </div>
            <div id="patientName">{this.state.patientName}</div>
            <div>Series Description</div>
            <div id="description">
              {this.state.modality} / {this.state.seriesDescription}
            </div>
          </div>
          <div
            id="mrbottomright"
            style={{ position: "absolute", bottom: "3px", right: "3px" }}
          />
          <div
            id="mrbottomleft"
            style={{ position: "absolute", bottom: "3px", left: "3px" }}
          >
            <div id="thickness">
              Thickness: {this.state.thickness}
              mm, Location: {this.state.location}
              mm
            </div>
            <div id="zoomText">Zoom: {this.state.zoom}%</div>
            <div id="sliceText">
              Image: {this.state.currentImageNum} / {this.state.imageIds.length}
            </div>
          </div>
          <div
            id="mrbottomright"
            style={{ position: "absolute", bottom: "3px", right: "3px" }}
          >
            <div id="rotation">{this.state.rotation}</div>
          </div>
          <div className="scrollbar">
            <input
              type="range"
              className="imageSlider"
              id="slice-range"
              min="0"
              max={this.state.imageIds.length - 1}
              value={this.stack.currentImageIdIndex}
              onChange={this.selectImage}
              step="1"
            />
          </div>
          {/*<ImageScrollbar
            onInputCallback={this.imageSliderOnInputCallback}
            max={this.stack.imageIds.length - 1}
            value={this.stack.currentImageIdIndex}
            height="100%"
          />*/}
        </div>
      </React.Fragment>
    );
  }
}

export default connect()(ViewportSeg);
