import React, { Component } from "react";
import cornerstoneTools from "cornerstone-tools";
import InputRange from "react-input-range";
import { relative } from "joi-browser";
// import "./SmartBrushMenu.css";

const brushModule = cornerstoneTools.store.modules.segmentation;

const spanStyle = {
  position: "relative",
  "margin-bottom": "1em",
  display: "inline-block",
};

class BrushSizeSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      size: 10,
    };
  }

  applyBrushSize = (value) => {
    brushModule.setters.radius(value);
  };

  render() {
    return (
      <div className="range-container">
        <span style={spanStyle}>Brush Size</span>
        <InputRange
          //   style={inputRange}
          //   disabled={this.state.rangeDisabled}
          step={1}
          minValue={1}
          maxValue={50}
          value={this.state.size}
          onChange={(value) => this.setState({ size: value })}
          onChangeComplete={(value) => this.applyBrushSize(value)}
        />
      </div>
    );
  }
}

export default BrushSizeSelector;
