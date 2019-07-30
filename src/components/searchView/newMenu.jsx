import React, { Component } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";

class NewMenu extends React.Component {
  state = {
    activeDrags: 0,
    deltaPosition: {
      x: 0,
      y: 0
    },
    controlledPosition: {
      x: -400,
      y: 200
    }
  };

  handleDrag(e, ui) {
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY
      }
    });
  }

  onStart() {
    this.setState({ activeDrags: ++this.state.activeDrags });
  }

  onStop() {
    this.setState({ activeDrags: --this.state.activeDrags });
  }

  // For controlled component
  adjustXPos(e) {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = this.state.controlledPosition;
    this.setState({ controlledPosition: { x: x - 10, y } });
  }

  adjustYPos(e) {
    e.preventDefault();
    e.stopPropagation();
    const { controlledPosition } = this.state;
    const { x, y } = controlledPosition;
    this.setState({ controlledPosition: { x, y: y - 10 } });
  }

  onControlledDrag(e, position) {
    const { x, y } = position;
    this.setState({ controlledPosition: { x, y } });
  }

  onControlledDragStop(e, position) {
    this.onControlledDrag(e, position);
    this.onStop();
  }

  render() {
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    const { deltaPosition, controlledPosition } = this.state;

    const element = document.getElementsByClassName(
      "searchView-toolbar__icon new-icon"
    );
    var rect = element[0].getBoundingClientRect();

    return (
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
    );
  }
}

export default NewMenu;
