import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import "./FuseSelector.css";

class FuseSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFused: false,
            CT: undefined,
            PT: undefined,
            opacity: 0.7,
            colormap: 'hotIron',
        }
    }

    componentDidMount() {
        const elements = cornerstone.getEnabledElements();
        // We only support two viewports for fuse
        if (elements.length != 2)
            return false;
        //
        elements.forEach(({ element }, i) => {
            const modality = this.getModality(element);
            if (modality)
                this.setState({ [modality]: i });//set the state with port index
            else return false;
        })
        // if (ctElement) {
        //     const enabledCtElement = cornerstone.getEnabledElement(ctElement);
        //     // const layers = cornerstone.getLayers(enabledCtElement);
        //     console.log("element", enabledCtElement);
        // }
        // check if the it's already fused
        // const ctElement = cornerstone.getEnabledElements()[this.state.CT].element;
        // if (cornerstone.getLayers(ctElement)?.length > 1)
        //     this.setState({ isFused: true });
    }

    fuseOk = () => {
        const elements = cornerstone.getEnabledElements();
        // We only support two viewports for fuse
        if (elements.length != 2)
            return false;
        //
        elements.forEach(({ element }, i) => {
            const modality = this.getModality(element);
            if (modality)
                this.setState({ [modality]: i });//set the state with port index
            else return false;
        })
        return true;
    }

    getOptions = () => {
        const { opacity, colormap } = this.state
        return {
            opacity,
            viewport: { colormap }
        };
    }

    getModality = (element) => {
        const image = cornerstone.getImage(element);
        const seriesModule = cornerstone.metaData.get("generalSeriesModule", image.imageId) || {};
        const modality = seriesModule.modality;
        if (modality === "CT" || modality === "PT") return modality;
        return false;
    }

    handleFuse = () => {
        const { isFused, CT, PT } = this.state;
        const petElement = cornerstone.getEnabledElements()[PT].element;
        const ctElement = cornerstone.getEnabledElements()[CT].element;

        if (!isFused) {
            window.addEventListener("newImage", this.newImage);
            ctElement.addEventListener("cornerstoneactivelayerchanged", this.csLayerChange);

            this.fuse(petElement, ctElement);
            this.setState({ isFused: true });
            this.addSynchronizer();
        }
        else {
            window.removeEventListener("newImage", this.newImage);
            ctElement.removeEventListener("cornerstoneactivelayerchanged", this.csLayerChange);

            this.unfuse(ctElement);
            this.setState({ isFused: false, CT: undefined, PT: undefined });
        }
    }

    newImage = (event) => {
        console.log("event", event.detail.element);
        const newImageElement = event.detail.element;
        const { PT, CT } = this.state;
        const petElement = cornerstone.getEnabledElements()[PT].element;
        const ctElement = cornerstone.getEnabledElements()[CT].element;
        if (newImageElement === ctElement) {
            console.log("ctElement before", cornerstone.getEnabledElements()[CT]);
            cornerstone.getEnabledElements()[CT].layers.length = 0;
            this.fuse(petElement, ctElement);
        }
        // console.log("o element");
        // else console.log("olmadi");
        // this.fuse(petElement, ctElement);
        // console.log("ctElement", ctElement);
    };

    fuse = (petElement, ctElement) => {
        console.log("fusing again", this.getOptions());
        const petImage = cornerstone.getImage(petElement);
        const ctImage = cornerstone.getImage(ctElement);

        const ctLayerId = cornerstone.addLayer(ctElement, ctImage);
        const petLayerId = cornerstone.addLayer(ctElement, petImage, this.getOptions());
        cornerstone.updateImage(ctElement);
        cornerstone.setActiveLayer(ctElement, petLayerId);
        this.setState({ ctLayerId, petLayerId });
    };

    unfuse = (ctElement) => {
        // delete the top two layers (base on there can only be two layers)
        const layers = cornerstone.getLayers(ctElement);
        if (layers) {
            cornerstone.removeLayer(ctElement, layers.pop().layerId);
            cornerstone.removeLayer(ctElement, layers.pop().layerId);
            cornerstone.updateImage(ctElement);
        }
    };

    addSynchronizer = () => {
        const synchronizer = new cornerstoneTools.Synchronizer(
            'cornerstoneimagerendered',
            cornerstoneTools.stackImagePositionSynchronizer
        );

        cornerstone.getEnabledElements().forEach(({ element }) => {
            synchronizer.add(element);
        });
        synchronizer.enabled = true;
    };

    csLayerChange = (e) => {
        const { viewport, options } = this.getActiveLayer();
        const colormap = viewport.colormap || "";
        const opacity = options.opacity == null ? 1 : options.opacity;
        let visible;
        if (options.visible === undefined || options.visible)
            visible = true;
        else visible = false;
        this.setState({ colormap, opacity, visible });
    }

    handleLayerChange = (event) => {
        const ctElement = this.getCtElement();
        const newActiveLayerId = event.target.value;
        this.setState({ activeLayerId: newActiveLayerId });
        cornerstone.setActiveLayer(ctElement, newActiveLayerId);
    }

    handleVisibiltyChange = (event) => {
        const activeLayer = this.getActiveLayer();
        activeLayer.options.visible = event.target.checked;
        this.updateView();
        this.setState({ visible: event.target.checked });
    }

    handleOpacityChange = (event) => {
        const activeLayer = this.getActiveLayer();
        let opacity = parseFloat(event.currentTarget.value);
        activeLayer.options.opacity = opacity;
        this.updateView();
        this.setState({ opacity });
    }

    updateView = () => {
        const ctElement = this.getCtElement();
        cornerstone.updateImage(ctElement);
    }

    getActiveLayer = () => {
        const ctElement = this.getCtElement();
        return cornerstone.getActiveLayer(ctElement);
    }

    getCtElement = () => {
        const { CT } = this.state;
        return cornerstone.getEnabledElements()[CT].element;
    }

    handleColormapChange = (event) => {
        const activeLayer = this.getActiveLayer();
        const colormap = event.target.value;
        activeLayer.viewport.colormap = colormap;
        this.setState({ colormap });
        this.updateView();
    }

    createColormapOptions = (colormapsList) => {
        let items = [];
        colormapsList.forEach((colormapItem, i) => {
            items.push(<option value={colormapItem.id} key={i}>{colormapItem.name}</option>);
        })
        return items;
    }

    render() {
        const { CT, PT, isFused, ctLayerId, petLayerId, opacity = 0.7, visible = true, colormap = "hotIron" } = this.state;
        const colormapsList = cornerstone.colors.getColormapsList();
        const buttonLabel = isFused ? "Unfuse" : "Fuse PET and CT";
        return (
            <div className="fuse-selector">
                <span>Fusion Menu</span>
                <hr />
                {isFused && (<div className="layers">
                    <label htmlFor="layers">Active Layer</label>
                    <select className="opt-select" name={"layers"} value={this.getActiveLayer().layerId} onChange={this.handleLayerChange}>
                        <option value={ctLayerId}>CT</option>
                        <option value={petLayerId}>PET</option>
                    </select>
                </div>
                )}
                {isFused && (<div className="visibility">
                    <input type="checkbox" name="visible" onChange={this.handleVisibiltyChange} checked={visible} />
                    <label htmlFor="visible"> Visible</label>
                </div>)
                }

                {isFused && (<div className="opacity">
                    <label htmlFor="opacity">Opacity</label>
                    <input type="range" name={"opacity"} min={0} max={1} step={0.1} onChange={this.handleOpacityChange} value={opacity} />
                </div>)}
                {isFused && (<div className="colormap">
                    <label htmlFor="opacity">Colormap</label>
                    <select value={colormap} onChange={this.handleColormapChange}>
                        {this.createColormapOptions(colormapsList)}
                    </select>
                </div>
                )}
                {!isFused && (<p>Currently to be able to use Fusion functionality only two viewports of PET and CT modalities should be open!</p>)}
                <button className="closebtn" disabled={!(CT || PT)} onClick={this.handleFuse}>{buttonLabel}</button>

                <div className="close-fuse-selector" onClick={this.props.onClose}>
                    <a href="#">X</a>
                </div>
            </div>
        );
    }
}

export default FuseSelector;
