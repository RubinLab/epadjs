import React, { Component } from "react";
import cornerstoneTools from "cornerstone-tools";
import InputRange from "react-input-range";
import Draggable from "react-draggable";

const brushModule = cornerstoneTools.store.modules.segmentation;
const inputRange = { top: "5em" };

class SMB extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showBrushMenu: false,
      customBrush: {
        min: -1000,
        max: 3000
      },
      rangeDisabled: true
    };
  }

  componentDidUpdate = () => {
    const { showBrushMenu } = this.props;
    this.setState({ showBrushMenu });
  };

  handleBrushChange = gateName => {
    if (gateName === "custom") this.setState({ rangeDisabled: false });
    else this.setState({ rangeDisabled: true });
    brushModule.setters.activeGate(gateName);
  };

  closeBrushMenu = () => {
    this.setState({ showBrushMenu: false });
  };

  applyCustomBrushValues = values => {
    const { min, max } = values;
    brushModule.customGateRange(min, max);
  };

  render() {
    return (
      this.state.showBrushMenu && (
        <Draggable>
          <div
            className="segmentation-menu"
            onMouseLeave={() => this.closeBrushMenu()}
          >
            <div className="buttonLabel">
              <span>Preset Brushes</span>
            </div>
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
                        onChange={value =>
                          this.setState({ customBrush: value })
                        }
                        onChangeComplete={value =>
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
      )
    );
  }
}

export default SMB;
