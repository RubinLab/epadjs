import React from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";

const annotations = ({
  seriesUID,
  studyUID,
  patient,
  handleClick,
  patients,
  onToggleSerie
}) => {
  let annotationsList = [];
  const annotationsArr = Object.values(
    patients[patient].studies[studyUID].series[seriesUID].annotations
  );
  annotationsArr.forEach(ann => {
    // console.log("ann in lop", ann);
    let item = (
      <div className="-annotation__container" key={ann.aimID}>
        <Button
          variant="outline-dark"
          className="-annotation__title"
          data-seriesid={ann.seriesUID}
          data-aimid={ann.aimID}
          onClick={handleClick}
        >
          {ann.name}
        </Button>
      </div>
    );
    annotationsList.push(item);
  });
  return annotationsArr.length === 0 ? (
    <div className="annList-annotations no-ann">There is no annotation</div>
  ) : (
    <div className="annList-annotations">{annotationsList}</div>
  );
};

const mapStateToProps = state => {
  return {
    patients: state.annotationsListReducer.patients
  };
};
export default connect(mapStateToProps)(annotations);
