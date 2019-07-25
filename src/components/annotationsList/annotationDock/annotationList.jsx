import React from "react";
import { connect } from "react-redux";
import Toggle from "react-toggle";
import Switch from "react-switch";

import Annotation from "./annotation";
import {
  updateAnnotationDisplay,
  toggleAllLabels,
  toggleSingleLabel,
  toggleAllAnnotations,
  jumpToAim
} from "../action";

class AnnotationsList extends React.Component {
  state = {
    labelDisplayAll: false,
    annsDisplayAll: true
  };

  componentDidUpdate = prevProps => {
    if (this.props.activePort !== prevProps.activePort) {
      const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
      let annotations = Object.values(this.props.aimsList[seriesUID]);
      let labelDisplayAll = false;
      let annsDisplayAll = false;
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
    }
  };

  handleToggleAllLabels = (checked, e, id) => {
    this.setState({ labelDisplayAll: checked });
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleAllLabels(seriesUID, checked));
  };

  handleToggleAllAnnotations = (checked, e, id) => {
    this.setState({ annsDisplayAll: checked });
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleAllAnnotations(seriesUID, checked));
  };

  handleToggleSingleLabel = e => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    this.props.dispatch(toggleSingleLabel(seriesUID, e.target.dataset.id));
  };

  handleJumToAim = e => {
    const { id, serie } = e.target.dataset;
    this.props.dispatch(jumpToAim(serie, id, this.props.activePort));
  };

  getLabelArray = () => {
    let imageAnnotations;
    if (this.props.openSeries[this.props.activePort].imageAnnotations) {
      imageAnnotations = this.props.openSeries[this.props.activePort]
        .imageAnnotations[this.props.imageID];
    }
    const calculations = {};
    if (imageAnnotations) {
      for (let aim of imageAnnotations) {
        calculations[aim.aimUid]
          ? calculations[aim.aimUid].push(aim.calculations)
          : (calculations[aim.aimUid] = [aim.calculations]);
      }
    }
    console.log();
    return calculations;
  };

  render = () => {
    const maxHeight = window.innerHeight * 0.6;
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    let annotations = {};
    let aims = this.props.aimsList[seriesUID];
    for (let aim in aims) {
      if (aims[aim].type === "study" || aims[aim].type === "serie") {
        let { id } = aims[aim];
        annotations[id]
          ? annotations[id].push(aims[aim])
          : (annotations[id] = [aims[aim]]);
      }
    }
    let imageAnnotations;
    if (this.props.openSeries[this.props.activePort].imageAnnotations) {
      imageAnnotations = this.props.openSeries[this.props.activePort]
        .imageAnnotations[this.props.imageID];
      // console.log("one step before");
      // console.log(
      //   this.props.openSeries[this.props.activePort].imageAnnotations
      // );
      // console.log(this.props.imageID);
      // console.log(
      //   this.props.openSeries[this.props.activePort].imageAnnotations[
      //     this.props.imageID
      //   ]
      // );
      if (imageAnnotations) {
        console.log(imageAnnotations);
        for (let aim of imageAnnotations) {
          let { aimUid } = aim;
          annotations[aimUid]
            ? annotations[aimUid].push(
                this.props.aimsList[seriesUID][aim.aimUid]
              )
            : (annotations[aimUid] = [
                this.props.aimsList[seriesUID][aim.aimUid]
              ]);
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
    annotations = Object.values(annotations);
    annotations.forEach((aim, index) => {
      console.log("aim in foreach", aim);
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
          jumpToAim={this.handleJumToAim}
          serie={seriesUID}
          label={calculations[aim.id]}
        />
      );
    });
    return (
      <React.Fragment>
        <div className="annotationList-container">
          <div className="label-toggle">
            <div className="label-toggle__text">Show Labels</div>
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
            <div className="label-toggle__text">Show Annotations</div>
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
        </div>
      </React.Fragment>
    );
  };
}

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList
  };
};
export default connect(mapStateToProps)(AnnotationsList);
