import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import PropagateLoader from 'react-spinners/PropagateLoader';
import {
  getImageIds,
  getWadoImagePath,
  getSegmentation,
  getMetadata
} from "../../services/seriesServices";
import { getImageMetadata } from "../../services/imageServices";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { withRouter } from "react-router-dom";
import "./flex.css";
import "./viewport.css";
import {
  changeActivePort,
  updateImageId,
  clearActivePortAimID,
  closeSerie,
  jumpToAim,
  setSegLabelMapIndex,
  updateSingleSerie,
  getSingleSerie,
  aimDelete,
  clearAimId,
} from "../annotationsList/action";
import { deleteAnnotation } from "../../services/annotationServices";
import ContextMenu from "./contextMenu";
import { MenuProvider } from "react-contexify";
import CornerstoneViewport from "react-cornerstone-viewport";
import { freehand } from "./Freehand";
import { line } from "./Line";
import { arrow } from "./Arrow";
import { probe } from "./Probe";
import { circle } from "./Circle";
import { bidirectional } from "./Bidirectional";
import RightsideBar from "../RightsideBar/RightsideBar";
import * as dcmjs from "dcmjs";
import { FaTimes, FaPen, FaExpandArrowsAlt, FaTag } from "react-icons/fa";
import Form from "react-bootstrap/Form";
import ToolMenu from "../ToolMenu/ToolMenu";
import { getMarkups, setMarkupsOfAimActive } from "../aimEditor/Helpers";
import { refreshToken } from "../../services/authService";
// import { isThisSecond } from "date-fns/esm";
import { FiMessageSquare } from "react-icons/fi";
import { errorMonitor } from "events";
import FreehandRoiSculptorTool from '../../cornerstone-tools/tools/FreehandRoiSculptorTool';
import getVPDimensions from "./ViewportCalculations";
import SeriesDropDown from './SeriesDropDown';

let mode;
let wadoUrl;

const tools = [
  { name: "Wwwc", modeOptions: { mouseButtonMasks: 1 } },
  { name: "Pan", modeOptions: { mouseButtonMasks: 1 } },
  {
    name: "Zoom",
    configuration: {
      minScale: 0.3,
      maxScale: 25,
      preventZoomOutsideImage: true,
    },
    modeOptions: { mouseButtonMasks: [1, 2] },
  },
  { name: "Probe", modeOptions: { mouseButtonMasks: 1 }, mode: "passive" },
  { name: "Length", modeOptions: { mouseButtonMasks: 1 }, mode: "passive" },
  { name: "ArrowAnnotate", modeOptions: { mouseButtonMasks: 1 }, mode: "passive" },
  // {
  //   name: "EllipticalRoi",
  //   configuration: {
  //     showMinMax: true
  //   }
  // },
  // {
  //   name: "RectangleRoi",
  //   configuration: {
  //     showMinMax: true
  //   }
  // },
  {
    name: "CircleRoi",
    configuration: {
      showMinMax: true,
    },
    modeOptions: { mouseButtonMask: 1 },
    mode: "passive",
  },
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  {
    name: "FreehandRoi",
    configuration: {
      showMinMax: true,
    },
    modeOptions: { mouseButtonMask: [1] },
    mode: "passive",
  },
  {
    name: "FreehandRoiSculptor",
    modeOptions: { mouseButtonMask: 1 },
    mode: "passive"
  },
  // {
  //   name: "FreehandRoi3DTool",
  //   modeOptions: { mouseButtonMask: 1 },
  //   mode: "passive",
  // },
  // {
  //   name: "FreehandRoi3DSculptorTool",
  //   modeOptions: { mouseButtonMask: 1 },
  //   mode: "passive",
  // },
  { name: "Eraser" },
  {
    name: "Bidirectional",
    modeOptions: { mouseButtonMask: 1 },
    mode: "passive",
  },
  // { name: "Brush3DTool" },
  { name: "StackScroll", modeOptions: { mouseButtonMask: 1 } },
  { name: "PanMultiTouch" },
  { name: "ZoomTouchPinch" },
  { name: "StackScrollMouseWheel", mode: "active" },
  { name: "StackScrollMultiTouch" },

  { name: "SphericalBrush", modeOptions: { mouseButtonMask: 1 } },
  { name: "CircleScissors", modeOptions: { mouseButtonMask: 1 } },
  { name: "FreehandScissors", modeOptions: { mouseButtonMask: 1 } },
  // { name: "RectangleScissors", modeOptions: { mouseButtonMask: 1 } },

  { name: "CorrectionScissors", modeOptions: { mouseButtonMask: 1 } },
];

const mapStateToProps = (state) => {
  return {
    series: state.annotationsListReducer.openSeries,
    loading: state.annotationsListReducer.loading,
    activePort: state.annotationsListReducer.activePort,
    aimList: state.annotationsListReducer.aimsList,
    aimSegLabelMaps: state.annotationsListReducer.aimSegLabelMaps,
  };
};

class DisplayView extends Component {
  constructor(props) {
    super(props);
    mode = sessionStorage.getItem('mode');
    wadoUrl = sessionStorage.getItem('wadoUrl');
    this.state = {
      width: "100%",
      height: "100%",
      hiding: false,
      data: [],
      isLoading: true,
      selectedAim: undefined,
      dirty: false,
      refs: props.refs,
      showAnnDetails: true,
      hasSegmentation: false,
      activeLabelMapIndex: 0,
      aimLabelMaps: {},
      seriesLabelMaps: {},
      redirect: this.props.series.length < 1 ? true : false,
      containerHeight: 0,
      tokenRefresh: null,
      activeTool: '',
      invertMap: {},
      isOverlayVisible: {},
      subpath: []
    };
  }

  formInvertMap = () => {
    const { series } = this.props;
    const invertMap = { ...this.state.invertMap };
    series.forEach((el, i) => {
      if (el.examType === 'NM') invertMap[i] = true;
    })
    this.setState({ invertMap });
  }

  componentDidMount() {
    const { series, onSwitchView } = this.props;
    // if (series.length < 1) {
    //   onSwitchView('search');
    // }
    this.getViewports();
    this.getData();
    this.formInvertMap();
    if (series.length > 0) {
      this.setSubComponentHeights();
      window.addEventListener("resize", e => this.setSubComponentHeights(e));
    }
    window.addEventListener("markupSelected", this.handleMarkupSelected);
    window.addEventListener("markupCreated", this.handleMarkupCreated);
    window.addEventListener("toggleAnnotations", this.toggleAnnotations);
    window.addEventListener("jumpToAimImage", this.jumpToAimImage);
    window.addEventListener("editAim", this.editAimHandler);
    window.addEventListener("deleteAim", this.deleteAimHandler);
    window.addEventListener('keydown', this.handleKeyPressed);
    window.addEventListener('serieReplaced', this.handleSerieReplace);
    if (this.props.keycloak && series && series.length > 0) {
      const tokenRefresh = setInterval(this.checkTokenExpire, 500);
      this.setState({ tokenRefresh })
    };
    // const element = document.getElementById("petViewport");
    // console.log("element is", cornerstone);
    // cornerstone.enable(element);
    // this.props.closeLeftMenu();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { pid, series, activePort, aimList } = this.props;
    const {
      series: prevSeries,
      activePort: prevActivePort,
      aimList: prevAimList,
    } = prevProps;
    const activeSerie = series[activePort];
    const prevActiveSerie = prevSeries[prevActivePort];

    if (this.props.series.length < 1) {
      if (mode === 'teaching') this.props.history.push('/search');
      else if (pid) this.props.history.push(`/list/${pid}`);
      else return;
      return;
    }
    if (
      (prevProps.series !== this.props.series &&
        prevProps.loading === true &&
        this.props.loading === false) ||
      (prevProps.series.length !== this.props.series.length &&
        this.props.loading === false)
    ) {
      await this.setState({ isLoading: true });
      this.getViewports();
      this.getData('------> in update');
      this.formInvertMap();
    }
    // This is to handle late loading of aimsList from store but it also calls getData
    // each time visibility of aims change
    else if (Object.keys(aimList).length !== Object.keys(prevAimList).length) {
      this.renderAims();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("markupSelected", this.handleMarkupSelected);
    window.removeEventListener("markupCreated", this.handleMarkupCreated);
    window.removeEventListener("toggleAnnotations", this.toggleAnnotations);
    window.removeEventListener("jumpToAimImage", this.jumpToAimImage);
    window.removeEventListener("editAim", this.editAimHandler);
    window.removeEventListener("deleteAim", this.deleteAimHandler);
    window.removeEventListener("resize", this.setSubComponentHeights);
    window.removeEventListener('keydown', this.handleKeyPressed);
    window.removeEventListener('serieReplaced', this.handleSerieReplace);
    // clear all aimID of openseries so aim editor doesn't open next time
    this.props.dispatch(clearAimId());
    clearInterval(this.state.tokenRefresh)
  }

  handleKeyPressed = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
    if (event.key === "Escape") {
      const evnt = new CustomEvent("escPressed", {
        cancelable: true,
      });
      window.dispatchEvent(evnt);
    }
    // i => info
    if (event.target.nodeName !== 'INPUT' && event.target.nodeName !== 'TEXTAREA') {
      if (event.keyCode == 73 && event.ctrlKey) {
        this.toggleOverlay();
      }
    }
  }

  // Sets the activeTool state getting it from session storage
  handleActiveTool = () => {
    const activeTool = sessionStorage.getItem("activeTool");
    if (activeTool && activeTool !== this.state.activeTool)
      this.setState({ activeTool });
  }

  jumpToAims = () => {
    const { series } = this.props;
    const newData = [...this.state.data];
    series.forEach((serie, i) => {
      if (serie.aimId && this.state.data[i] && this.state.data[i].stack) {
        const { imageIds } = this.state.data[i].stack;
        const imageIndex = this.getImageIndex(serie, imageIds);
        newData[i].stack.currentImageIdIndex = imageIndex;
      }
    });
    this.setState({ data: newData });
  };

  checkTokenExpire = async () => {
    const { keycloak } = this.props;
    if (keycloak.isTokenExpired(5)) {
      window.alert("Are you still editing?");
      await this.updateToken(keycloak, 5);
    }
  };

  updateToken = async () => {
    try {
      clearInterval(this.state.tokenRefresh);
      await refreshToken(this.props.keycloak, 5);
      const tokenRefresh = setInterval(this.checkTokenExpire, 1000);
      this.setState({ tokenRefresh });
    } catch (err) {
      console.error(err);
    }
  };

  setSubComponentHeights = e => {
    try {
      if (e && e.detail) var { isMaximize } = e.detail;
      const navbar = document.getElementsByClassName("navbar")[0].clientHeight;
      let toolbarHeight = document.getElementsByClassName("toolbar")[0]
        .clientHeight;
      const windowInner = window.innerHeight;
      const containerHeight = windowInner - toolbarHeight - navbar - 10;
      this.setState({ containerHeight });
      if (!isMaximize) this.getViewports(containerHeight);
    } catch (err) {
      console.error(err);
    }
  };

  deleteAimHandler = (event) => {
    const { showAimEditor, selectedAim, dirty } = this.state;
    const { aim, openSerie } = event.detail;
    if (showAimEditor) {
      if (aim.id === selectedAim.aimId) //if aim to be deleted is being edited
        this.closeAimEditor(false);
      else if (dirty) {
        alert("You should first close the aim editor before deleting another aim!");
        return;
      }
    }
    const answer = window.confirm(
      `Are you sure you want to delete aim named: ${aim.json.name.value}? This operation can NOT be undone!`
    );
    if (!answer) return 0;
    this.deleteAim(aim.id, openSerie);
  }

  editAimHandler = (event) => {
    const { aimID, seriesUID } = event.detail;
    const { aimList, activePort } = this.props;
    const { showAimEditor, selectedAim } = this.state;

    if (aimList[seriesUID][aimID]) {
      const aimJson = aimList[seriesUID][aimID].json;
      const markupTypes = this.getMarkupTypesForAim(aimID);
      aimJson["markupType"] = markupTypes ? [...markupTypes] : undefined;
      aimJson["aimId"] = aimID;

      // check if is already editing an aim
      if (showAimEditor && (selectedAim !== aimJson)) {
        // temporal fix for aimEiditor form fields not setting dirty flag
        alert("You should close the Aim Editor before starting to edit this aim.");
        return;
        let message = this.prepWarningMessage(
          selectedAim.name.value,
          aimJson.name.value
        );
        const shouldContinue = this.closeAimEditor(true, message);
        if (!shouldContinue)
          return;
      }

      // if we are clciking on an markup and it's aim has segmentation, set the activeLabelMapIndex accordingly
      const element = this.getActiveElement();
      if (this.hasSegmentation(aimJson)) {
        this.setState({ hasSegmentation: true });
        const { labelMaps } = this.state.seriesLabelMaps[activePort];
        const labelMapIndexOfAim = labelMaps[aimID];
        this.setActiveLabelMapIndex(labelMapIndexOfAim, element);
      }

      //The following dispatched is a wrongly named method. it's dispatched to set the selected
      //AimId in the store!!!!!
      this.props.dispatch(jumpToAim(seriesUID, aimID, activePort));

      this.setState({ showAimEditor: true, selectedAim: aimJson }, () => {
        setMarkupsOfAimActive(aimID);//set the selected markups color to yellow
        this.refreshAllViewports();
      });
    }
  };

  toggleAnnotations = event => {
    const { aimID, isVisible } = event.detail;
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];

    this.setVisibilityOfSegmentations(aimID, element, isVisible);
    this.setVisibilityOfShapes(isVisible, aimID);

    cornerstone.updateImage(element);
  };

  // Traverse all shapes and set visibility, if aimID is passed only sets aim's shapes
  setVisibilityOfShapes = (visibility, aimID) => {
    const { series, activePort } = this.props;
    const { seriesUID } = series[activePort];
    const shapesOfSerie = this.getShapesOfSerie(seriesUID);
    shapesOfSerie.forEach((shape) => {
      if (aimID && shape.aimId === aimID) shape.visible = visibility;
      else if (!aimID) {
        shape.visible = visibility;
      }
    });
  };

  getShapesOfSerie = (seriesUID) => {
    const { aimList } = this.props;
    const seriesAims = aimList[seriesUID];
    const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    const shapes = [];
    Object.values(toolState).forEach((imageState) => {
      Object.values(imageState).forEach((tools) => {
        Object.values(tools).forEach((tool) => {
          tool.forEach((shape) => {
            if (
              typeof shape.aimId === "undefined" ||
              typeof seriesAims[shape.aimId] !== "undefined"
            )
              shapes.push(shape);
          });
        });
      });
    });
    return shapes;
  };

  setVisibilityOfSegmentations = (aimID, element, setVisibilityTo) => {
    const { series, activePort, aimSegLabelMaps } = this.props;
    const { seriesUID } = series[activePort];
    const { setters, getters } = cornerstoneTools.getModule("segmentation");
    if (aimID) {
      const labelMapIndex = aimSegLabelMaps[aimID];
      setters.toggleSegmentVisibility(element, 1, labelMapIndex);
      const visibility = getters.isSegmentVisible(element, 1, labelMapIndex);
      if (visibility === setVisibilityTo) return;
    } else {
      const seriesLabelMapIndexes = this.getLabelMapsOfSerie(seriesUID);
      seriesLabelMapIndexes.forEach((labelMapIndex) => {
        const visibility = getters.isSegmentVisible(element, 1, labelMapIndex);
        if (visibility === setVisibilityTo) return;
        setters.toggleSegmentVisibility(element, 1, labelMapIndex);
      });
    }
  };

  getLabelMapsOfSerie = (seriesUID) => {
    const segAims = this.getSegmentationAimsOfSerie(seriesUID);
    const { aimSegLabelMaps } = this.props;
    return segAims.map((aimId) => {
      if (typeof aimSegLabelMaps[aimId] !== "undefined")
        return aimSegLabelMaps[aimId];
    });
  };

  getSegmentationAimsOfSerie = (seriesUID) => {
    const { aimList } = this.props;
    const seriesAims = aimList[seriesUID];
    const segAims = [];
    Object.entries(seriesAims).forEach(([key, value]) => {
      if (value.json.segmentationEntityCollection) {
        segAims.push(key);
      }
    });
    return segAims;
  };

  getData() {
    this.clearAllMarkups();//we are already clearing in it renderAims do we need to here? 
    try {
      const { series } = this.props;
      var promises = [];
      for (let i = 0; i < series.length; i++) {
        const promise = this.getImageStack(series[i], i);
        promises.push(promise);

      }
      Promise.all(promises).then((res) => {
        this.setState(
          {
            data: res,
            isLoading: false,
          },
          () => {
            this.jumpToAims();
            this.renderAims();
            this.refreshAllViewports();
            this.shouldOpenAimEditor();
            // this.jumpToImage(0, this.props.activePort);
          }
        );
      });
    } catch (error) {
      console.error(error);
    }
  }

  handleSerieReplace = ({ detail: viewportId }) => {
    const { series } = this.props;
    var promises = [];

    const promise = this.getImageStack(series[viewportId], viewportId);
    promises.push(promise);
    Promise.all(promises).then((res) => {
      const newData = [...this.state.data];
      newData[viewportId] = res[0];
      this.setState(
        {
          data: newData
        })
    })
  }

  shouldOpenAimEditor = (notShowAimEditor = false) => {
    const { series } = this.props;
    series.forEach(({ aimID, seriesUID }) => {
      if (aimID && !notShowAimEditor) this.openAimEditor(aimID, seriesUID);
    });
  };

  clearAllMarkups = () => {
    // clear the toolState they will be rendered again on next load
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState({});
    cornerstoneTools.store.modules.freehand3D.state.seriesCollection = [];
    // clear the segmentation data as well
    cornerstoneTools.store.modules.segmentation.state.series = {};
  }

  renderAims = (notShowAimEditor = false) => {
    const { series } = this.props;
    this.setState({
      activeLabelMapIndex: 0,
      prospectiveLabelMapIndex: 0,
    });
    // markups will be rendered so clear all previously renders
    this.clearAllMarkups();

    series.forEach((serie, serieIndex) => {
      if (serie.aimID && !notShowAimEditor) {
        const { aimID, seriesUID } = serie;
        this.openAimEditor(aimID, seriesUID);
      }
      if (serie.imageAnnotations)
        this.parseAims(
          serie.imageAnnotations,
          serie.seriesUID,
          serie.studyUID,
          serieIndex,
          serie
        );
    });

    this.refreshAllViewports();
  };

  async getImages(serie) {
    const { data: urls } = await getImageIds(serie); //get the Wado image ids for this series
    if (urls.length > 0) {
      const arr = urls[0].lossyImage.split('/');
      const subpath = [...this.state.subpath];
      subpath[this.props.activePort] = arr[1];
      this.setState({ subpath });
    }
    return urls;
  }

  prepUrl = (url) => {
    return `wadors:http://localhost:8090/pacs/studies/${url.studyUID}/series/${url.seriesUID}/instances/${url.imageUID}`;
  };

  getImageFrameURI = (metadataURI, metadata) => {
    // Use the BulkDataURI if present int the metadata
    if (metadata["7FE00010"] && metadata["7FE00010"].BulkDataURI) {
      console.log("donuyom", metadata["7FE00010"].BulkDataURI);
      return metadata["7FE00010"].BulkDataURI;
    }

    // fall back to using frame #1
    return metadataURI + "/frames/1";
  };

  getImageStack = async (serie, index) => {
    const wadoUrl = sessionStorage.getItem("wadoUrl");
    if (wadoUrl.includes('wadors'))
      return this.getImageStackWithWadors(serie, index);
    else
      return this.getImageStackWithWadouri(serie, index);
  }

  getImageStackWithWadors = async (serie, index) => {
    let stack = {};
    let newImageIds = {};
    let cornerstoneImageIds = [];
    let seriesMetadata = [];
    const imageUrls = await this.getImages(serie);
    let baseUrl;
    let wadoUrlNoWadors = sessionStorage.getItem("wadoUrl").replace('wadors:', '');
    const seriesURL = wadoUrlNoWadors + imageUrls[0].lossyImage.split('/instances/')[0];
    try {
      seriesMetadata = await getMetadata(seriesURL);
      seriesMetadata = seriesMetadata.data;
    } catch (err) {
      console.log("Can not get series metadata");
      console.error(err);
    }
    const useSeriesData = seriesMetadata.length > 0 && seriesMetadata.length === imageUrls.length;
    for (let k = 0; k < imageUrls.length; k++) {
      baseUrl = wadoUrlNoWadors + imageUrls[k].lossyImage;
      let data;
      let imgData;
      if (!useSeriesData) {
        const result = await getImageMetadata(baseUrl);
        data = result.data;
        imgData = data[0];
      } else imgData = seriesMetadata[k];

      if (imageUrls[k].multiFrameImage === true) {
        for (var i = 0; i < imageUrls[k].numberOfFrames; i++) {
          let multiFrameUrl = `wadors:${baseUrl}/frames/${i + 1}`;
          // mode !== "lite" ? baseUrl + "/frames/" + i : baseUrl;
          cornerstoneImageIds.push(multiFrameUrl);
          // cornerstone.loadAndCacheImage(multiFrameUrl);
          newImageIds[multiFrameUrl] = true;
          cornerstoneWADOImageLoader.wadors.metaDataManager.add(
            multiFrameUrl,
            imgData
          );
          // cornerstone.loadAndCacheImage(multiFrameUrl);
        }
      } else {
        let singleFrameUrl = `wadors:${baseUrl}/frames/1`;
        cornerstoneImageIds.push(singleFrameUrl);
        // cornerstone.loadAndCacheImage(singleFrameUrl);
        newImageIds[singleFrameUrl] = false;
        cornerstoneWADOImageLoader.wadors.metaDataManager.add(
          singleFrameUrl,
          imgData
        );
        // cornerstone.loadAndCacheImage(singleFrameUrl);
      }
    }
    const { imageIds } = this.state;
    this.setState({ imageIds: { ...imageIds, ...newImageIds } });

    //to jump to the same image after aim save
    let imageIndex;
    if (
      this.state.data[index] &&
      this.state.data[index].stack.currentImageIdIndex
    )
      imageIndex = this.state.data[index].stack.currentImageIdIndex;

    else imageIndex = 0;

    // if serie is being open from the annotation jump to that image and load the aim editor
    if (serie.aimID) imageIndex = this.getImageIndex(serie, cornerstoneImageIds);


    stack.currentImageIdIndex = parseInt(imageIndex, 10);
    stack.imageIds = [...cornerstoneImageIds];
    return { stack };
  }

  // resetImgIndexAfterLoad = () => {
  //   const data = { ...this.state.data };
  //   data.currentImageIdIndex = 0;
  //   this.setState()
  // }

  getImageStackWithWadouri = async (serie, index) => {
    let stack = {};
    let newImageIds = {};
    let cornerstoneImageIds = [];
    const imageUrls = await this.getImages(serie);
    const wadoUrl = sessionStorage.getItem("wadoUrl");
    let baseUrl;
    imageUrls.map((url) => {
      baseUrl = wadoUrl + url.lossyImage;
      if (url.multiFrameImage === true) {
        for (var i = 0; i < url.numberOfFrames; i++) {
          let multiFrameUrl = baseUrl + "&frame=" + i;
          // mode !== "lite" ? baseUrl + "/frames/" + i : baseUrl;
          cornerstoneImageIds.push(multiFrameUrl);
          // cornerstone.loadAndCacheImage(multiFrameUrl);
          newImageIds[multiFrameUrl] = true;
        }
      } else {
        let singleFrameUrl = baseUrl;
        cornerstoneImageIds.push(singleFrameUrl);
        // cornerstone.loadAndCacheImage(singleFrameUrl);
        newImageIds[singleFrameUrl] = false;
      }
    });
    const { imageIds } = this.state;
    this.setState({ imageIds: { ...imageIds, ...newImageIds } });

    //to jump to the same image after aim save
    let imageIndex;
    if (
      this.state.data[index] &&
      this.state.data[index].stack.currentImageIdIndex
    )
      imageIndex = this.state.data[index].stack.currentImageIdIndex;
    else imageIndex = 0;

    // if serie is being open from the annotation jump to that image and load the aim editor
    if (serie.aimID) {
      imageIndex = this.getImageIndex(serie, cornerstoneImageIds);
    }

    stack.currentImageIdIndex = parseInt(imageIndex, 10);
    stack.imageIds = [...cornerstoneImageIds];

    return { stack };
  };

  openAimEditor = (aimID, seriesUID) => {
    try {
      const { aimList } = this.props;
      if (Object.entries(aimList).length !== 0) {
        const aimJson = aimList[seriesUID][aimID].json;
        aimJson.aimID = aimID;
        const markupTypes = this.getMarkupTypesForAim(aimID);
        if (markupTypes)
          aimJson["markupType"] = [...markupTypes];
        aimJson["aimId"] = aimID;
        if (this.hasSegmentation(aimJson)) {
          this.setState({ hasSegmentation: true });
          // this.setSerieActiveLabelMap(aimID);
        }
        if (this.state.showAimEditor && this.state.selectedAim !== aimJson)
          this.setState({ showAimEditor: false });
        this.setState({ showAimEditor: true, selectedAim: aimJson });
        if (markupTypes)
          setMarkupsOfAimActive(aimID);//set the selected markups color to yellow
        this.refreshAllViewports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // setActiveLabelMapOfAim = (aimJson, element) => {
  //   // Means aim has segmentation alreay, find its segment index and set to edit it
  //   const { aimID } = aimJson;
  //   const labelMapOfAim = this.state.aimLabelMaps[aimID];
  //   this.setActiveLabelMapIndex(labelMapOfAim, element);
  // };

  setActiveLabelMapIndex = (index) => {
    // console.log("Parameter element", element);
    // console.log("Element", cornerstone.getEnabledElements());
    const { setters } = cornerstoneTools.getModule("segmentation");
    const element = this.getActiveElement();
    setters.activeLabelmapIndex(element, index);
  };

  // If called w/o parameter returns the activeElement, else returns the indexed element
  getActiveElement = (index) => {
    let activePort;
    if (typeof index !== "undefined") activePort = index;
    else ({ activePort } = this.props);
    const { element } = cornerstone.getEnabledElements()[activePort] || {};
    return element;
  };

  hasSegmentation = (aimJson) => {
    const { markupType } = aimJson;
    if (Array.isArray(markupType) && markupType.length)
      return markupType.some(this.isDicomSegEntity);
  };

  isDicomSegEntity = (markupType) => {
    return markupType === "DicomSegmentationEntity";
  };



  // Returns the image index of the aim of the serie or the passed aim if aimID is passed 
  getImageIndex = (serie, cornerstoneImageIds, aimID = "") => {
    if (aimID === "")
      aimID = serie.aimID;
    const { imageAnnotations, studyUID, seriesUID } = serie;
    if (imageAnnotations) {
      for (let [key, values] of Object.entries(imageAnnotations)) {
        for (let value of values) {
          if (value.aimUid === aimID) {
            const cornerstoneImageId = getWadoImagePath(
              studyUID,
              seriesUID,
              key,
              this.state.subpath[this.props.activePort]
            );
            const ret = this.getImageIndexFromImageId(
              cornerstoneImageIds,
              cornerstoneImageId
            );
            return ret;
          }
        }
      }
    }
    return 0;
  };

  getImageIndexFromImageId = (cornerstoneImageIds, cornerstoneImageId) => {
    const { imageIds } = this.state;
    if (!imageIds[cornerstoneImageId])
      cornerstoneImageId = cornerstoneImageId.split("&frame")[0];
    for (let [key, value] of Object.entries(cornerstoneImageIds)) {
      if (value == cornerstoneImageId) return key;
    }
    return 0;
  };

  getViewports = (containerHeight) => {
    const { hiding } = this.state;
    // if a viewport is maximized (hiding=true) than arrange the display as if there is only one serie
    let numSeries = 1;
    if (!hiding) {
      numSeries = this.props.series.length;
    }
    const { width, height } = getVPDimensions(numSeries);
    this.setState({ width, height });
  };

  createRefs() {
    this.state.series.map(() =>
      this.props.dispatch(this.createViewport(React.createRef()))
    );
  }

  createViewport(viewportRef) {
    return {
      type: "CREATE_VIEWPORT",
      payload: viewportRef,
    };
  }

  defaultSelectVP(id) {
    return {
      type: "SELECT_VIEWPORT",
      payload: id,
    };
  }

  hideShow = (current) => {
    const { hiding, containerHeight } = this.state;
    if (this.props.activePort !== current) {
      this.setActive(current);
      return;
    }
    // const element = cornerstone.getEnabledElements()[practivePort];
    const elements = document.getElementsByClassName("viewportContainer");
    if (hiding === false) {
      for (var i = 0; i < elements.length; i++) {
        if (i != current) elements[i].style.display = "none";
      }
      this.setState({ height: containerHeight, width: "100%" });
    } else {
      this.getViewports();
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "inline-block";
      }
    }
    this.setState(
      { hiding: !hiding },
      () =>
        window.dispatchEvent(
          new CustomEvent("resize", { detail: { isMaximize: !hiding } })
        ) //for cornerstone to fit the image
      // window.dispatchEvent(new Event("resizeViewport"))}
    );
  };

  getShapes = () => {
    const { series, activePort } = this.props;
    const aimId = series[activePort].aimID || undefined;
    const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    return getMarkups(toolState, aimId);
  };

  // TODO: Can this be done without checking the tools of interest?
  measurementCompleted = (event, action) => {
    // console.log("Measurement completed", event);
    const { toolName, toolType } = event.detail;

    const toolsOfInterest = [
      "Probe",
      "Length",
      "CircleRoi",
      "FreehandRoi3DTool",
      "ArrowAnnotate"
    ];
    if (toolsOfInterest.includes(toolName) || toolType === "Bidirectional") {
      this.setState({ showAimEditor: true });
    }
    this.handleShapes();
    this.setDirtyFlag();
  };

  getActiveSerie = () => {
    const { series, activePort } = this.props;
    return series[activePort];
  }

  measurementRemoved = (event) => {
    const serie = this.getActiveSerie();
    const { aimId } = event.detail.measurementData;
    if (aimId && this.isLastShapeInAim(aimId)) {
      const shouldDeleteAim = window.confirm("This is the last markup in Aim. Would yo like to delete the Aim file as well?");
      if (shouldDeleteAim) {
        this.deleteAim(aimId, serie);
        this.closeAimEditor(false);
        // this.setState({
        //   showAimEditor: false,
        //   selectedAim: undefined,
        //   hasSegmentation: false,
        //   dirty: false,
        // });
      }
      return;
    }
    this.handleShapes();
    this.setDirtyFlag();
  };

  deleteAim = (aimId, serie) => {
    const aimJson = this.getAimJson(aimId, serie);
    const { name, comment } = aimJson;
    let isStudyAim = false;
    if (this.getAimType(aimId, serie) === "study")
      isStudyAim = true;
    const { projectID, patientID, studyUID, seriesUID } = serie;
    const aimRefs = {
      aimID: aimId,
      patientID,
      projectID,
      seriesUID,
      studyUID,
      name,
      comment,
    };
    deleteAnnotation({ aimID: aimId, projectID }).then(() => {
      this.props.dispatch(clearAimId());
      this.props.dispatch(aimDelete({ aimRefs }))
      // Delete the comment down below after tests Sept 2021
      // this.props.dispatch(
      //   updateSingleSerie({
      //     subjectID: patientID,
      //     projectID,
      //     seriesUID,
      //     studyUID,
      //   })
      // );
      if (isStudyAim) {
        const { series } = this.props;
        series.forEach(({ seriesUID, studyUID }) => {
          if (serie.studyUID === studyUID && serie.seriesUID !== seriesUID)
            this.props.dispatch(
              getSingleSerie({ patientID, projectID, seriesUID, studyUID })
            );
        });
      }
      this.props.dispatch(
        getSingleSerie({ patientID, projectID, seriesUID, studyUID })
      );
    })
  }

  getAimType = (aimId, serie) => {
    const { seriesUID } = serie;
    const { aimList } = this.props;
    return aimList[seriesUID][aimId].type;
  }

  getAimJson = (aimId, serie) => {
    const { seriesUID } = serie;
    const { aimList } = this.props;
    return aimList[seriesUID][aimId].json;
  }

  // returns true if delted shape is the last shape in aim
  isLastShapeInAim = (aimId) => {
    const { series, activePort } = this.props;
    const { seriesUID } = series[activePort];
    const shapesOfSerie = this.getShapesOfSerie(seriesUID);
    if (shapesOfSerie) {
      return shapesOfSerie.find(shape => shape.aimId === aimId) ? false : true;
    }
    return true;
  };

  measuremementModified = (event, action) => {
    this.setDirtyFlag();
    // considering fusion, other viewports may need update so refresh all of them
    // TODO: may look at a flag of fusion 
    this.refreshAllViewports();
  };

  handleShapes = () => {
    const shapes = this.getShapes();
    window.dispatchEvent(
      new CustomEvent("checkShapes", {
        detail: shapes,
      })
    );
  };

  setDirtyFlag = () => {
    if (!this.state.dirty) this.setState({ dirty: true });
  };

  handleMarkupSelected = (event) => {
    const { aimList, series, activePort } = this.props;
    const { seriesUID } = series[activePort];
    const { aimId, ancestorEvent } = event.detail;
    if (!aimList[seriesUID][aimId]) {
      return;
    } //Eraser might have already delete the aim}
    const { element, data } = ancestorEvent;

    if (aimList[seriesUID][aimId]) {
      const aimJson = aimList[seriesUID][aimId].json;
      const markupTypes = this.getMarkupTypesForAim(aimId);
      aimJson["markupType"] = [...markupTypes];
      aimJson["aimId"] = aimId;

      // check if is already editing an aim
      if (this.state.showAimEditor && this.state.selectedAim !== aimJson) {
        let message = "";
        if (this.state.selectedAim) {
          message = this.prepWarningMessage(
            this.state.selectedAim.name.value,
            aimJson.name.value
          );
        }
        // event.detail.ancestorEvent.preventDefault();
        const shouldContinue = this.closeAimEditor(true, message);
        if (!shouldContinue) {
          event.preventDefault();
          data.active = false;
          cornerstone.updateImage(element);
          return;
        }
      }

      // if we are clciking on an markup and it's aim has segmentation, set the activeLabelMapIndex accordingly
      if (this.hasSegmentation(aimJson)) {
        this.setState({ hasSegmentation: true });
        const { labelMaps } = this.state.seriesLabelMaps[activePort];
        const labelMapIndexOfAim = labelMaps[aimId];
        this.setActiveLabelMapIndex(
          labelMapIndexOfAim,
          this.getActiveElement()
        );
      }

      setMarkupsOfAimActive(aimId);//set the selected markups color to yellow
      this.refreshAllViewports();

      //The following dispatched is a wrongly named method. it's dispatched to set the selected
      //AimId in the store!!!!!
      this.props.dispatch(jumpToAim(seriesUID, aimId, activePort));

      this.setState({ showAimEditor: true, selectedAim: aimJson });
    }
  };

  prepWarningMessage = (currentAim, destinationAim) => {
    return `You are trying to edit Aim named: ${destinationAim}. All unsaved changes in Aim named: ${currentAim} will be lost!!!`;
  };

  handleMarkupCreated = event => {
    const { detail } = event;
    const { hasSegmentation } = this.state;

    if (!hasSegmentation && detail === "brush") {
      this.setState({ hasSegmentation: true });
      this.refreshAllViewports();
    }
    this.setDirtyFlag();
    this.setState({ showAimEditor: true, selectedAim: undefined });
  };

  setActive = async (i) => {
    const { activePort, series } = this.props;
    if (activePort !== i) {
      if (this.state.showAimEditor) {

        if (!this.closeAimEditor(true)) {
          //means going to another viewport in the middle of creating/editing an aim
          return;
        }
      }
      this.setState({ activePort: i });
      await this.props.dispatch(changeActivePort(i));
      const { imageIds, currentImageIdIndex } = this.state.data[i].stack;
      const imageId = this.parseImgeId(imageIds[currentImageIdIndex]);
      await this.props.dispatch(updateImageId(imageId));
      this.setSerieActiveLabelMap();
    }
  };

  parseAims = (aimList, seriesUid, studyUid, serieIndex) => {
    const seriesSegmentations = [];
    Object.entries(aimList).forEach(([key, values]) => {
      this.linesToPerpendicular(values); //change the perendicular lines to bidirectional to render by CS
      values.forEach((value) => {
        const { markupType, aimUid } = value;
        if (markupType === "DicomSegmentationEntity") {
          seriesSegmentations.push({
            seriesUid,
            studyUid,
            aimUid,
            serieIndex,
          });
        }
        const color = this.getColorOfMarkup(value.aimUid, seriesUid);
        let imageId = getWadoImagePath(studyUid, seriesUid, key, this.state.subpath[this.props.activePort]);

        if (this.state.imageIds && !this.state.imageIds[imageId]) {
          //image is not multiframe so strip the frame number from the imageId
          imageId = imageId.split("&frame=")[0];
        }

        this.renderMarkup(imageId, value, color);
      });
    });
    // this.refreshAllViewports();
    if (seriesSegmentations.length)
      this.handleSegmentations(seriesSegmentations);
  };

  linesToPerpendicular = (values) => {
    // Takes two lines on the same image, checks if they belong to same Aima and if they are perpendicular.
    // If so, merges two lines on line1, cnahges the markup type from line to perpendicular
    // And deletes the second line not to be reRendered as line agai
    const lines = values.filter(this.checkIfLine);

    const groupedLines = Object.values(this.groupBy(lines, "aimUid"));
    groupedLines.forEach((lines) => {
      if (lines.length > 1) {
        for (let i = 0; i < lines.length; i++) {
          for (let j = i + 1; j < lines.length; j++) {
            let pair = [lines[i], lines[j]];
            if (this.checkIfPerpendicular(pair) && this.intersects(pair)) {
              // there are multiple lines on the same image that belongs to same aim, a potential perpendicular
              // they are perpendicular, remove them from the values list and render them as perpendicular
              pair[0].markupType = "Bidirectional";
              pair[0].calculations = pair[0].calculations.concat(
                pair[1].calculations
              );
              pair[0].coordinates = pair[0].coordinates.concat(
                pair[1].coordinates
              );

              const index = values.indexOf(pair[1]);
              if (index > -1) {
                values.splice(index, 1);
              }
            }
          }
        }
      }
    });
  };

  checkIfPerpendicular = (lines) => {
    const slope1 = this.getSlopeOfLine(
      lines[0]["coordinates"][0],
      lines[0]["coordinates"][1]
    );
    const slope2 = this.getSlopeOfLine(
      lines[1]["coordinates"][0],
      lines[1]["coordinates"][1]
    );

    if (
      (slope1 === "infinity" && slope2 === 0) ||
      (slope1 === 0 && slope2 === "infinity")
    )
      return true;
    else if (Math.round((slope1 * slope2 * 100) / 100) == -1) return true;
    return false;
  };

  getSlopeOfLine = (p1, p2) => {
    if (p2.x.value - p1.x.value === 0) return "infinity";
    return (p1.y.value - p2.y.value) / (p1.x.value - p2.x.value);
  };

  checkIfLine = (markup) => {
    if (markup) {
      return markup.markupType === "TwoDimensionMultiPoint";
    }
  };

  // returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
  intersects = (lines) => {
    const a = lines[0]["coordinates"][0].x.value;
    const b = lines[0]["coordinates"][0].y.value;
    const c = lines[0]["coordinates"][1].x.value;
    const d = lines[0]["coordinates"][1].y.value;
    const p = lines[1]["coordinates"][0].x.value;
    const q = lines[1]["coordinates"][0].y.value;
    const r = lines[1]["coordinates"][1].x.value;
    const s = lines[1]["coordinates"][1].y.value;
    var det, gamma, lambda;

    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
  };

  groupBy = (xs, key) => {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  handleSegmentations = seriesSegmentations => {
    let segLabelMaps = {};
    let activeLabelMapIndex;
    const { serieIndex } = seriesSegmentations[0];

    try {
      const { imageIds } = this.state.data[serieIndex].stack;

      var imagePromises = imageIds.map((imageId) => {
        return cornerstone.loadAndCacheImage(imageId);
      });

      Promise.all(imagePromises).then(async () => {
        seriesSegmentations.forEach(
          ({ seriesUid, studyUid, aimUid, serieIndex }, i) => {
            this.getSegmentationData(
              seriesUid,
              studyUid,
              aimUid,
              serieIndex,
              i
            );
            segLabelMaps[aimUid] = i;
          }
        );
        const { aimID } = this.props.series[serieIndex];
        const { seriesLabelMaps } = this.state;
        // If an aim is selected and it has segmentatio set the activeLabelMap of serie as selected
        // aim's labelMap. Else set it as the next available labelMap to brush new segs

        if (aimID && typeof segLabelMaps[aimID] !== "undefined")
          activeLabelMapIndex = segLabelMaps[aimID];
        else {
          activeLabelMapIndex = seriesSegmentations.length;
        }

        await this.setState({
          seriesLabelMaps: {
            ...seriesLabelMaps,
            [serieIndex]: {
              labelMaps: { ...segLabelMaps },
              activeLabelMapIndex,
            },
          },
        });
        this.setSerieActiveLabelMap(aimID);
      });
    } catch (error) {
      console.error(error);
    }
  };

  setSerieActiveLabelMap = aimId => {
    const { series, activePort } = this.props;
    const { seriesLabelMaps } = this.state;
    if (!seriesLabelMaps[activePort]) {
      return;
    } //The default activeLabelMap will be 0 automatically
    const { imageIds } = this.state.data[activePort].stack;

    var imagePromises = imageIds.map((imageId) => {
      return cornerstone.loadAndCacheImage(imageId);
    });
    Promise.all(imagePromises).then(() => {
      let newLabelMapIndex;
      if (!aimId) {
        const { aimID } = series[activePort];
        aimId = aimID;
      }

      const { labelMaps, activeLabelMapIndex } = seriesLabelMaps[activePort];
      if (aimId && typeof labelMaps[aimId] !== "undefined")
        newLabelMapIndex = labelMaps[aimId];
      else newLabelMapIndex = activeLabelMapIndex;

      // // If an aim is selected set its label map for editing
      // if (seriesLabelMaps && seriesLabelMaps[activePort])
      //   newLabelMapIndex = seriesLabelMaps[activePort].activeLabelMapIndex;
      // else if (aimId && typeof labelMaps[aimId] !== "undefined") {
      //   console.log("State buradaaa", this.state);
      //   const { labelMaps } = seriesLabelMaps[activePort];
      //   newLabelMapIndex = labelMaps[aimId];
      //   console.log("aim ", aimId, "lmi", newLabelMapIndex);
      // } else newLabelMapIndex = 0;

      this.setActiveLabelMapIndex(newLabelMapIndex, this.getActiveElement());
    });
  };

  getSegmentationData = (
    seriesUID,
    studyUID,
    aimId,
    serieIndex,
    labelMapIndex
  ) => {
    const { aimList } = this.props;

    const segmentationEntity =
      aimList[seriesUID][aimId].json.segmentationEntityCollection
        .SegmentationEntity[0];

    const { seriesInstanceUid, sopInstanceUid } = segmentationEntity;

    const pathVariables = { studyUID, seriesUID: seriesInstanceUid.root };

    getSegmentation(pathVariables, sopInstanceUid.root).then(({ data }) => {
      this.renderSegmentation(data, aimId, serieIndex, labelMapIndex);
    });
  };

  clearFrameNumber = (arrayBuffer) => {
    const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
      dicomData.dict
    );

    const sourceImageSequence = dataset?.SharedFunctionalGroupsSequence?.DerivationImageSequence?.SourceImageSequence;
    if (sourceImageSequence) {
      sourceImageSequence.forEach(sourceImage => {
        delete sourceImage.ReferencesFrameNumber;
      })
    }
  }

  renderSegmentation = (arrayBuffer, aimId, serieIndex, labelMapIndex) => {
    this.clearFrameNumber(arrayBuffer);

    // const { labelMaps } = this.state.seriesLabelMaps[serieIndex];
    // const labelMapIndex = labelMaps[aimId];
    const { imageIds } = this.state.data[serieIndex].stack;
    try {
      // var imagePromises = imageIds.map((imageId) => {
      //   return cornerstone.loadAndCacheImage(imageId);
      // });

      // Promise.all(imagePromises).then(() => {
      // const stackToolState = cornerstoneTools.getToolState(element, "stack");
      // const imageIds = stackToolState.data[0].imageIds;
      const {
        labelmapBuffer,
        segMetadata,
        segmentsOnFrame,
      } = dcmjs.adapters.Cornerstone.Segmentation.generateToolState(
        imageIds,
        arrayBuffer,
        cornerstone.metaData
      );

      const { setters, getters } = cornerstoneTools.getModule("segmentation");

      setters.labelmap3DByFirstImageId(
        imageIds[0],
        labelmapBuffer,
        labelMapIndex,
        segMetadata.data,
        imageIds.length,
        segmentsOnFrame
      );
      // console.log(
      //   "I have rendered ",
      //   aimId,
      //   "with labelMapIndex :",
      //   activeLabelMapIndex
      // );

      const { element } = cornerstone.getEnabledElements()[serieIndex];
      cornerstone.updateImage(element);
      // const length = Object.entries(labelMaps).length;
      // setters.activeLabelmapIndex(element, length);
      // if (this.state.selectedAim) {
      //   //if an aim is selected find its label map index, 0 if no segmentation in aim
      //   //an aim is being edited don't set the label map index because aim's segs should be brushed
      //   this.setActiveLabelMapOfAim(this.state.selectedAim, element);
      // } else {
      //   this.setActiveLabelMapIndex(
      //     this.state.activeLabelMapIndex + 1,
      //     element
      //   );
      // }

      // console.log(
      //   "New activeLabelMap Index is ",
      //   getters.activeLabelmapIndex(element)
      // );

      this.props.dispatch(setSegLabelMapIndex(aimId, labelMapIndex));

      // this.refreshAllViewports();
      // });
    } catch (error) {
      console.error(error);
    }
  };

  refreshAllViewports = () => {
    const elements = cornerstone.getEnabledElements();
    if (elements) {
      elements.map(({ element }) => {
        try {
          cornerstone.updateImage(element); //update the image to show newly loaded segmentations}
        } catch (error) {
          // console.error("Error:", error);
        }
      });
    }
  };

  getColorOfMarkup = (aimUid, seriesUid) => {
    try {
      return this.props.aimList[seriesUid][aimUid].color.button.background;
    } catch (error) {
      console.error(error);
    }
  };

  renderMarkup = (imageId, markup, color, seriesUid, studyUid) => {
    const type = markup.markupType;
    switch (type) {
      case "TwoDimensionPolyline":
        this.renderPolygon(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionMultiPoint":
        if (markup?.lineStyle?.value === "Arrow") {
          this.renderArrow(imageId, markup, color, seriesUid, studyUid);
          break;
        }
        this.renderLine(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionCircle":
        this.renderCircle(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionPoint":
        this.renderPoint(imageId, markup, color, seriesUid, studyUid);
        break;
      case "Bidirectional":
        this.renderBidirectional(imageId, markup, color, seriesUid, studyUid);
        break;
      default:
        return;
    }
  };

  checkNCreateToolForImage = (toolState, imageId, tool) => {
    if (!toolState.hasOwnProperty(imageId))
      toolState[imageId] = { [tool]: { data: [] } };
    else if (!toolState[imageId].hasOwnProperty(tool))
      toolState[imageId] = { ...toolState[imageId], [tool]: { data: [] } };
  };

  renderBidirectional = (imageId, markup, color) => {
    const data = JSON.parse(JSON.stringify(bidirectional));
    data.color = markup.color ? markup.color : color;
    data.aimId = markup.aimUid;
    data.invalidated = true;
    this.createBidirectionalPoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imageId, "Bidirectional");
    currentState[imageId]["Bidirectional"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createBidirectionalPoints = (data, points) => {
    data.handles.start.x = points[0].x.value;
    data.handles.start.y = points[0].y.value;
    data.handles.end.x = points[1].x.value;
    data.handles.end.y = points[1].y.value;
    data.handles.perpendicularStart.x = points[2].x.value;
    data.handles.perpendicularStart.y = points[2].y.value;
    data.handles.perpendicularEnd.x = points[3].x.value;
    data.handles.perpendicularEnd.y = points[3].y.value;
    // need to set the text box coordinates for this too
    data.handles.textBox.x = points[0].x.value;
    data.handles.textBox.y = points[0].y.value;
  };

  renderArrow = (imageId, markup, color) => {
    const data = JSON.parse(JSON.stringify(arrow));
    data.color = markup.color ? markup.color : color;
    data.aimId = markup.aimUid;
    data.invalidated = true;
    this.createLinePoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imageId, "ArrowAnnotate");
    currentState[imageId]["ArrowAnnotate"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  renderLine = (imageId, markup, color) => {
    const data = JSON.parse(JSON.stringify(line));
    data.color = markup.color ? markup.color : color;
    data.aimId = markup.aimUid;
    data.invalidated = true;
    this.createLinePoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imageId, "Length");
    currentState[imageId]["Length"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createLinePoints = (data, points) => {
    data.handles.start.x = points[0].x.value;
    data.handles.start.y = points[0].y.value;
    data.handles.end.x = points[1].x.value;
    data.handles.end.y = points[1].y.value;
  };

  renderPolygon = (imageId, markup, color) => {
    const data = JSON.parse(JSON.stringify(freehand));
    data.color = markup.color ? markup.color : color;
    data.aimId = markup.aimUid;
    data.invalidated = true;
    this.createPolygonPoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imageId, "FreehandRoi");
    currentState[imageId]["FreehandRoi"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createPolygonPoints = (data, points) => {
    const freehandPoints = [];
    const modulo = points.length;
    points.forEach((point, index) => {
      const linesIndex = (index + 1) % modulo;
      const freehandPoint = {};
      freehandPoint.x = point.x.value;
      freehandPoint.y = point.y.value;
      freehandPoint.highlight = true;
      freehandPoint.active = true;
      freehandPoint.lines = [
        { x: points[linesIndex].x.value, y: points[linesIndex].y.value },
      ];
      freehandPoints.push(freehandPoint);
    });
    data.handles.points = [...freehandPoints];
  };

  renderPoint = (imageId, markup, color) => {
    const data = JSON.parse(JSON.stringify(probe));
    data.color = markup.color ? markup.color : color;
    data.aimId = markup.aimUid;
    data.handles.end.x = markup.coordinates[0].x.value;
    data.handles.end.y = markup.coordinates[0].y.value;
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imageId, "Probe");
    currentState[imageId]["Probe"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  renderCircle = (imageId, markup, color) => {
    const data = JSON.parse(JSON.stringify(circle));
    data.invalidated = true; //so it calculates the stats
    data.color = markup.color ? markup.color : color;
    data.aimId = markup.aimUid;
    data.handles.start.x = markup.coordinates[0].x.value;
    data.handles.start.y = markup.coordinates[0].y.value;
    data.handles.end.x = markup.coordinates[1].x.value;
    data.handles.end.y = markup.coordinates[1].y.value;
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imageId, "CircleRoi");
    currentState[imageId]["CircleRoi"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  checkUnsavedData = (isCancel, message = "") => {
    if (isCancel === true) {
      if (message === "")
        message = "All unsaved data will be lost! Do you want to continue?";
      var answer = window.confirm(message);
      if (!answer) {
        return 0;
      }
    }
    return 1;
  };

  closeAimEditor = (isCancel, message = "") => {
    const { dirty } = this.state;
    if (dirty) {
      const unsavedData = this.checkUnsavedData(isCancel, message);
      if (!unsavedData) return -1;
    }
    // if aim editor has been cancelled ask to user
    // if (this.state.dirty && !this.checkUnsavedData(isCancel, message)) return;
    this.setState({
      showAimEditor: false,
      selectedAim: undefined,
      hasSegmentation: false,
      dirty: false,
    });
    this.props.dispatch(clearActivePortAimID()); //this data is rendered so clear the aim Id in props
    this.clearSculptState();
    this.clearSmartBrushState();
    this.renderAims(true);
    this.handleActiveTool();
    return 1;
  };

  clearSculptState = () => {
    const { tools } = cornerstoneTools.store.state;
    const evt = {};
    const selectSculptCursor = false;
    for (let i = 0; i < tools.length; i++) {
      if (tools[i].name === "FreehandRoiSculptor") {
        tools[i]._deselectAllTools(evt, selectSculptCursor);
        return;
      }
    }
  }

  clearSmartBrushState = () => {
    const brushModule = cornerstoneTools.store.modules.segmentation;
    delete brushModule.configuration.applyToImage;
    delete brushModule.configuration.maxInterval;
    delete brushModule.configuration.minInterval;
  }

  closeViewport = () => {
    const { showAimEditor, dirty } = this.state;
    // closes the active viewport
    if (showAimEditor && dirty) {
      window.alert(
        "Before closing the viewport you should first close the aim editor!"
      );
      return;
    }
    this.props.dispatch(closeSerie());
    // this.props.onSwitchView("search");
  };

  handleHideAnnotations = () => {
    this.setState({ showAnnDetails: false });
  };

  getMarkupTypesForAim = (aimUid) => {
    let markupTypes = [];
    try {
      const imageAnnotations = this.props.series[this.props.activePort]
        .imageAnnotations;
      if (!imageAnnotations) {
        return undefined;
      }
      Object.entries(imageAnnotations).forEach(([key, values]) => {
        values.forEach((value) => {
          if (value.aimUid === aimUid) markupTypes.push(value.markupType);
        });
      });
    } catch (error) {
      console.error(error);
    }
    return markupTypes;
  };
  // this is in aimEditor. should be somewhare common so both can use (the new aimapi library)
  parseImgeId = (imageId) => {
    if (imageId.includes("objectUID=")) return imageId.split("objectUID=")[1];
    if (imageId.includes('wadors')) return imageId.split('/instances/').pop();
    return imageId.split("/").pop();
  };

  newImage = (event, index) => {
    let { imageId } = event.detail.image;
    imageId = this.parseImgeId(imageId); //strip from cs imagePath to imageId
    const { activePort } = this.props;
    const tempData = [...this.state.data];
    const activeElement = cornerstone.getEnabledElements()[activePort];
    const { data } = cornerstoneTools.getToolState(
      activeElement.element,
      "stack"
    );
    tempData[activePort].stack = data[0];
    Object.assign(tempData[activePort].stack, data[0]);
    // set the state to preserve the imageId
    // this.setState({ data: tempData });
    // // dispatch to write the newImageId to store
    event.detail.viewportIndex = index;
    this.props.dispatch(updateImageId(imageId, event.detail.viewportIndex));
    const yaw = event.detail;
    window.dispatchEvent(
      new CustomEvent("newImage", { detail: yaw })
    );
  };

  onAnnotate = () => {
    this.setState({ showAimEditor: true });
  };
  handleClose = (i) => {
    if (this.props.activePort !== i) {
      this.setActive(i);
      return;
    }
    this.closeViewport();
  };

  // Triggered by event from right bar to jump to the image of aim
  jumpToAimImage = event => {
    const { series, activePort } = this.props;
    const aimId = event.detail;
    const imageIndex = this.getImageIndex(series[activePort], this.state.data[activePort].stack.imageIds, aimId);
    this.jumpToImage(imageIndex, activePort);
  };

  // Don't take the activePort Index from props because store updates late so
  // activePort may be null while the event is triggered
  jumpToImage = (imageIndex, activePortIndex) => {
    const newData = [...this.state.data];
    newData[activePortIndex].stack.currentImageIdIndex = parseInt(
      imageIndex,
      10
    );
    this.setState({ data: newData });
  };

  handleJumpChange = (i, event) => {
    if (this.props.activePort !== i) {
      this.setActive(i);
      return;
    }
    let imageIndex = event.target.value - 1;
    const images = this.state.data[this.props.activePort].stack.imageIds;
    // check if there is such an image
    if (isNaN(imageIndex) || !images[imageIndex]) return;
    this.jumpToImage(imageIndex, i);
  };

  toggleOverlay = (e, i) => {
    const showHide = { ... this.state.isOverlayVisible };
    const index = i || i === 0 ? i : this.props.activePort;
    if (showHide[index]) delete showHide[index];
    else showHide[index] = true;
    this.setState({ isOverlayVisible: showHide });
  }

  render() {
    const { series, activePort, updateProgress, updateTreeDataOnSave } = this.props;
    const { showAimEditor, selectedAim, hasSegmentation, activeLabelMapIndex, data, activeTool } = this.state;
    // const loadingImgIndex = Math.ceil(data?.stack?.imageIds.length / 2);
    // console.log(data);
    // if (this.state.redirect) return <Redirect to="/list" />;
    const redirect = (mode === 'teaching' ? 'search' : 'list');
    return !Object.entries(series).length ? (
      <Redirect to={`/${redirect}`} />
    ) : (
      <React.Fragment>
        <RightsideBar
          showAimEditor={showAimEditor}
          selectedAim={selectedAim}
          onCancel={this.closeAimEditor}
          hasSegmentation={hasSegmentation}
          activeLabelMapIndex={activeLabelMapIndex}
          updateProgress={updateProgress}
          updateTreeDataOnSave={updateTreeDataOnSave}
          setAimDirty={this.setDirtyFlag}
          saveData={this.props.saveData}
          savedData={this.props.savedData}
        >
          <ToolMenu
            onSwitchView={this.props.onSwitchView}
          />
          {this.state.isLoading && <div style={{ marginTop: '30%', marginLeft: '50%' }}>
            <PropagateLoader color={'#7A8288'} loading={this.state.isLoading} margin={8} />
          </div>}
          {!this.state.isLoading &&
            Object.entries(series).length &&
            data.map((data, i) => (
              <div
                className={
                  "viewportContainer" +
                  (activePort == i ? " selected" : "")
                }
                key={i}
                id={"viewportContainer" + i}
                style={{
                  width: this.state.width,
                  height: this.state.height,
                  display: "inline-block",
                }}
                onClick={() => this.setActive(i)}
              >
                <div className={"row"}>
                  <div className={"column left"}>
                    <span
                      className={"dot"}
                      style={{ background: "#ED594A" }}
                      onClick={() => this.handleClose(i)}
                    >
                      <FaTimes />
                    </span>
                    <span
                      className={"dot"}
                      style={{ background: "#5AC05A" }}
                      onClick={() => this.hideShow(i)}
                    >
                      <FaExpandArrowsAlt />
                    </span>
                    <span
                      className={"dot"}
                      style={{ background: "deepskyblue" }}
                      onClick={(e) => { this.toggleOverlay(e, i) }}
                    >
                      <FaTag />
                    </span>
                  </div>
                  {/* <div className={"column middle"}>
                    <label>{series[i].seriesUID}</label>
                  </div> */}
                  <div className={"column middle-right"} style={{ paddingTop: '0px' }}>
                    <div style={{ paddingTop: '10px' }}>
                      <Form inline className="slice-form">
                        <Form.Group className="slice-number">
                          <Form.Label htmlFor="imageNum" className="slice-label" style={{ color: 'white' }}>
                            {"Image # "}
                          </Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            value={parseInt(data?.stack?.currentImageIdIndex) + 1}
                            className={"slice-field"}
                            onChange={(event) => this.handleJumpChange(i, event)}
                            style={{
                              width: "60px",
                              height: "10px",
                              opacity: 1,
                              display: 'inline'
                            }}
                          />
                        </Form.Group>
                      </Form>
                    </div>
                    <div className={"series-dd"}>
                      <SeriesDropDown
                        style={{ lineHeight: "1" }}
                        serie={series[i]}
                        isAimEditorShowing={this.state.showAimEditor}
                        onCloseAimEditor={this.closeAimEditor}
                        onSelect={this.jumpToImage}
                      />
                    </div>
                  </div>
                  <div className={"column right"}>
                    <span
                      className={"dot"}
                      style={{ background: "#FDD800", float: 'right' }}
                      onClick={() => {
                        this.setState({ showAimEditor: true });
                      }}
                    >
                      <FaPen />
                    </span>
                  </div>
                </div>
                <CornerstoneViewport
                  key={i}
                  imageIds={data.stack.imageIds}
                  // imageIdIndex={Math.ceil(data.stack.imageIds.length / 2)}
                  imageIdIndex={data.stack.currentImageIdIndex}
                  viewportIndex={i}
                  tools={tools}
                  shouldInvert={this.state.invertMap[i]}
                  eventListeners={[
                    {
                      target: "element",
                      eventName: "cornerstonetoolsmeasurementcompleted",
                      handler: this.measurementCompleted,
                    },
                    {
                      target: "element",
                      eventName: "cornerstonetoolsmeasurementmodified",
                      handler: this.measuremementModified,
                    },
                    {
                      target: "element",
                      eventName: "cornerstonetoolsmeasurementremoved",
                      handler: this.measurementRemoved,
                    },
                    {
                      target: "element",
                      eventName: "cornerstonenewimage",
                      handler: (e) => this.newImage(e, i),
                    },
                  ]}
                  setViewportActive={() => this.setActive(i)}
                  isStackPrefetchEnabled={true}
                  style={{ height: "calc(100% - 26px)" }}
                  activeTool={activeTool}
                  isOverlayVisible={this.state.isOverlayVisible[i] || false}
                  jumpToImage={() => this.jumpToImage(0, i)}
                />
              </div>
            ))}
          {/* <ContextMenu
            onAnnotate={this.onAnnotate}
            closeViewport={this.closeViewport}
          /> */}
        </RightsideBar>
      </React.Fragment>
    );
    // </div>
  }
}

export default withRouter(connect(mapStateToProps)(DisplayView));
