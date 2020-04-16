import React, { Component } from "react";

const sidebarContent = props => {
  return (
    <table className="sidebar-content">
      <tbody>{props.children}</tbody>
    </table>
  );
};

export default sidebarContent;
