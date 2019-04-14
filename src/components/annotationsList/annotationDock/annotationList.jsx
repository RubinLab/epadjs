import React from "react";
import { connect } from "react-redux";
import Toggle from "react-toggle";
import Annotation from "./annotation";
import { updateAnnotation } from "../action";

class annotationsList extends React.Component {
  state = {
    labelDisplayAll: true
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
        updateAnnotation(
          seriesUID,
          studyUID,
          patientID,
          aimID,
          !currentDisplayStatus
        )
      );
    }
  };

  handleLabelClick = () => {
    this.setState(state => ({ labelDisplayAll: !state.labelDisplayAll }));
  };

  render = () => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    let annotations = Object.values(this.props.aimsList[seriesUID]);
    let annList = [];
    // //annotations.forEach(aim => {
    // while (annotations.length < 20) {
    //   annotations = annotations.concat(annotations);
    // }
    annotations.forEach((aim, index) => {
      console.log(aim);
      let aimInfo = aim.json.imageAnnotations.ImageAnnotation;
      let id = aim.json.uniqueIdentifier.root;
      annList.push(
        <Annotation
          style={aim.color}
          aim={aimInfo}
          id={id}
          key={id}
          displayed={aim.isDisplayed}
          onClick={this.handleDisplayClick}
          user={aim.json.user.name.value}
          showLabel={this.state.labelDisplayAll}
          // onLabelClick={this.handleLabelClick}
        />
      );
    });
    return (
      <div className="annotationList-container">
        <label>
          <span>{this.state.labelDisplayAll ? "Hide" : "Show"} Labels</span>
          <Toggle
            defaultChecked={this.state.labelDisplayAll}
            onChange={this.handleLabelClick}
          />
        </label>
        <div>{annList}</div>
      </div>
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
export default connect(mapStateToProps)(annotationsList);
