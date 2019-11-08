import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import { FaTimes } from "react-icons/fa";
import "./WindowLevel.css";

export class WindowLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      level: "",
      window: ""
    };
  }
  setPreset = preset => {
    const activeElement = cornerstone.getEnabledElements()[
      this.props.activePort
    ]["element"];
    const vp = cornerstone.getViewport(activeElement);
    vp.voi.windowCenter = preset.level;
    vp.voi.windowWidth = preset.window;
    cornerstone.setViewport(this.props.activeElement, vp);
    this.setState({ level: preset.level, window: preset.window });
  };
  handleChange = e => {};

  render() {
    const presets = [
      { name: "CT Abdomen", level: 40, window: 350 },
      { name: "CT Bone", level: 300, window: 1500 },
      { name: "CT Brain", level: 50, window: 100 },
      { name: "CT Lung", level: -500, window: 1400 },
      { name: "CT Radiographic Bone", level: 1638, window: 3276 },
      { name: "CT Liver", level: 98, window: 150 },
      { name: "Mammo", level: 2400, window: 1300 },
      { name: "Default", level: 0, window: 0 }
    ];
    return (
      <div className="pop-up">
        <a href="#" onClick={this.props.onClose}>
          Close <FaTimes />
        </a>
        <h5>
          Window / Level
          <hr />
        </h5>
        {presets.map((preset, i) => {
          return (
            <div key={i}>
              <input
                type="radio"
                name="presets"
                value={i}
                onClick={() => this.setPreset(preset)}
              />
              {" " + preset.name}
              <br />
            </div>
          );
        })}
        <label>Window&nbsp;</label>
        <input
          type="text"
          value={this.state.window}
          onChange={this.handleChange}
          name="window"
          size="4"
        />
        &nbsp;&nbsp;
        <label>Level&nbsp;</label>
        <input
          type="text"
          value={this.state.level}
          onChange={this.handleChange}
          name="level"
          size="4"
        />
      </div>
    );
  }
}
