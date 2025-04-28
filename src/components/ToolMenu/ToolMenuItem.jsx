import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { reverseKeyMap } from '../../constants';

class ToolMenuItem extends Component {
  handleClick = () => {
    this.props.onClick();
  };

  render() {
    const { index, isActive, icon, name, children } = this.props;
    return (
      <>
        <div
          tabIndex={index}
          className={
            isActive ? "toolbarSectionButton_Active" : "toolbarSectionButton"
          }
          onClick={this.handleClick}
          data-for={`${name}-icon`}
          >
          <div className="toolContainer">{icon}</div>
          <div className="buttonLabel">
            <span>{name}</span>
          </div>
          {children}
        </div>
        {reverseKeyMap[name] && <ReactTooltip
          id={`${name}-icon`}
          place="top"
          type="info"
          delayShow={500}
        >
          <span className="filter-label">{`hotkey: ${reverseKeyMap[name]}`}</span>
        </ReactTooltip>
        }
      </>
    );
  }
}

export default ToolMenuItem;
