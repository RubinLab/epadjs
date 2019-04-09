import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import Dock from "react-dock";
import { FaTimes } from "react-icons/fa";
import { showAnnotationDock } from "../action";
import Annotations from "./annotationList";

const styles = {
  border: "0.2rem solid #333",
  background: "#3A3F44",
  minWidth: "5%"
};

const positions = ["left", "top", "right", "bottom"];
const dimModes = ["transparent", "none", "opaque"];

class DockTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 0.1
    };
  }

  componentDidMount() {}

  render() {
    // const duration = this.state.slow ? 2000 : 200;

    return (
      <div>
        <Dock
          position="right"
          size={this.state.size}
          dockStyle={styles}
          dimMode="none"
          isVisible={this.props.dockOpen}
          onSizeChange={this.handleSizeChange}
          //   duration={duration}
        >
          <div className="-dock__close">
            <FaTimes
              onClick={() => {
                this.props.dispatch(showAnnotationDock());
              }}
            />
          </div>
          <Annotations />
        </Dock>
      </div>
    );
  }

  handleSizeChange = size => {
    this.setState({ size });
  };
}
const mapStateToProps = state => {
  return {
    dockOpen: state.annotationsListReducer.dockOpen
  };
};
export default connect(mapStateToProps)(DockTest);
