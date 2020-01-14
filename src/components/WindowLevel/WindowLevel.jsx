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
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    const vp = cornerstone.getViewport(element);
    vp.voi.windowCenter = preset.level;
    vp.voi.windowWidth = preset.window;
    cornerstone.setViewport(element, vp);
    this.setState({ level: preset.level, window: preset.window });
  };
  handleWindowChange = e => {
    e.persist();
    console.log("E is", e.target.value);
    this.setState({ window: e.target.value });
  };
  handleLevelChange = e => {
    e.persist();
    console.log("E is", e);
    this.setState({ level: e.target.value });
  };

  render() {
    const winLevel = (
      <div>
        <label>Win&nbsp;</label>
        <input
          type="text"
          value={this.state.window}
          onChange={this.handleWindowChange}
          name="window"
          size="4"
        />
        &nbsp;&nbsp;
        <label>Lev&nbsp;</label>
        <input
          type="text"
          value={this.state.level}
          onChange={this.handleLevelChange}
          name="level"
          size="4"
        />
      </div>
    );
    // console.log(winLevel);
    const presets = [
      { name: "CT Abdomen (L:40, W:350)", level: 40, window: 350 },
      { name: "CT Bone (L:300, W:1500)", level: 300, window: 1500 },
      { name: "CT Brain (L:50, W:100)", level: 50, window: 100 },
      { name: "CT Lung (L:-500, W:1400)", level: -500, window: 1400 },
      {
        name: "CT Rad. Bone (L:1638, W:3276)",
        level: 1638,
        window: 3276
      },
      { name: "CT Liver (L:98, W:150)", level: 98, window: 150 },
      { name: "Mammo (L:2400, W:1300)", level: 2400, window: 1300 }
      // {
      //   name: `Custom: ${String(winLevel)}`,
      //   level: this.state.level,
      //   window: this.state.window
      // }
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
        {/* <div>
          <input
            type="radio"
            name="presets"
            onClick={() => this.setPreset(preset)}
          />
          {" Custom: "}
          <label>Win&nbsp;</label>
          <input
            type="text"
            value={this.state.window}
            onChange={this.handleWindowChange}
            name="window"
            size="4"
          />
          &nbsp;&nbsp;
          <label>Lev&nbsp;</label>
          <input
            type="text"
            value={this.state.level}
            onChange={this.handleLevelChange}
            name="level"
            size="4"
          />
        </div> */}
      </div>
    );
  }
}
