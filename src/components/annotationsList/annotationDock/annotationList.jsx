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
    annotations.forEach((aim, index) => {
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
        />
      );
    });
    return (
      <div className="annotationList-container">
        <div className="label-toggle">
          <div className="label-toggle__text">Show Labels</div>
          <Toggle
            defaultChecked={this.state.labelDisplayAll}
            onChange={this.handleLabelClick}
            icons={false}
          />
        </div>
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
