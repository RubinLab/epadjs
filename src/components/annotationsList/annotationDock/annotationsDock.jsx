import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import Dock from "react-dock";
import Draggable from "react-draggable";
import { Rnd } from "react-rnd";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import { showAnnotationDock, closeSerie } from "../action";
import Annotations from "./annotationList";

const styles = {
  border: "0.2rem solid #333",
  background: "#3A3F44",
  minWidth: "5%"
};

class DockTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 0.1,
      width: "215px",
      x: 1000,
      y: 75
    };
  }

  componentDidMount() {
    const icon = document.getElementsByClassName("annotations-icon")[0];
    const x = Math.ceil(icon.getBoundingClientRect().right) + 8;
    let y = Math.ceil(icon.getBoundingClientRect().top);
    this.setState({ x, y });
  }

  render() {
    const style = {
      minWidth: "215px",
      maxWidth: "30%"
    };
    return (
      <Rnd
        id="dock-modal"
        style={style}
        size={{
          width: this.state.width,
          height: this.state.height
        }}
        position={{ x: this.state.x, y: this.state.y }}
        onDragStop={(e, d) => {
          this.setState({ x: d.x, y: d.y });
        }}
        onResize={(e, direction, ref, delta, position) => {
          this.setState({
            width: ref.style.width,
            height: ref.style.height,
            ...position
          });
        }}
      >
        <div className="-dock__close">
          <div
            onClick={() => {
              this.props.dispatch(showAnnotationDock());
            }}
          >
            <FaTimes />
          </div>
        </div>
        <Annotations imageID={this.props.imageID} />
      </Rnd>
      // <Draggable>
      //   <>
      //     <div className="-dock__close">
      //       <div
      //         onClick={() => {
      //           this.props.dispatch(showAnnotationDock());
      //         }}
      //       >
      //         <FaTimes />
      //       </div>
      //     </div>
      //     <Annotations imageID={this.props.imageID} />
      //   </>
      // </Draggable>
    );
  }

  handleSizeChange = size => {
    this.setState({ size });
  };
}
const mapStateToProps = state => {
  return {
    imageID: state.annotationsListReducer.imageID,
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};
export default connect(mapStateToProps)(DockTest);
