import React from "react";
import { Rnd } from "react-rnd";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd"
};

class ResizeAndDrag extends React.Component {
  state = {
    width: "90%",
    height: "90%",
    x: 50,
    y: 50
  };

  render() {
    return (
      <Rnd
        className="rnd-window"
        style={style}
        size={{ width: this.state.width, height: this.state.height }}
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
        {this.props.children}
      </Rnd>
    );
  }
}

export default ResizeAndDrag;
