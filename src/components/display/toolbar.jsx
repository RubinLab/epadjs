import React, { Component } from "react";
import { connect } from "react-redux";
import MetaData from "./metaData";

import { FaLocationArrow } from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import { FiSunset } from "react-icons/fi";
import { FiZoomIn } from "react-icons/fi";
import { FaAdjust } from "react-icons/fa";
import { MdLoop } from "react-icons/md";
import { MdPanTool } from "react-icons/md";
import { FaListAlt } from "react-icons/fa";
import { FiRotateCw } from "react-icons/fi";
import { TiPipette } from "react-icons/ti";
import { MdWbIridescent } from "react-icons/md";
//import { FaDraftingCompass } from "react-icons/fa";

import "./toolbar.css";

const mapStateToProps = state => {
  return {
    cornerstone: state.searchViewReducer.cornerstone,
    cornerstoneTools: state.searchViewReducer.cornerstoneTools,
    activeVP: state.searchViewReducer.activeVP
  };
};

class Toolbar extends Component {
  //state = { activeTool: "" };
  disableAllTools = () => {
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.wwwc.disable(elements[i]);
      this.props.cornerstoneTools.pan.activate(elements[i], 2); // 2 is middle mouse button
      this.props.cornerstoneTools.zoom.activate(elements[i], 4); // 4 is right mouse button
      this.props.cornerstoneTools.probe.deactivate(elements[i], 1);
      this.props.cornerstoneTools.length.deactivate(elements[i], 1);
      this.props.cornerstoneTools.ellipticalRoi.deactivate(elements[i], 1);
      this.props.cornerstoneTools.rectangleRoi.deactivate(elements[i], 1);
      this.props.cornerstoneTools.simpleAngle.deactivate(elements[i], 1);
      this.props.cornerstoneTools.highlight.deactivate(elements[i], 1);
      this.props.cornerstoneTools.freehand.deactivate(elements[i], 1);
      this.props.cornerstoneTools.eraser.deactivate(elements[i], 1);
      this.props.cornerstoneTools.rotate.deactivate(elements[i], 1);
      this.props.cornerstoneTools.wwwcRegion.deactivate(elements[i], 1);
    }
  };

  levels = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.wwwc.activate(elements[i], 1);
    }
  };

  zoom = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.zoom.activate(elements[i], 5);
    }
  };

  invert = () => {
    const element = document.getElementById(this.props.activeVP);
    if (element) {
      const viewport = this.props.cornerstone.getViewport(element);
      viewport.invert = !viewport.invert;
      this.props.cornerstone.setViewport(element, viewport);
    }
  };

  reset = () => {
    this.disableAllTools();
    const element = document.getElementById(this.props.activeVP);
    this.props.cornerstone.reset(element);
  };

  pan = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.pan.activate(elements[i], 3);
    }
  };

  toggleMetaData = () => {
    this.disableAllTools();
    const element = document.getElementById("myForm");
    element.style.display = "block";
  };

  angle = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.simpleAngle.activate(elements[i], 1);
    }
  };

  rotate = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.rotate.activate(elements[i], 1);
    }
  };

  region = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.wwwcRegion.activate(elements[i], 1);
    }
  };

  highlight = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.highlight.activate(elements[i], 1);
    }
  };

  probe = () => {
    this.disableAllTools();
    const elements = document.getElementsByClassName("cs");
    for (var i = 0; i < elements.length; i++) {
      this.props.cornerstoneTools.probe.activate(elements[i], 1);
    }
  };

  render() {
    return (
      <div className="toolbar">
        <div id="noop" tabIndex="1" className="toolbarSectionButton active">
          <div className="toolContainer">
            <FaLocationArrow />
          </div>
          <div className="buttonLabel">
            <span>No Op</span>
          </div>
        </div>

        {/*<a href="#" onClick={()=>alert('mete')}><FaSun /></a>
      <a href="#" onClick={()=>alert('mete')}><TiStarburstOutline /></a>*/}
        <div
          id="wwwc"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.levels}
        >
          <div className="toolContainer">
            <FiSun />
          </div>
          <div className="buttonLabel">
            <span>Levels</span>
          </div>
        </div>

        <div id="preset" tabIndex="1" className="toolbarSectionButton">
          <div className="toolContainer">
            <FiSunset />
          </div>
          <div className="buttonLabel">
            <span>Presets</span>
          </div>
        </div>
        <div
          id="zoom"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.zoom}
        >
          <div className="toolContainer">
            <FiZoomIn />
          </div>
          <div className="buttonLabel">
            <span>Zoom</span>
          </div>
        </div>
        <div
          id="invert"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.invert}
        >
          <div className="toolContainer">
            <FaAdjust />
          </div>
          <div className="buttonLabel">
            <span>Invert</span>
          </div>
        </div>
        <div
          id="reset"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.reset}
        >
          <div className="toolContainer">
            <MdLoop />
          </div>
          <div className="buttonLabel">
            <span>Reset</span>
          </div>
        </div>
        <div
          id="pan"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.pan}
        >
          <div className="toolContainer">
            <MdPanTool />
          </div>
          <div className="buttonLabel">
            <span>Pan</span>
          </div>
        </div>
        <div
          id="pan"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.toggleMetaData}
        >
          <div className="toolContainer">
            <FaListAlt />
          </div>
          <div className="buttonLabel">
            <span>SeriesData</span>
          </div>
        </div>
        <MetaData />
        <div
          id="angle"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.angle}
        >
          <div className="toolContainer" />
          <div className="buttonLabel">
            <span>Angle</span>
          </div>
        </div>
        <div
          id="angle"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.rotate}
        >
          <div className="toolContainer">
            <FiRotateCw />
          </div>
          <div className="buttonLabel">
            <span>Rotate</span>
          </div>
        </div>
        <div
          id="angle"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.region}
        >
          <div className="toolContainer">
            <FaListAlt />
          </div>
          <div className="buttonLabel">
            <span>Region</span>
          </div>
        </div>
        <div
          id="angle"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.highlight}
        >
          <div className="toolContainer">
            <MdWbIridescent />
          </div>
          <div className="buttonLabel">
            <span>Highlight</span>
          </div>
        </div>
        <div
          id="angle"
          tabIndex="1"
          className="toolbarSectionButton"
          onClick={this.probe}
        >
          <div className="toolContainer">
            <TiPipette />
          </div>
          <div className="buttonLabel">
            <span>Probe</span>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Toolbar);
