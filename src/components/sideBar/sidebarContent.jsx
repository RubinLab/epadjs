import React, { Component } from "react";

const sidebarContent = props => {
  return (
    <div>
      <table>
        <tbody>{props.children}</tbody>
      </table>
    </div>
  );
};

export default sidebarContent;
