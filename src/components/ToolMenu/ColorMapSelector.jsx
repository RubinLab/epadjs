import React, { Component } from "react";
import cornerstoneTools from "cornerstone-tools";
import "./ColorMapSelector.css";

class ColorMapSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            size: 10,
        };
    }

    const

    render() {
        return (
            <div className="brush-size-selector">
                <span>Color LUTs</span>

                <InputRange
                    //   style={inputRange}
                    //   disabled={this.state.rangeDisabled}
                    step={1}
                    minValue={1}
                    maxValue={50}
                    value={this.state.size}
                    onChange={(value) => this.setState({ size: value })}
                    onChangeComplete={(value) => this.applyBrushSize(value)}
                />
                <div className="close-brush" onClick={this.props.onClose}>
                    <a href="#">X</a>
                </div>
            </div>
        );
    }
}

export default ColorMapSelector;
