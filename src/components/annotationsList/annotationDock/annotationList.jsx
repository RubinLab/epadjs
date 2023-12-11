import React from "react";
import { connect } from "react-redux";
import Annotation from "./annotation";
import AnnotationsLink from "./annotationsLink";
import {
  updateAnnotationDisplay,
  toggleAllLabels,
  toggleSingleLabel,
  toggleAllAnnotations,
} from "../action";
import { deleteAnnotation } from "../../../services/annotationServices";
import cornerstone from "cornerstone-core";
import { state } from "cornerstone-tools/store/index.js";

let wadoUrl;

class AnnotationsList extends React.Component {
  wadoUrl = sessionStorage.getItem("wadoUrl");
  state = {
    labelDisplayAll: false,
    annsDisplayAll: true,
    showCalculations: false,
  };

  componentDidUpdate = (prevProps) => {
    try {
      const series = Object.keys(this.props.aimsList);
      if (
        (this.props.activePort !== prevProps.activePort &&
          !this.props.loading) ||
        (!this.props.loading &&
          prevProps.loading &&
          series.length === this.props.openSeries.length)
      ) {
        const seriesUID =
          this.props.openSeries[this.props.activePort].seriesUID;
        let annotations = Object.values(this.props.aimsList[seriesUID]);
        let labelDisplayAll = true;
        let annsDisplayAll = true;
        for (let ann of annotations) {
          if (ann.isDisplayed) {
            annsDisplayAll = true;
          }
        }
        for (let ann of annotations) {
          if (ann.showLabel) {
            labelDisplayAll = true;
          }
        }
        this.setState({ labelDisplayAll, annsDisplayAll });
      }
    } catch (err) {
      console.error(err);
    }
  };

  handleDisplayClick = (e) => {
    const { seriesUID, patientID, studyUID } =
      this.props.openSeries[this.props.activePort];
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
    this.setState({ showCalculations: target.checked }, () => {
      state.showCalculations = this.state.showCalculations; //set the cornerstone state with componenets state
      this.refreshAllViewports();
    });
  };

  handleToggleAllLabels = ({ target }, e, id) => {
    this.setState({ labelDisplayAll: target.checked });
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleAllLabels(seriesUID, target.checked));
  };

  handleToggleAllAnnotations = ({ target }, e, id) => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleAllAnnotations(seriesUID, target.checked));
    window.dispatchEvent(
      new CustomEvent("toggleAnnotations", {
        detail: { isVisible: target.checked },
      })
    );
    this.setState({ annsDisplayAll: target.checked });
  };

  handleToggleSingleLabel = (e) => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
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
      const { openSeries, activePort } = this.props;
      const { imageID } = openSeries[activePort];
      let imageAnnotations;
      if (openSeries[activePort].imageAnnotations) {
        const annotations = openSeries[activePort].imageAnnotations;
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

  render = () => {
    // try {
    const { openSeries, aimsList } = this.props;
    let { activePort } = this.props;
    activePort = activePort || activePort === 0 ? activePort : 0;
    const { imageID } = openSeries[activePort];
    const seriesUID = openSeries[activePort].seriesUID;
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

    const aimList = openSeries[activePort].imageAnnotations;
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
    const calculations = this.getLabelArray();
    // annotations.sort(function(a, b) {
    //   let nameA = a.name.toUpperCase();
    //   let nameB = b.name.toUpperCase();
    //   if (nameA < nameB) {
    //     return -1;
    //   }
    //   if (nameA > nameB) {
    //     return 1;
    //   }
    //   return 0;
    // });

    // let annotations = [];
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
            onDelete={() => this.handleDelete(aim, openSeries[activePort])}
            serie={seriesUID}
            label={calculations[aim.id]}
            openSeriesAimID={openSeries[activePort].aimID}
          />
        );
      }
    });
    // } catch (e) {
    //   console.log("Error: ", e);
    // }
    return (
      <React.Fragment>
        <div className="annotationList-container" style={{ paddingTop: "5px" }}>
          <div className="checkbox-row">
            <div className="label-toggle">
              <div className="form-check form-switch form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="showAnnotations"
                  onChange={this.handleCalculations}
                  checked={this.state.showCalculations}
                />
                <label
                  className="form-check-label"
                  htmlFor="flexSwitchCheckDefault"
                >
                  Show Calculations
                </label>
              </div>
            </div>
            <div className="label-toggle">
              <div className="form-check form-switch form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="showAnnotations"
                  onChange={this.handleToggleAllLabels}
                  checked={this.state.labelDisplayAll}
                />
                <label
                  className="form-check-label"
                  htmlFor="flexSwitchCheckDefault"
                >
                  Show Details
                </label>
              </div>
            </div>
            <div className="label-toggle">
              <div className="form-check form-switch form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="showAnnotations"
                  onChange={this.handleToggleAllAnnotations}
                  checked={this.state.annsDisplayAll}
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
        </div>
        <div>{annList}</div>
        <AnnotationsLink imageAims={imageAims} />
      </React.Fragment>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList,
    imageID: state.annotationsListReducer.imageID,
    loading: state.annotationsListReducer.loading,
  };
};
export default connect(mapStateToProps)(AnnotationsList);
