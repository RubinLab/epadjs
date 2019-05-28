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

  render = () => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    let annotations = Object.values(this.props.aimsList[seriesUID]);
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

    let annList = [];
    annotations.forEach((aim, index) => {
      let aimInfo = aim.json.imageAnnotations.ImageAnnotation;
      let id = aim.json.uniqueIdentifier.root;
      annList.push(
        <Annotation
          name={aim.name}
          style={aim.color}
          aim={aimInfo}
          id={id}
          key={id}
          displayed={aim.isDisplayed}
          onClick={this.handleDisplayClick}
          user={aim.json.user.name.value}
          showLabel={aim.showLabel}
          onSingleToggle={this.handleToggleSingleLabel}
          jumpToAim={this.handleJumToAim}
          serie={seriesUID}
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
              className="react-switch"
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </div>
          <div className="label-toggle">
            <div className="label-toggle__text">Show Annotations</div>
            <Switch
              onChange={this.handleToggleAllAnnotations}
              checked={this.state.annsDisplayAll}
              className="react-switch"
              uncheckedIcon={false}
              checkedIcon={false}
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
