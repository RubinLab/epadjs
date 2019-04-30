import React, { Component } from "react";

class AnotateView extends Component {
  componentWillUnmount() {
    alert("Anotate will unmount");
  }

  render() {
    return <h1>Annotate View</h1>;
  }
}

export default AnotateView;
