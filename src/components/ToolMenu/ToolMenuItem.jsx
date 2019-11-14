import React, { Component } from "react";

class ToolMenuItem extends Component {
  handleClick = () => {
    this.props.onClick();
  };

  render() {
    const { index, isActive, icon, name, children } = this.props;
    return (
      <div
        tabIndex={index}
        className={
          isActive ? "toolbarSectionButton_Active" : "toolbarSectionButton"
        }
        onClick={this.handleClick}
      >
        <div className="toolContainer">{icon}</div>
        <div className="buttonLabel">
          <span>{name}</span>
        </div>
        {children}
      </div>
    );
  }
}

export default ToolMenuItem;
