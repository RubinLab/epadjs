import React, { Component } from "react";

class ProgressView extends Component {
  componentWillUnmount() {
    alert("Progress will unmount");
  }
  render() {
    return <h1>Progress View</h1>;
  }
}

export default ProgressView;
