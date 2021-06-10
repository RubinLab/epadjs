import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import "./ColormapSelector.css";

class ColormapSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeColormap: this.getActiveColormap()
        }
    }

    componentDidUpdate(prevProps) {
        const prevActivePort = prevProps.activePort;
        const { activePort } = this.props;
        if (prevActivePort !== activePort) {
            this.setState({ activeColormap: this.getActiveColormap() });
        }
    }

    getActiveColormap = () => {
        const { element } = cornerstone.getEnabledElements()[
            this.props.activePort
        ];
        const viewport = cornerstone.getViewport(element);
        return viewport.colormap || "gray";
    }

    handleChange = (event) => {
        const { element } = cornerstone.getEnabledElements()[
            this.props.activePort
        ];
        const newColormap = event.target.value;
        this.setState({ activeColormap: newColormap });
        this.applyColormap(newColormap, element);
    }

    applyColormap = (newColormap, element) => {
        const viewport = cornerstone.getViewport(element);
        viewport.colormap = newColormap;
        cornerstone.setViewport(element, viewport);
        cornerstone.updateImage(element, true);
    };

    createColormapOptions = (colormapsList) => {
        let items = [];
        colormapsList.forEach((colormapItem, i) => {
            items.push(<option value={colormapItem.id} key={i}>{colormapItem.name}</option>);
        })
        return items;
    }

    render() {
        const { activeColormap } = this.state;
        const colormapsList = cornerstone.colors.getColormapsList();
        return (
            <div className="color-map-selector">
                <span>Color Maps</span>
                <hr />
                <select value={activeColormap} onChange={this.handleChange}>
                    {this.createColormapOptions(colormapsList)}
                </select>
                <div className="close-color-map" onClick={this.props.onClose}>
                    <a href="#">X</a>
                </div>
            </div>
        );
    }
}

export default ColormapSelector;
