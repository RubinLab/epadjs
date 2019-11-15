import React, { Component } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";

class NewMenu extends React.Component {
  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.onClose();
    }
  };
  render() {
    const element = document.getElementsByClassName(
      "searchView-toolbar__icon new-icon"
    );
    var rect = element[0].getBoundingClientRect();

    return (
      <div ref={this.setWrapperRef}>
        <div
          className="new-popup"
          style={{ left: rect.right - 10, top: rect.bottom + 10 }}
        >
          <div
            className="new-popup__option"
            data-opt="subject"
            onClick={this.props.onSelect}
          >
            New subject
          </div>
          <div
            className="new-popup__option"
            data-opt="study"
            onClick={this.props.onSelect}
          >
            New study
          </div>
          <div
            className="new-popup__option"
            data-opt="series"
            onClick={this.props.onSelect}
          >
            New series
          </div>
          <div
            className="new-popup__option"
            data-opt="annotation"
            onClick={this.props.onSelect}
          >
            New annotation
          </div>
        </div>
      </div>
    );
  }
}

export default NewMenu;
