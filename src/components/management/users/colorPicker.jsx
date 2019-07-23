import React from "react";
import { SketchPicker } from "react-color";
import Draggable from "react-draggable";
import { Modal } from "react-bootstrap";

class ColorPicker extends React.Component {
  state = { color: "" };

  componentDidMount = () => {
    console.log("here");
    this.setState({ background: this.props.color });
  };

  handleStart = () => {
    console.log("        onStart={this.handleStart}");
  };
  handleDrag = () => {
    console.log("        onDrag={this.handleDrag}");
  };
  handleStop = () => {
    console.log("        onStop={this.handleStop}");
  };

  render() {
    const anchorElement = document.getElementById("user-color");
    var rect = anchorElement.getBoundingClientRect();
    console.log(rect.top, rect.right, rect.bottom, rect.left);
    console.log("rendered");
    return (
      <Modal.Dialog
        dialogClassName="colorPicker__modal"
        style={{ left: rect.left, width: "fit-content" }}
      >
        {/* <Modal.Header>
          <Modal.Title>Modify User Color</Modal.Title>
        </Modal.Header> */}
        <Modal.Body>
          <SketchPicker
            color={this.state.color}
            onChangeComplete={this.props.handleChangeComplete}
          />
        </Modal.Body>
        <Modal.Footer className="colorPicker__modal--buttons">
          <button variant="primary" onClick={this.props.onSubmit}>
            Submit
          </button>
          <button variant="secondary" onClick={this.props.onCancel}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

export default ColorPicker;

// <Draggable
//   axis="x"
//   handle=".handle"
//   defaultPosition={{ x: 0, y: 0 }}
//   position={null}
//   grid={[25, 25]}
//   scale={1}
//   onStart={this.handleStart}
//   onDrag={this.handleDrag}
//   onStop={this.handleStop}
// >
// </Draggable>
