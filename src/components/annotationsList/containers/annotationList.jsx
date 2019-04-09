import React from "react";
import { connect } from "react-redux";
import Annotation from "./annotation";

const annotationsList = props => {
  const seriesUID = props.openSeries[props.activePort].seriesUID;
  const annotations = Object.values(props.aimsList[seriesUID]);
  let annList = [];
  annotations.forEach(aim => {
    let aimInfo = aim.json.imageAnnotations.ImageAnnotation;
    let id = aim.json.uniqueIdentifier.root;
    console.log(aim.color);
    annList.push(
      <Annotation style={aim.color} aim={aimInfo} id={id} key={id} />
    );
  });
  return (
    <div className="annotationList-container">
      <div>{annList}</div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList
  };
};
export default connect(mapStateToProps)(annotationsList);
