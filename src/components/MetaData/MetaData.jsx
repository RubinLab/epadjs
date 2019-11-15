import React, { Component } from "react";
import { connect } from "react-redux";

import "./MetaData.css";

const mapStateToProps = state => {
  return {
    cornerstone: state.searchViewReducer.cornerstone,
    cornerstoneTools: state.searchViewReducer.cornerstoneTools,
    activeVP: state.searchViewReducer.activeVP
  };
};

class MetaData extends Component {
  toggleMetaData = () => {
    alert("yeaaa");
  };
  render() {
    return (
      <div className="form-popup" id="myForm">
        <h1>Login</h1>

        <button type="submit" className="btn">
          Login
        </button>
        <button
          type="button"
          className="btn cancel"
          onClick={this.toggleMetaData}
        >
          Close
        </button>
      </div>
    );
  }
}

export default connect(mapStateToProps)(MetaData);
