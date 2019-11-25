import React, { Component } from "react";
import * as cornerstone from "cornerstone-core";
import "./EyeTracker.css";

class EyeTracker extends Component {
  constructor(props) {
    super(props);
    this.logs = [];
    this.state = {
      logging: false
    };
  }

  eyeTrackerLogger = () => {};

  startLogging = () => {
    this.setState({ logging: true });
    window.addEventListener("eyeTrackerShouldLog", this.captureLog);
  };

  captureLog = event => {
    const newLog = this.getLogData();
    console.log({ event: event.detail, ...newLog });
    this.logs.push({ event: event.detail, ...newLog });
  };

  getLogData = () => {
    const bbCords = this.getBoundingBoxCoordinates();
    const viewportData = this.getViewportData();
    const imageData = this.getImageData();
    const timestamp = +new Date();
    return { timestamp, ...imageData, ...bbCords, ...viewportData };
  };

  //returns the image bounding box coordinates (top left) with respect to screen
  getBoundingBoxCoordinates = () => {
    const { element } = cornerstone.getEnabledElements()[0];
    const bb = element.getBoundingClientRect();
    console.log("BB", bb);
    const x = window.screenX + bb.left;
    const y = window.screenY + this.getToolbarHeight() + bb.top;
    return {
      BoundingboxLeft: x,
      BoundingboxRight: y,
      BoundingboxHeight: bb.height,
      BoundingboxWidth: bb.width
    };
  };

  getToolbarHeight = () => {
    const height = window.outerHeight - window.innerHeight;
    return height;
  };

  getImageData = () => {
    const { element } = cornerstone.getEnabledElements()[0];
    const image = cornerstone.getImage(element);

    return {
      imageId: image.imageId,
      imageRows: image.rows,
      imageColumns: image.columns
    };
  };

  getViewportData = () => {
    const { element } = cornerstone.getEnabledElements()[0];
    const viewport = cornerstone.getViewport(element);
    console.log("Viewport", viewport);

    const { x, y } = viewport.translation;

    return {
      zoom: viewport.scale,
      ...viewport.voi,
      translationX: x,
      translationY: y
    };
  };

  stopLogging = () => {
    this.setState({ logging: false });
    window.removeEventListener("eyeTrackerShouldLog", this.captureLog);
    this.downloadLog();
  };

  downloadLog = () => {
    console.log("Logs", ...this.logs);
    var json = JSON.stringify(this.logs);
    var blob = new Blob([json]);
    var objectUrl = URL.createObjectURL(blob);

    window.open(objectUrl);
  };

  render() {
    return (
      <div>
        {!this.state.logging && (
          <button
            className="log-button"
            name="Start"
            onClick={this.startLogging}
          >
            Start
          </button>
        )}
        {this.state.logging && (
          <button
            className="log-stop-button"
            name="Stop"
            onClick={this.stopLogging}
          >
            Stop
          </button>
        )}
      </div>
    );
  }
}

export default EyeTracker;
