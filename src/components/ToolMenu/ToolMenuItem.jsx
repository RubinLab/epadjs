import React, { Component } from "react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { reverseKeyMap } from '../../constants';

class ToolMenuItem extends Component {
  handleClick = () => {
    this.props.onClick();
  };

  renderTooltip = (props) => {
    const { name } = this.props;
    const hotkey = reverseKeyMap[name];
    if (hotkey) {
      return (
        <Tooltip id="button-tooltip" {...props}>
          {`hotkey: ${hotkey}`}
        </Tooltip>
      );
    }
    return null;
  }

  render() {
    const { index, isActive, icon, name, children } = this.props;
    const hotkey = reverseKeyMap[name];

    const menuItem = (
      <div
        tabIndex={index}
        className={isActive ? "toolbarSectionButton_Active" : "toolbarSectionButton"}
        onClick={this.handleClick}
      >
        <div className="toolContainer">{icon}</div>
        <div className="buttonLabel">
          <span>{name}</span>
        </div>
        {children}
      </div>
    );

    if (hotkey) {
      return (
        <OverlayTrigger
          placement="right"
          delay={{ show: 500, hide: 250 }}
          overlay={this.renderTooltip}
        >
          {menuItem}
        </OverlayTrigger>
      );
    }

    return menuItem;
  }
}

export default ToolMenuItem;
