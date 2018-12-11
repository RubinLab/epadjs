import React, { Component } from "react";

class AnotateView extends Component {
  componentWillUnmount() {
    alert("Anotate will unmount");
  }

  render() {
    return <h1>Anotate View</h1>;
  }
}

export default AnotateView;
