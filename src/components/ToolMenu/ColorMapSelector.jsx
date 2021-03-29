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

    getActiveColormap = () => {
        const { element } = cornerstone.getEnabledElements()[
            this.props.activePort
        ];
        const viewport = cornerstone.getViewport(element);
        console.log("active colormap", viewport.colormap);
        return viewport.colormap;
    }

    handleChange = (event) => {
        const newColormap = event.target.value;
        this.setState({ activeColormap: newColormap });
        this.applyColormap(newColormap);
    }

    applyColormap = (newColormap) => {
        const { element } = cornerstone.getEnabledElements()[
            this.props.activePort
        ];
        const viewport = cornerstone.getViewport(element);
        viewport.colormap = newColormap;
        cornerstone.setViewport(element, viewport);
        cornerstone.updateImage(element, true);
    };

    createColormapOptions = (colormapsList) => {
        let items = [];
        colormapsList.forEach(colormapItem => {
            items.push(<option value={colormapItem.id}>{colormapItem.name}</option>);
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
