import React, { Component } from "react";
import { connect } from "react-redux";
import DisplayView from "./displayView";
import Annotations from "../annotationsList/annotationDock/annotationList";

class DisplayViewContainer extends React.Component {
  state = {
    imageID: "1.2.840.113704.1.111.3844.1212776204.2784"
  };

  setImageID = imageID => {
    this.setState({ imageID });
  };

  render = () => {
    const { dockOpen } = this.props;
    return (
      <div className="displayView-cont">
        <div className={dockOpen ? "__ports" : "__ports __all"}>
          <DisplayView />
        </div>
        {this.props.dockOpen && (
          <div className="__anns">
            <Annotations imageID={this.state.imageID} />
          </div>
        )}
      </div>
    );
  };
}

const mapStateToProps = state => {
  return {
    dockOpen: state.annotationsListReducer.dockOpen
  };
};

export default connect(mapStateToProps)(DisplayViewContainer);
