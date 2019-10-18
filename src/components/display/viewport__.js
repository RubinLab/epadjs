import React, { Component } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";

import { getImageIds } from "../../services/seriesServices";

import "./viewport.css";

function getBlobUrl(url) {
  const baseUrl = window.URL || window.webkitURL;
  const blob = new Blob([`importScripts('${url}')`], {
    type: "application/javascript"
  });

  return baseUrl.createObjectURL(blob);
}

// We do not need this now. Only if a DICOM has some play
var EPAD = {
  viewer: {
    cine: {
      loop: true,
      framesPerSecond: 24
    },
    loadedSeriesData: {}
  }
};

class Viewport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      series: { ...this.props },
      images: {},
      imageIds: [],
      viewport: ""
    };

    const loadProgress = {
      imageIds: this.state.imageIds.slice(0),
      total: this.state.imageIds.length,
      remaining: this.state.imageIds.length,
      percentLoaded: 0
    };
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    //cornerstoneTools.external.Hammer = Hammer;
    //cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

    this.stack = {
      currentImageIdIndex: 0,
      imageIds: this.state.imageIds
    };

    let webWorkerUrl = getBlobUrl(
      "https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js"
    );
    let codecsUrl = getBlobUrl(
      "https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js"
    );

    const config = {
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      startWebWorkersOnDemand: true,
      webWorkerPath: webWorkerUrl,
      //webWorkerTaskPaths: [webWorkerTaskPath],
      taskConfiguration: {
        decodeTask: {
          loadCodecsOnStartup: true,
          initializeCodecsOnStartup: false,
          codecsPath: codecsUrl,
          usePDFJS: false
        }
      }
    };

    const confug = {
      drawAllMarkers: true
    };

    cornerstoneTools.orientationMarkers.setConfiguration(confug);

    //cornerstoneWebImageLoader.webWorkerManager.initialize(config);
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
  } //end of constructor

  onImageLoaded(event) {
    alert("Domebody called me");
    var eventData = event.detail;
    var imageId = eventData.image.imageId;
    var imageIds = this.loadProgress["imageIds"];

    // Remove all instances, in case the stack repeats imageIds
    for (var i = this.state.imageIds.length - 1; i >= 0; i--) {
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
      console.timeEnd("Loading");
    }

    // Write to a span in the DOM
    var currentValueSpan = document.getElementById("loadProgress");
    currentValueSpan.textContent = this.loadProgress["percentLoaded"];
  }

  async getImages() {
    const { data: urls } = await getImageIds({ ...this.state.series }); //get the Wado image ids for this series
    urls.map(url =>
      this.state.imageIds.push(
        "wadouri:http://epad-dev8.stanford.edu:8080/epad/wado/" +
          url.lossyImage +
          "&contentType=application%2Fdicom"
      )
    );
  }

  async componentDidMount() {
    await this.getImages();
    console.log("CDM" + this.state.imageIds);
    //this.setState({ stack: { imageIds: this.state.imageIds } });
    this.loadDisplayImage();
  }

  viewportRef = el => {
    this.state.viewport = el;
  };
  // Deep copy the imageIds

  loadDisplayImage() {
    const element = this.state.viewport;
    cornerstone.enable(element);
    console.log("Stack is Mete");
    console.log(this.stack);
    const stack = this.stack;

    cornerstone.loadImage(this.state.imageIds[0]).then(function(image) {
      // first image
      cornerstone.displayImage(element, image);
      cornerstoneTools.orientationMarkers.enable(element);
      // Enable mouse, mouseWheel, touch, and keyboard input on the element
      cornerstoneTools.mouseInput.enable(element);
      //cornerstoneTools.touchInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      cornerstoneTools.keyboardInput.enable(element);

      // add the stack tool state to the ekement
      cornerstoneTools.addStackStateManager(element, [
        "stack",
        "playClip",
        "referenceLines"
      ]);
      cornerstoneTools.addToolState(element, "stack", stack);

      // Set the div to focused, so keypress events are handled
      element.tabIndex = 0;
      element.focus();
      // Enable all tools we want to use with this element
      cornerstoneTools.stackScrollKeyboard.activate(element);
      cornerstoneTools.stackScroll.activate(element, 1);
      cornerstoneTools.pan.activate(element, 3);
      cornerstoneTools.stackScrollWheel.activate(element);
      cornerstoneTools.scrollIndicator.enable(element);
      cornerstoneTools.stackPrefetch.enable(element);

      //cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
      //cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
    });
    /* cornerstone.loadImage(this.exampleImage)
    .then(function (image) {
      // console.log(this.viewport);
      cornerstone.displayImage(element, image)
    })*/
  }

  render() {
    return (
      <div ref={this.viewportRef} id="cs">
        <h5>
          Percentage loaded <span id="loadProgress" />
        </h5>
      </div>
    );
  }
}

export default Viewport;
