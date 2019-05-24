import React, { Component } from "react";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.min.css";

export function ContextMenu() {
  return (
    <Menu id="menu_id">
      <Submenu label="Draw">
        <Item onClick={onClick}>
          Point &nbsp;&nbsp;&nbsp;
          {/* <FiZo,omIn /> */}
        </Item>
        <Item onClick={onClick}>Length</Item>
        <Item onClick={onClick}>Ellipse</Item>
        <Item onClick={onClick}>Rectangle</Item>
        <Item onClick={onClick}>Polygon/Freehand</Item>
        <Item onClick={onClick}>Sculpt</Item>
        <Item onClick={onClick}>Brush</Item>
        <Item onClick={onClick}>Eraser</Item>
      </Submenu>
      <Separator />
      <Item onClick={closeViewport}>Close</Item>
      <Item onClick={onClick}>Download</Item>
    </Menu>
  );
}

const onClick = () => {
  alert("I have been clicked :)");
};

const closeViewport = () => {};
