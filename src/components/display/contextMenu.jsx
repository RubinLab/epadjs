import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.min.css";
import { closeSerie } from "../annotationsList/action";

class ContextMenu extends Component {
  render() {
    return (
      <Menu id="menu_id">
        <Submenu label="Draw">
          <Item onClick={this.onClick}>
            Point &nbsp;&nbsp;&nbsp;
            {/* <FiZo,omIn /> */}
          </Item>
          <Item onClick={this.onClick}>Length</Item>
          <Item onClick={this.onClick}>Ellipse</Item>
          <Item onClick={this.onClick}>Rectangle</Item>
          <Item onClick={this.onClick}>Polygon/Freehand</Item>
          <Item onClick={this.onClick}>Sculpt</Item>
          <Item onClick={this.onClick}>Brush</Item>
          <Item onClick={this.onClick}>Eraser</Item>
        </Submenu>
        <Separator />
        <Item onClick={this.closeViewport}>Close</Item>
        <Item onClick={this.onClick}>Download</Item>
      </Menu>
    );
  }

  onClick = () => {
    alert("I have been clicked :)");
  };

  closeViewport = () => {
    this.props.dispatch(closeSerie());
  };
}

// const mapDispatchToProps = dispatch => {
//   return bindActionCreators(closeSerie, dispatch);
// };

export default connect()(ContextMenu);
