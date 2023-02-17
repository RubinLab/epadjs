import React, { Component } from "react";
import cornerstoneTools from "../../cornerstone-tools";
import Switch from "react-switch";
import "./Interpolation.css";

class Interpolation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interpolate: false,
    };
  }

  componentDidMount(){
    const {interpolate} = cornerstoneTools.store.modules.freehand3D.state;
    if(interpolate !== undefined)
      this.setState({interpolate});
  }

  setInterpolation = (checked) => {
    this.setState({ interpolate: checked });
    cornerstoneTools.store.modules.freehand3D.state.interpolate = checked;
  };

  render() {
    return (
      <div className="interpolate-selector">
        <span>
          Interpolation{" "}
          <a
            href="#"
            className="interpolate-button"
            onClick={this.props.onClose}
          >
            X
          </a>
        </span>{" "}
        <Switch
          onChange={this.setInterpolation}
          checked={this.state.interpolate}
          onColor="#86d3ff"
          onHandleColor="#2693e6"
          handleDiameter={10}
          uncheckedIcon={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: 11,
                color: "#861737",
                paddingRight: 2,
              }}
            >
              Off
            </div>
          }
          checkedIcon={
            <svg viewBox="0 0 10 10" height="100%" width="100%">
              <circle r={3} cx={5} cy={5} />
            </svg>
          }
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          // height={15}
          // width={20}
          className="react-switch"
        />
      </div>
    );
  }
}

export default Interpolation;
