import React from "react";
import { connect } from "react-redux";
import PropagateLoader from "react-spinners/PropagateLoader";
import Annotation from "./annotation";
import AnnotationsLink from "./newAnnotationsLink";
import {
  updateAnnotationDisplay,
  toggleAllLabels,
  toggleSingleLabel,
  toggleAllAnnotations,
  toggleAllCalculations
} from "../action";
import { deleteAnnotation } from "../../../services/annotationServices";
import cornerstone from "cornerstone-core";
import { state } from "cornerstone-tools/store/index.js";

let wadoUrl;

class AnnotationsList extends React.Component {
  wadoUrl = sessionStorage.getItem("wadoUrl");
  state = {
    showCalculations: false,
  };

  componentDidUpdate = (prevProps) => {
    const { showCalculations, aimsList, activePort, openSeriesAddition } = this.props;
    // const { seriesUID } = openSeriesAddition[activePort];
    
    // const prevAims = prevProps.aimsList[seriesUID] ? Object.keys(prevProps.aimsList[seriesUID]) : [];
    // const curAims = aimsList[seriesUID] ? Object.keys(aimsList[seriesUID]) : [];

    state.showCalculations = showCalculations; //set the cornerstone state with componenets state
    this.refreshAllViewports();
  };

  handleDisplayClick = (e) => {
    const { patientID, studyUID } =
      this.props.openSeries[this.props.activePort];
    const {seriesUID} = this.getFusedSerieInfoAndAnnotations();
    const aimID = e.target.id;
    if (aimID) {
      const currentDisplayStatus =
        this.props.aimsList[seriesUID][aimID].isDisplayed;
      this.props.dispatch(
        updateAnnotationDisplay(
          patientID,
          studyUID,
          seriesUID,
          aimID,
          !currentDisplayStatus
        )
      );
      window.dispatchEvent(
        new CustomEvent("toggleAnnotations", {
          detail: { aimID, isVisible: !currentDisplayStatus },
        })
      );
    }
  };

  refreshAllViewports = () => {
    const elements = cornerstone.getEnabledElements();
    if (elements) {
      elements.map(({ element }) => {
        try {
          cornerstone.updateImage(element);
        } catch (error) {
          // console.error("Error:", error);
        }
      });
    }
  };

  handleCalculations = ({ target }) => {
    this.props.dispatch(toggleAllCalculations(target.checked));
    state.showCalculations = target.checked;
    this.refreshAllViewports();
    // this.setState({ showCalculations: target.checked }, () => {
    //   state.showCalculations = this.state.showCalculations; //set the cornerstone state with componenets state
    //   this.refreshAllViewports();
    // });
  };

  handleToggleAllLabels = ({ target }, e, id) => {
    this.props.openSeries.forEach(el => this.props.dispatch(toggleAllLabels(el.seriesUID, target.checked)));
  };

  handleToggleAllAnnotations = ({ target }, e, id) => {
    this.props.openSeries.forEach((el, i) => {
      const { seriesUID } = el;
      this.props.dispatch(toggleAllAnnotations(seriesUID, target.checked));
      window.dispatchEvent(
        new CustomEvent("toggleAnnotations", {
          detail: { isVisible: target.checked },
        })
      );
    });
  };

  handleToggleSingleLabel = (e) => {
    const {seriesUID} = this.getFusedSerieInfoAndAnnotations();
    this.props.dispatch(toggleSingleLabel(seriesUID, e.target.dataset.id));
  };

  handleEdit = (aimID, seriesUID) => {
    window.dispatchEvent(
      new CustomEvent("editAim", { detail: { aimID, seriesUID } })
    );
  };

  handleDelete = (aim, openSerie) => {
    window.dispatchEvent(
      new CustomEvent("deleteAim", { detail: { aim, openSerie } })
    );
  };

  getLabelArray = () => {
    const calculations = {};
    const wadors = this.wadoUrl.includes("wadors");
    try {
      const { openSeries, activePort, openSeriesAddition } = this.props;
      let imageAnnotations;
      const {imageID, aimList} = this.getFusedSerieInfoAndAnnotations();
    
      if (aimList) {
        const annotations = aimList;
        imageAnnotations = annotations[imageID];
        // TODO: check frame number ??
        if (!imageAnnotations) {
          imageAnnotations = wadors
            ? annotations[imageID]
            : annotations[imageID + "&frame=1"];
        }
      }
      if (imageAnnotations) {
        for (let aim of imageAnnotations) {
          if (calculations[aim.aimUid]) {
            calculations[aim.aimUid][aim.markupUid] = {
              calculations: [...aim.calculations],
              markupType: aim.markupType,
            };
            // calculations[aim.markupUid].push({ markupType: aim.markupType });
          } else {
            calculations[aim.aimUid] = {};
            calculations[aim.aimUid][aim.markupUid] = {
              calculations: aim.calculations ? [...aim.calculations] : [],
              markupType: aim.markupType,
            };
            // calculations[aim.markupUid].push({ markupType: aim.markupType });
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
    return calculations;
  };

  getFusedSerieInfoAndAnnotations = () => {
    let {seriesUID, imageID} = this.props.openSeries[this.props.activePort];
    let aimList = this.props.openSeriesAddition[this.props.activePort].imageAnnotations;
    if (cornerstone.getEnabledElements()[this.props.activePort]) {
      const element = cornerstone.getEnabledElements()[this.props.activePort]['element'];
      const activeLayer = cornerstone.getActiveLayer(element);
      const isFused = !!activeLayer;
      // it is fused get the correct series UID
      if (isFused) {
        seriesUID = activeLayer.image.imageId.split('/series/')[1].split('/')[0];
        imageID = activeLayer.image.imageId.split('/instances/')[1];
        for (let i=0; i<=this.props.openSeriesAddition.length; i+=1) {
          if (this.props.openSeriesAddition[i].seriesUID === seriesUID) {
            return {seriesUID: seriesUID, imageID: imageID, aimList: this.props.openSeriesAddition[i].imageAnnotations};
          }
        }
      }
    } 
    return {seriesUID, imageID, aimList};
    
  }


  render = () => {
    // try {
    let preparing = true;  
    const { openSeries, openSeriesAddition, aimsList } = this.props;
    let { activePort } = this.props;
    activePort = activePort || activePort === 0 ? activePort : 0;
    const {seriesUID, imageID, aimList}= this.getFusedSerieInfoAndAnnotations();
    const openSerie = {...openSeries[activePort]};
    openSerie.seriesUID = seriesUID;
    let annotations = {};
    let aims = aimsList[seriesUID];
    for (let aim in aims) {
      if (aims[aim].type === "study" || aims[aim].type === "serie") {
        let { id } = aims[aim];
        annotations[id]
          ? annotations[id].push(aims[aim])
          : (annotations[id] = [aims[aim]]);
      }
    }
    const wadors = this.wadoUrl.includes("wadors");

    if (aimList) {
      let imageAnnotations;

      const singleFrameAnnotations = aimList[imageID];
      const multiFrameAnnotations = wadors
        ? aimList[imageID]
        : aimList[imageID + "&frame=1"];
      const noMarkupAnnotations = aimList[imageID + "-img"];

      if (singleFrameAnnotations && multiFrameAnnotations)
        imageAnnotations = [
          ...singleFrameAnnotations,
          ...multiFrameAnnotations,
        ];
      else if (singleFrameAnnotations)
        imageAnnotations = singleFrameAnnotations;
      else if (multiFrameAnnotations) imageAnnotations = multiFrameAnnotations;

      if (noMarkupAnnotations) {
        imageAnnotations = imageAnnotations
          ? [...imageAnnotations, ...noMarkupAnnotations]
          : noMarkupAnnotations;
      }

      if (imageAnnotations) {
        try {
          for (let aim of imageAnnotations) {
            let { aimUid } = aim;
            annotations?.[aimUid]
              ? annotations[aimUid].push(aimsList[seriesUID][aim.aimUid])
              : (annotations[aimUid] = [aimsList[seriesUID][aim.aimUid]]);
          }
        } catch (e) {}
      }
    }
    preparing = false;  
    const calculations = this.getLabelArray();
    let annList = [];
    const imageAims = { ...annotations };
    annotations = Object.values(annotations);
    annotations.forEach((aim, index) => {
      if (aim[0]) {
        aim = aim[0];
        annList.push(
          <Annotation
            name={aim.name}
            style={aim.color}
            aim={aim.json}
            id={aim.id}
            key={aim.id}
            displayed={aim.isDisplayed}
            onClick={this.handleDisplayClick}
            user={aim.user}
            showLabel={aim.showLabel}
            onSingleToggle={this.handleToggleSingleLabel}
            onEdit={this.handleEdit}
            onDelete={() => this.handleDelete(aim, openSerie)}
            serie={seriesUID}
            label={calculations[aim.id]}
            openSeriesAimID={openSerie.aimID}
          />
        );
      }
    });
    // } catch (e) {
    //   console.log("Error: ", e);
    // }
    return (
      <>
        {(this.props.loading || preparing) && (
          <div style={{ marginTop: "10%", marginLeft: "30%" }}>
            <PropagateLoader
              color={"#ccc"}
              loading={this.props.loading || preparing}
              margin={8}
            />
          </div>
        )}
        {!this.props.loading && (
          <React.Fragment>
            <div
              className="annotationList-container"
              style={{ paddingTop: "5px" }}
            >
              <div className="checkbox-row">
                <div className="form-check form-check-inline">
                  <input
                    type="checkbox"
                    role="switch"
                    id="showAnnotations"
                    onChange={this.handleCalculations}
                    checked={this.props.showCalculations}
                    name="showCalculations"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckDefault"
                  >
                    Show Calculations
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="checkbox"
                    role="switch"
                    id="showAnnotations"
                    onChange={this.handleToggleAllLabels}
                    checked={this.props.showLabels}
                    name="showLabels"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckDefault"
                  >
                    Show Details
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="checkbox"
                    role="switch"
                    id="showAnnotations"
                    onChange={this.handleToggleAllAnnotations}
                    checked={this.props.showAnnotations}
                    name="showAnnotations"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckDefault"
                  >
                    Show Markups
                  </label>
                </div>
              </div>
            </div>

            <div className="annList-container">{annList}</div>
            <AnnotationsLink imageAims={imageAims} />
          </React.Fragment>
        )}
      </>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    openSeriesAddition: state.annotationsListReducer.openSeriesAddition,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList,
    imageID: state.annotationsListReducer.imageID,
    loading: state.annotationsListReducer.loading,
    showCalculations: state.annotationsListReducer.showCalculations,
    showLabels: state.annotationsListReducer.showLabels,
    showAnnotations: state.annotationsListReducer.showAnnotations,
  };
};
export default connect(mapStateToProps)(AnnotationsList);
