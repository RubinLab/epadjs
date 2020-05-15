import React, { Component } from "react";
import { connect } from "react-redux";
import * as cornerstone from "cornerstone-core";
import { toast } from "react-toastify";
import "./EyeTracker.css";
import {
  closeSerie,
  getSingleSerie,
  addToGrid,
} from "../annotationsList/action";
import { getAllSeriesofProject } from "../../services/seriesServices";
import {
  startEyeTrackerLog,
  stopEyeTrackerLog,
  setCapture,
} from "../../services/eyeTrackerServices";

class EyeTracker extends Component {
  constructor(props) {
    super(props);
    this.logs = [];
    this.lastSkippedLog = {};
    this.state = {
      logging: false,
      loading: true,
    };
  }
  componentDidMount() {
    if (this.props.series.length) {
      getAllSeriesofProject("lite").then(({ data }) => {
        this.setState({ series: data });
        const currentSeries = this.getCurrentSeries();
        const currentSeriesIdx = this.findIndexOfSeries(currentSeries);
        this.setState({ currentSeriesIdx, loading: false });
      });
    }
  }

  isLoading = () => {
    const { loading } = this.state;
    if (loading) {
      window.alert(
        "Data has not been fully loaded yet, please wait untill it is loaded!"
      );
      return false;
    }
    return true;
  };

  loadNextSeries = () => {
    if (!this.isLoading()) return;
    const { series, currentSeriesIdx } = this.state;
    if (series.length > currentSeriesIdx + 1) {
      this.props.dispatch(closeSerie());
      this.props.dispatch(addToGrid(series[currentSeriesIdx + 1]));
      this.props.dispatch(getSingleSerie(series[currentSeriesIdx + 1]));
      this.setState({ currentSeriesIdx: currentSeriesIdx + 1 });
    } else {
      toast.error("No More Series / Images to Display", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  loadPreviousSeries = () => {
    if (!this.isLoading()) return;
    const { series, currentSeriesIdx } = this.state;
    if (currentSeriesIdx) {
      this.props.dispatch(closeSerie());
      this.props.dispatch(addToGrid(series[currentSeriesIdx - 1]));
      this.props.dispatch(getSingleSerie(series[currentSeriesIdx - 1]));
      this.setState({ currentSeriesIdx: currentSeriesIdx - 1 });
    } else {
      toast.error("No More Series / Images to Display", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  keyPress = (event) => {
    if (event.keyCode == 97) this.loadPreviousSeries();
    if (event.keyCode == 100) this.loadNextSeries();
    if (event.keyCode == 89 && event.shiftKey) {
      this.captureLog({ detail: "Shift+Y_pressed" });
      toast.error("Phneumothorax", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (event.keyCode == 78 && event.shiftKey) {
      this.captureLog({ detail: "Shift+N_pressed" });
      toast.success("No Phneumothorax", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  startLogging = () => {
    setCapture({ shouldLog: true });
    startEyeTrackerLog().then(() => {
      this.setState({ logging: true });
      window.addEventListener("eyeTrackerShouldLog", this.captureLog);
      document.onkeypress = this.keyPress;
      this.captureLog({ detail: "loggingStarted" });
    });
  };

  stopLogging = () => {
    setCapture({ shouldLog: false });
    this.captureLog({ detail: "loggingStopped" });
    this.setState({ logging: false });
    const log = JSON.stringify(this.logs);
    window.removeEventListener("eyeTrackerShouldLog", this.captureLog);

    stopEyeTrackerLog(log);
  };

  captureLog = (event) => {
    const newLog = this.getLogData();
    if (
      this.lastSkippedLog.event &&
      this.lastSkippedLog.event === "windowLevel" &&
      newLog.event !== "windowLevel"
    )
      this.logs.push({ event: event.detail, ...newLog }); // log the last windowLevel value
    if (event.detail === "windowLevel") {
      // if the even is windowLevel log it if over threshold
      if (this.isOverThreshold(newLog))
        this.logs.push({ event: event.detail, ...newLog });
      else this.lastSkippedLog = newLog;
    } else this.logs.push({ event: event.detail, ...newLog });
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
      BoundingboxWidth: bb.width,
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
      imageColumns: image.columns,
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
      translationY: y,
    };
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
      draggable: true,
    });
    this.captureLog({ detail: "logCleared" });
    this.captureLog({ detail: "loggingStarted" });
  };

  // returns the displayed series Id
  getCurrentSeries = () => {
    const { imageId } = this.getImageData();
    if (imageId.includes("objectUID=")) return imageId.split("objectUID=")[1];
    return imageId.split("/").pop();
  };

  findIndexOfSeries = (seriesId) => {
    for (var i = 0; i < this.state.series.length; i++) {
      if (this.state.series[i].seriesUID === seriesId) return i;
    }
  };

  isOverThreshold = (newLog) => {
    const { windowCenter, windowWidth } = newLog;
    const lastLog = this.logs[this.logs.length - 1];
    if (
      lastLog &&
      0.95 < windowCenter / lastLog.windowCenter &&
      windowCenter / lastLog.windowCenter < 1.05 &&
      0.95 < windowWidth / lastLog.windowWidth &&
      windowWidth / lastLog.windowWidth < 1.05
    ) {
      return false;
    } else return true;
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

const mapStateToProps = (state) => {
  return {
    series: state.annotationsListReducer.openSeries,
  };
};

export default connect(mapStateToProps)(EyeTracker);
