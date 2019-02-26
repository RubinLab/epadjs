import React, { Component } from 'react';

export default class ImageControls extends Component {
    render() {
        return (
            <div className="imageControls">
                <div id="scrollbar">
                    <input id="imageSlider" type="range" min="1" val={this.props.value} max={this.props.max}/>
                </div>
            </div>
        );
    }
}

ImageControls.propTypes = {
    max: React.PropTypes.number,
    value: React.PropTypes.number
};

ImageControls.defaultProps = {
    value: 1
};