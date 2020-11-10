import React, { Component } from "react";
import cornerstoneTools from "cornerstone-tools";
import InputRange from "react-input-range";
import Draggable from "react-draggable";
import "./SmartBrushMenu.css";

const brushModule = cornerstoneTools.store.modules.segmentation;
const inputRange = { top: "5em" };

class SmartBrushMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customBrush: {
        min: -1000,
        max: 3000,
      },
      rangeDisabled: true,
    };
  }

  handleBrushChange = (gateName) => {
    if (gateName === "custom") this.setState({ rangeDisabled: false });
    else this.setState({ rangeDisabled: true });
    brushModule.setters.activeGate(gateName);
  };

  applyCustomBrushValues = (values) => {
    const { min, max } = values;
    brushModule.setters.customGateRange(min, max);
  };

  handleApplyToImageChange = (e) => {    
    var checked = e.target.checked;
    brushModule.configuration.applyToImage = checked;
  }

  render() {
    return (
      <Draggable>
        <div className="smb-pop-up">
          <div className="close-smart-brush-menu" onClick={this.props.onClose}>
            <a href="#">X</a>
          </div>
          <div className="buttonLabel">
            <span>Preset Brushes</span>
          </div>
          <div><span>Apply to whole image</span><input type="checkbox" name="applyToImage" onChange={this.handleApplyToImageChange}/></div>
          <div className="brush-presets">
            {brushModule.state.gates.map((gate, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="brushPresets"
                  value={gate.name}
                  onChange={() => this.handleBrushChange(gate.name)}
                  defaultChecked={
                    gate.name === brushModule.getters.activeGate()
                  }
                />
                {gate.name !== "custom" &&
                  " " +
                    gate.displayName +
                    " [" +
                    gate.range.toString() +
                    "]" +
                    " HU"}
                {gate.name === "custom" &&
                  " " +
                    gate.displayName +
                    " [" +
                    this.state.customBrush.min +
                    ", " +
                    this.state.customBrush.max +
                    "]" +
                    " HU"}
                {gate.name === "custom" && (
                  <div className="range-container">
                    <InputRange
                      style={inputRange}
                      disabled={this.state.rangeDisabled}
                      step={1}
                      maxValue={3000}
                      minValue={-1000}
                      // formatLabel={value => `${value} HU`}
                      value={this.state.customBrush}
                      onChange={(value) =>
                        this.setState({ customBrush: value })
                      }
                      onChangeComplete={(value) =>
                        this.applyCustomBrushValues(value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Draggable>
    );
  }
}

export default SmartBrushMenu;
