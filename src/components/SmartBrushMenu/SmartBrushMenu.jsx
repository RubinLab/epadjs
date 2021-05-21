import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import InputRange from "react-input-range";
import Draggable from "react-draggable";
import "./SmartBrushMenu.css";
import BrushSettings from '../../ohif-segmentation-plugin/components/segmentationMenu/BrushSettings';

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

  componentDidMount() {
    if (!this.checkIfCT()) {
      const { minPixelValue, maxPixelValue } = this.getMinMaxPixelValues();
      const customBrush = { min: minPixelValue, max: maxPixelValue };
      this.setState({ customBrush });
      brushModule.setters.activeGate("custom");
      brushModule.setters.customGateRange(minPixelValue, maxPixelValue);
    }
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

  clearIntervalConfiguration = () => {
    const { minInterval, maxInterval } = brushModule.configuration;
    if (minInterval)
      delete brushModule.configuration.minInterval;
    if (maxInterval)
      delete brushModule.configuration.maxInterval;
  }

  handleApplyToImageChange = (e) => {
    var checked = e.target.checked;
    brushModule.configuration.applyToImage = checked;
    this.clearIntervalConfiguration();
    this.setState({ intervalDisabled: checked, minInterval: "", maxInterval: "" })
  }

  handleApplyToMinChange = (evt) => {
    const min = evt.target.value;
    this.setState({ minInterval: min });
    brushModule.configuration.applyToImage = true;
    brushModule.configuration.minInterval = parseInt(min);
  }

  handleApplyToMaxChange = (evt) => {
    const max = evt.target.value;
    this.setState({ maxInterval: max });
    brushModule.configuration.applyToImage = true;
    brushModule.configuration.maxInterval = parseInt(max);
  }

  getLastImageIndexOfSeries = () => {
    const elements = cornerstone.getEnabledElements();
    if (elements.length) {
      const { element } = elements[this.props.activePort];
      const stackToolState = cornerstoneTools.getToolState(element, "stack");
      return stackToolState.data[0].imageIds.length;
    }
    else return 1;
  }

  getActiveImage = () => {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    return cornerstone.getImage(element);
  };

  checkIfCT = () => {
    try {
      const image = this.getActiveImage();
      const seriesModule =
        cornerstone.metaData.get("generalSeriesModule", image.imageId) || {};
      const modality = seriesModule.modality;
      if (modality === "CT") return true;
      return false;
    } catch (error) {
    }
  };

  getMinMaxPixelValues = () => {
    const { minPixelValue, maxPixelValue } = this.getActiveImage();
    return { minPixelValue, maxPixelValue };

  }

  handleMinRangeChange = (min) => {
    const brushNewValues = { ...this.state.customBrush };
    const newMin = Math.min(Number(min), (brushNewValues.max - 1))//Dont set the min more than max value
    brushNewValues.min = newMin;
    this.setState({ customBrush: brushNewValues });
  }

  handleMaxRangeChange = (max) => {
    const brushNewValues = { ...this.state.customBrush };
    const newMax = Math.max(Number(max), (brushNewValues.min + 1))//Dont set the min more than max value
    brushNewValues.max = newMax;
    this.setState({ customBrush: brushNewValues });
  }

  render() {
    const maxApplyToImageNum = this.getLastImageIndexOfSeries();
    const { isHuGated, isSphericalBrush } = this.props;
    const isCT = this.checkIfCT();
    let minValue = 0, maxValue = 255;
    if (isCT !== undefined && !isCT) {
      const { minPixelValue, maxPixelValue } = this.getMinMaxPixelValues();
      minValue = minPixelValue; maxValue = maxPixelValue;
    }
    else { minValue = -1000; maxValue = 3000 }
    const { customBrush } = this.state;
    return (
      <Draggable handle="#handle">
        <div className="smb-pop-up">
          <div className="close-smart-brush-menu" onClick={this.props.onClose}>
            <a href="#">X</a>
          </div>
          <div id="handle" className="buttonLabel">
            <span>Brush Menu</span>
          </div>
          <hr />
          <BrushSettings />
          {!isSphericalBrush && (
            <div>
              <div>
                <span>Apply to whole image </span>
                <input
                  type="checkbox"
                  name="applyToImage"
                  onChange={this.handleApplyToImageChange}
                  disabled={this.state.applyToImageDisabled}
                />
              </div>
              <div>
                <span>Apply images </span>
                <input type="number"
                  min="1"
                  max={maxApplyToImageNum - 1}
                  value={this.state.minInterval}
                  className={"slice-field"}
                  onChange={this.handleApplyToMinChange}
                  style={{
                    width: "50px",
                    height: "20px",
                    opacity: 1,
                  }}
                  disabled={this.state.intervalDisabled}
                />
                <span> to </span>
                <input type="number"
                  min="2"
                  max={maxApplyToImageNum}
                  value={this.state.maxInterval}
                  className={"slice-field"}
                  onChange={this.handleApplyToMaxChange}
                  style={{
                    width: "50px",
                    height: "20px",
                    opacity: 1,
                  }}
                  disabled={this.state.intervalDisabled}
                />
              </div> </div>)}
          {isHuGated && isCT && (
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
                      {/* <InputRange
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
                      /> */}
                      <div>
                        <input type="number"
                          min={minValue}
                          max={customBrush.max - 1}
                          value={this.state.customBrush.min}
                          className={"slice-field"}
                          onChange={(evt) => this.handleMinRangeChange(evt.target.value)}
                          style={{
                            width: "60px",
                            height: "20px",
                            opacity: 1,
                          }}
                          disabled={this.state.rangeDisabled}
                        />
                        <span> to </span>
                        <input type="number"
                          min={customBrush.min + 1}
                          max={maxValue}
                          value={this.state.customBrush.max}
                          className={"slice-field"}
                          onChange={(evt) => this.handleMaxRangeChange(evt.target.value)}
                          style={{
                            width: "60px",
                            height: "20px",
                            opacity: 1,
                          }}
                          disabled={this.state.rangeDisabled}
                        />
                      </div>
                    </div>

                  )}
                </div>
              ))}
            </div>
          )}
          {isHuGated && !isCT && (
            <div className="range-container">
              <InputRange
                style={inputRange}
                step={1}
                maxValue={maxValue}
                minValue={minValue}

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
      </Draggable>
    );
  }
}

export default SmartBrushMenu;
