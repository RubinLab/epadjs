import React, { Component } from "react";
import * as cornerstone from "cornerstone-core";
import { toast } from "react-toastify";
import "./EyeTracker.css";

class EyeTracker extends Component {
  constructor(props) {
    super(props);
    this.logs = [];
    this.state = {
      logging: false
    };
  }

  keyPress = event => {
    console.log("event object", event);
    if (event.keyCode == 89 && event.shiftKey) {
      this.captureLog({ detail: "Shift+Y_pressed" });
      toast.error("Phneumothorax", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } else if (event.keyCode == 78 && event.shiftKey) {
      this.captureLog({ detail: "Shift+N_pressed" });
      toast.success("No Phneumothorax", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  startLogging = () => {
    this.setState({ logging: true });
    window.addEventListener("eyeTrackerShouldLog", this.captureLog);
    document.onkeypress = this.keyPress;
    this.captureLog({ detail: "loggingStarted" });
  };

  captureLog = event => {
    const newLog = this.getLogData();
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

    const { x, y } = viewport.translation;

    return {
      zoom: viewport.scale,
      ...viewport.voi,
      translationX: x,
      translationY: y
    };
  };

  stopLogging = () => {
    this.captureLog({ detail: "loggingStopped" });
    this.setState({ logging: false });
    window.removeEventListener("eyeTrackerShouldLog", this.captureLog);
    this.downloadLog();
  };

  downloadLog = () => {
    var json = JSON.stringify(this.logs);
    var blob = new Blob([json]);
    var objectUrl = URL.createObjectURL(blob);

    window.open(objectUrl);
  };

  clearLog = () => {
    this.logs.length = 0;
    toast.info("Log Cleared", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    this.captureLog({ detail: "logCleared" });
    this.captureLog({ detail: "loggingStarted" });
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
        <span>&nbsp;</span>
        <button
          className="log-stop-button"
          name="clear"
          onClick={this.clearLog}
        >
          Clear Log
        </button>
      </div>
    );
  }
}

export default EyeTracker;
