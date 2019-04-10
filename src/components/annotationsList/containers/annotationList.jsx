import React from "react";
import { connect } from "react-redux";
import Annotation from "./annotation";
import { updateAnnotation } from "../action";

class annotationsList extends React.Component {
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

  render = () => {
    const seriesUID = this.props.openSeries[this.props.activePort].seriesUID;
    const annotations = Object.values(this.props.aimsList[seriesUID]);
    let annList = [];
    annotations.forEach(aim => {
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
        />
      );
    });
    return <div className="annotationList-container">{annList}</div>;
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
