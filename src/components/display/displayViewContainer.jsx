import React, { Component } from "react";
import { connect } from "react-redux";
import DisplayView from "./displayView";
import Annotations from "../annotationsList/annotationDock/annotationList";

class DisplayViewContainer extends React.Component {
  constructor(props) {
    super(props);
    window.addEventListener("cornerstonenewimage", this.handleImageChange);
  }
  state = {
    imageId: null
  };

  handleNewImage = event => {
    const imageId = event.detail.image.imageId.split("/").pop();
    this.setState({ imageId });
  };

  render = () => {
    // const { dockOpen } = this.props;
    // TODO check here
    const dockOpen = false;
    return (
      <div className="displayView-cont">
        <div className={dockOpen ? "__ports" : "__ports __all"}>
          <DisplayView onNewImage={this.handleNewImage} />
        </div>
        {/* {this.props.dockOpen && ( */}
        <div className="__anns">
          <Annotations imageID={this.state.imageId} />
        </div>
        {/* )} */}
      </div>
    );
  };
}

const mapStateToProps = state => {
  return {
    // dockOpen: state.annotationsListReducer.dockOpen
  };
};

export default connect(mapStateToProps)(DisplayViewContainer);
