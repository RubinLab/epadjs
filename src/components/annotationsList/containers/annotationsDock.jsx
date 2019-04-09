import React from "react";
import { connect } from "react-redux";
import Dock from "react-dock";
import { showAnnotationDock } from "../action";

const dockStyle = {
  border: "0.2rem solid #333",
  background: "#3A3F44",
  minWidth: "10rem"
};
class AnnotationsDock extends React.Component {
  state = {
    size: 0.15
  };

  handleSizeChange = size => {
    this.setState({ size });
  };

  render() {
    return (
      <div className="annotation-dock">
        <Dock
          position="right"
          isVisible={this.props.dockOpen}
          dockStyle={dockStyle}
          // size={this.state.size}
          // onSizeChange={this.handleSizeChange}
        >
          {this.props.children}
          <div onClick={() => this.props.dispatch(showAnnotationDock())}>X</div>
        </Dock>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    dockOpen: state.annotationsListReducer.dockOpen
  };
};
export default connect(mapStateToProps)(AnnotationsDock);
