import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import Draggable from "react-draggable";
import "./FuseSelector.css";

class FuseSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFused: false,
            selectedLayer: "PET",
            CT: undefined, //Ct viewport index
            PT: undefined, //PET viewport index
            opacity: 0.7,
            colormap: 'hotIron',
        }
        this.synchronizers = [];
        this.defaultCtOptions = {
            name: "CT",
            opacity: 1.0,
            viewport: { colormap: "gray" },
            visibile: true
        };
        this.defaultPetOptions = {
            name: "PET",
            opacity: 0.7,
            viewport: { colormap: "hotIron" },
            visibile: true
        };
    }

    componentDidMount() {
        const elements = cornerstone.getEnabledElements();
        // We only support two viewports for fuse
        if (elements.length != 2)
            return false;
        //
        let modalities = {};
        elements.forEach(({ element }, i) => {
            const modality = this.getModality(element);
            if (modality) {
                modalities[modality] = i;//set the state with port index
            }
            else return false;
        })
        const { CT, PT } = modalities;
        if (CT === undefined || PT === undefined) return;
        this.setState({ ...modalities }, () => {
            const ctElement = this.getCtElement();
            const layers = cornerstone.getLayers(ctElement);
            let ctLayerId, petLayerId;
            if (ctElement && layers.length) {
                if (layers[0].options.name === "CT") {
                    ctLayerId = layers[0].layerId;
                    petLayerId = layers[1].layerId;
                }
                else {
                    petLayerId = layers[0].layerId;
                    ctLayerId = layers[1].layerId;
                }
                this.setState({ isFused: true, ctLayerId, petLayerId }, () => {
                    const { name } = cornerstone.getActiveLayer(ctElement).options;
                    let evt = {}
                    if (name === "CT")
                        evt.target = { selectedIndex: 0, value: ctLayerId };
                    else
                        evt.target = { selectedIndex: 1, value: petLayerId };
                    this.handleLayerChange(evt);
                });
            }
        });
    }

    getModality = (element) => {
        // if image has already layers it should be the CT 
        // if not handle it returns the active layers modality that causes a problem
        if (cornerstone.getLayers(element).length)
            return "CT";
        const image = cornerstone.getImage(element);
        const seriesModule = cornerstone.metaData.get("generalSeriesModule", image.imageId) || {};
        const modality = seriesModule.modality;
        if (modality === "CT" || modality === "PT") return modality;
        return false;
    }

    // 
    setFuseState = () => {
        const { isFused, CT, PT } = this.state;
        const petElement = cornerstone.getEnabledElements()[PT].element;
        const ctElement = cornerstone.getEnabledElements()[CT].element;
        if (!ctElement || !petElement) return;

        if (!isFused) {
            window.addEventListener("newImage", this.newImage);

            if (this.fuse(petElement, ctElement)) {
                this.teleportAnnotations();
                this.setState({ isFused: true });
                this.addSynchronizers();
            }
        }
        else {
            window.removeEventListener("newImage", this.newImage);

            this.unfuse(ctElement);
            this.setState({ isFused: false, CT: undefined, PT: undefined });
        }
    }

    // If CT viewport has a new image (because viewport are synced PET will also scroll to 
    // corresponding image) fuse it with the new image on PET
    newImage = (event) => {
        try {
            const newImageElement = event.detail.element;
            const { PT, CT } = this.state;
            const petElement = cornerstone.getEnabledElements()[PT]?.element;
            const ctElement = cornerstone.getEnabledElements()[CT]?.element;
            if (ctElement && petElement) {
                if (newImageElement === ctElement) this.fuse(petElement, ctElement);
                else if (newImageElement === petElement) this.teleportAnnotations();
            }
        } catch (error) {
            this.props.onClose();
            console.error(error);
        }
    };

    teleportAnnotations = (unfuse = false) => {
        const petElement = this.getPetElement();
        const ctElement = this.getCtElement();

        const stackToolState = cornerstoneTools.getToolState(ctElement, "stack");
        const petStackToolState = cornerstoneTools.getToolState(petElement, "stack");

        const ctImageIds = stackToolState.data[0].imageIds;
        const petImageIds = petStackToolState.data[0].imageIds;

        const ctImage = ctImageIds[0];
        const petImage = petImageIds[0];

        let segMod = cornerstoneTools.getModule("segmentation");
        const petSeg = segMod.state.series[petImage];
        if (petSeg && !unfuse) {
            segMod.state.series = { ...segMod.state.series, [ctImage]: petSeg };
        }
        else {
            delete segMod.state.series.ctImage; //its unfuse and delete the seg from pet
        }
        this.updateView();
    }

    fuse = (petElement, ctElement) => {
        const { ctOptions, petOptions } = this.getOptions();
        cornerstone.purgeLayers(ctElement);
        const petImage = cornerstone.getImage(petElement);
        const ctImage = cornerstone.getImage(ctElement);
        if (!ctImage || !petImage)
            return false;
        const ctLayerId = cornerstone.addLayer(ctElement, ctImage, ctOptions);
        const petLayerId = cornerstone.addLayer(ctElement, petImage, petOptions);
        cornerstone.updateImage(ctElement);
        if (this.state.selectedLayer === "PET")
            cornerstone.setActiveLayer(ctElement, petLayerId);
        else cornerstone.setActiveLayer(ctElement, ctLayerId);
        this.setState({ ctLayerId, petLayerId });
        return true;
    };

    unfuse = (ctElement) => {
        //first set the ct layer active to render the correct image after unfuse
        cornerstone.setActiveLayer(ctElement, this.state.ctLayerId);
        cornerstone.purgeLayers(ctElement);
        this.removeSynchronizers();
        this.teleportAnnotations(true);
        this.props.onClose();
    };

    getOptions = () => {
        const ctElement = this.getCtElement();
        const layers = cornerstone.getLayers(ctElement);
        if (!layers.length) return { ctOptions: this.defaultCtOptions, petOptions: this.defaultPetOptions };
        else return { ctOptions: this.getLayerOptions(layers[0]), petOptions: this.getLayerOptions(layers[1]) };
    }

    getLayerOptions = (layer) => {
        const { viewport, options } = layer;
        const colormap = viewport.colormap || "gray";
        const opacity = options.opacity == null ? 1 : options.opacity;
        let visible;
        if (options.visible === undefined || options.visible)
            visible = true;
        else visible = false;
        return {
            opacity,
            viewport: { colormap },
            visible
        };
    }

    addSynchronizers = () => {
        const stackPositonSynchronizer = new cornerstoneTools.Synchronizer(
            'cornerstoneimagerendered',
            cornerstoneTools.stackImagePositionSynchronizer
        );
        const panZoomSynchronizer = new cornerstoneTools.Synchronizer(
            'cornerstonetoolsmousedrag',
            cornerstoneTools.panZoomSynchronizer
        );
        cornerstone.getEnabledElements().forEach(({ element }) => {
            stackPositonSynchronizer.add(element);
            panZoomSynchronizer.add(element)
        });
        stackPositonSynchronizer.enabled = true;
        panZoomSynchronizer.enabled = true;
        this.synchronizers.push(stackPositonSynchronizer);
        this.synchronizers.push(panZoomSynchronizer);

    };

    removeSynchronizers = () => {
        cornerstone.getEnabledElements().forEach(({ element }) => {
            this.synchronizers.forEach(synchronizer => {
                synchronizer.remove(element);
                synchronizer.enabled = false;
            })
        });
    };

    handleLayerChange = (event) => {
        if (event.target.selectedIndex === 0)
            this.setState({ selectedLayer: "CT" });
        else this.setState({ selectedLayer: "PET" });
        const newActiveLayerId = event.target.value;
        const ctElement = this.getCtElement();

        const { viewport, options } = cornerstone.getLayer(ctElement, newActiveLayerId);
        const colormap = viewport.colormap || "gray";
        const opacity = options.opacity == null ? 1 : options.opacity;
        let visible;
        if (options.visible === undefined || options.visible)
            visible = true;
        else visible = false;
        this.setState({ activeLayerId: newActiveLayerId, colormap, opacity, visible });
        cornerstone.setActiveLayer(ctElement, newActiveLayerId);
    }

    handleVisibiltyChange = (event) => {
        const isVisible = event.target.checked;
        this.setVisibility(isVisible);
        this.setState({ visible: isVisible });
    }

    setVisibility = (isVisible) => {
        const activeLayer = this.getActiveLayer();
        activeLayer.options.visible = isVisible;
        this.updateView();
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
        if (ctElement)
            return cornerstone.getActiveLayer(ctElement);
    }

    getCtElement = () => {
        const { CT } = this.state;
        return cornerstone.getEnabledElements()[CT]?.element;
    }

    getPetElement = () => {
        const { PT } = this.state;
        return cornerstone.getEnabledElements()[PT]?.element;
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
            <Draggable>
                <div className="fuse-selector">
                    <span>Fusion Menu</span>
                    <hr />
                    {isFused && (<div className="layers">
                        <label htmlFor="layers">Active Layer</label>
                        <select className="opt-select" name={"layers"} value={this.getActiveLayer()?.layerId} onChange={this.handleLayerChange}>
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
                    <button className="closebtn" disabled={!(CT || PT)} onClick={this.setFuseState}>{buttonLabel}</button>

                    <div className="close-fuse-selector" onClick={this.props.onClose}>
                        <a href="#">X</a>
                    </div>
                </div>
            </Draggable>
        );
    }
}

export default FuseSelector;
