import React from "react";
import { connect } from "react-redux";
import Switch from "react-switch";
import Annotation from "./annotation";
import AnnotationsLink from "./annotationsLink";
import {
  updateAnnotationDisplay,
  toggleAllLabels,
  toggleSingleLabel,
  toggleAllAnnotations,
} from "../action";

class AnnotationsList extends React.Component {
  state = {
    labelDisplayAll: true,
    annsDisplayAll: true,
  };

  componentDidUpdate = prevProps => {
    try {
      const series = Object.keys(this.props.aimsList);
      if (
        (this.props.activePort !== prevProps.activePort &&
          !this.props.loading) ||
        (!this.props.loading &&
          prevProps.loading &&
          series.length === this.props.openSeries.length)
      ) {
        const seriesUID = this.props.openSeries[this.props.activePort]
          .seriesUID;
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

  handleDisplayClick = e => {
    const { seriesUID, patientID, studyUID } = this.props.openSeries[
      this.props.activePort
    ];
    const aimID = e.target.id;
    if (aimID) {
      const currentDisplayStatus = this.props.aimsList[seriesUID][aimID]
        .isDisplayed;
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

  handleToggleAllLabels = (checked, e, id) => {
    this.setState({ labelDisplayAll: checked });
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleAllLabels(seriesUID, checked));
  };

  handleToggleAllAnnotations = (checked, e, id) => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleAllAnnotations(seriesUID, checked));
    window.dispatchEvent(
      new CustomEvent("toggleAnnotations", { detail: { isVisible: checked } })
    );
    this.setState({ annsDisplayAll: checked });
  };

  handleToggleSingleLabel = e => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleSingleLabel(seriesUID, e.target.dataset.id));
  };

  handleEdit = (aimID, seriesUID) => {
    window.dispatchEvent(
      new CustomEvent("editAim", { detail: { aimID, seriesUID } })
    );
  };

  getLabelArray = () => {
    const { openSeries, activePort } = this.props;
    const { imageID } = this.props.openSeries[this.props.activePort];
    let imageAnnotations;
    if (this.props.openSeries[this.props.activePort].imageAnnotations) {
      imageAnnotations = this.props.openSeries[this.props.activePort]
        .imageAnnotations[imageID];
      if (!imageAnnotations)
        imageAnnotations =
          openSeries[activePort].imageAnnotations[imageID + "&frame=1"];
    }
    const calculations = {};
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
            calculations: [...aim.calculations],
            markupType: aim.markupType,
          };
          // calculations[aim.markupUid].push({ markupType: aim.markupType });
        }
      }
    }
    return calculations;
  };

  render = () => {
    const { openSeries, activePort, aimsList } = this.props;
    const { imageID } = openSeries[activePort];
    const maxHeight = window.innerHeight * 0.6;
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

    if (openSeries[activePort].imageAnnotations) {
      let imageAnnotations;
      const singleFrameAnnotations =
        openSeries[activePort].imageAnnotations[imageID];
      const multiFrameAnnotations =
        openSeries[activePort].imageAnnotations[imageID + "&frame=1"];
      const noMarkupAnnotations =
        openSeries[activePort].imageAnnotations[imageID + "-img"];
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
        for (let aim of imageAnnotations) {
          let { aimUid } = aim;
          annotations[aimUid]
            ? annotations[aimUid].push(aimsList[seriesUID][aim.aimUid])
            : (annotations[aimUid] = [aimsList[seriesUID][aim.aimUid]]);
        }
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
          serie={seriesUID}
          label={calculations[aim.id]}
          openSeriesAimID={openSeries[activePort].aimID}
        />
      );
    });
    return (
      <React.Fragment>
        <div className="annotationList-container">
          <div className="label-toggle">
            <div className="label-toggle__text">Show All Labels</div>
            <Switch
              onChange={this.handleToggleAllLabels}
              checked={this.state.labelDisplayAll}
              onColor="#86d3ff"
              onHandleColor="#1986d9"
              handleDiameter={22}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={15}
              width={36}
              className="react-switch"
            />
          </div>
          <div className="label-toggle">
            <div className="label-toggle__text">Show All Annotations</div>
            <Switch
              onChange={this.handleToggleAllAnnotations}
              checked={this.state.annsDisplayAll}
              onColor="#86d3ff"
              onHandleColor="#1986d9"
              handleDiameter={22}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={15}
              width={36}
              className="react-switch"
            />
          </div>
          <div style={{ maxHeight, overflow: "scroll" }}>{annList}</div>
          <AnnotationsLink
            imageAims={imageAims}
          />
        </div>
      </React.Fragment>
    );
  };
}

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList,
    imageID: state.annotationsListReducer.imageID,
    loading: state.annotationsListReducer.loading,
  };
};
export default connect(mapStateToProps)(AnnotationsList);
