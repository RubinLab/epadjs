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
    labelDisplayAll: true,
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
    const imageAnnotations = this.props.openSeries[this.props.activePort]
      .imageAnnotations[this.props.imageID];
    const calculations = {};
    console.log(this.props.imageID);
    console.log(imageAnnotations);
    if (imageAnnotations) {
      for (let aim of imageAnnotations) {
        calculations[aim.aimUid] = aim.calculations;
      }
    }
    return calculations;
  };

  render = () => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    // console.log(annotations);
    let annotations = Object.values(this.props.aimsList[seriesUID]);
    const calculations = this.getLabelArray();
    console.log(calculations);
    // console.log(annotations);
    annotations.sort(function(a, b) {
      let nameA = a.name.toUpperCase();
      let nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    // let annotations = [];
    let annList = [];
    annotations.forEach((aim, index) => {
      // console.log(aim);
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
          <div>{annList}</div>
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
