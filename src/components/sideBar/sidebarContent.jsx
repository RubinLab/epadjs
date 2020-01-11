import React, { Component } from "react";

const sidebarContent = props => {
  return (
    <table>
      <tbody>{props.children}</tbody>
    </table>
  );
};

export default sidebarContent;
