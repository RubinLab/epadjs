import React, { Component } from "react";

class ToolMenuItem extends Component {
  handleClick = () => {
    this.props.onClick();
  };

  render() {
    return (
      <div
        tabIndex={this.props.index}
        className={
          this.props.isActive
            ? "toolbarSectionButton_Active"
            : "toolbarSectionButton"
        }
        onClick={this.handleClick}
      >
        <div className="toolContainer">{this.props.icon}</div>
        <div className="buttonLabel">
          <span>{this.props.name}</span>
        </div>
      </div>
    );
  }
}

export default ToolMenuItem;
