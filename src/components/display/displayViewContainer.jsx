import React, { Component } from "react";
import { connect } from "react-redux";
import DisplayView from "./displayView";
import Annotations from "../annotationsList/annotationDock/annotationList";

class DisplayViewContainer extends React.Component {
  state = {
    imageID: null
  };

  setImageID = imageID => {
    this.setState({ imageID });
  };

  render = () => {
    const { dockOpen } = this.props;
    console.log(this.props.dockOpen);
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
