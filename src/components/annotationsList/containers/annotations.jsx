import React from "react";
import { connect } from "react-redux";
import Toggle from "react-toggle";

const annotations = ({
  seriesUID,
  studyUID,
  patient,
  handleCheck,
  patients,
  showAnns,
  onToggleSerie,
  showLabels,
  onToggleLabels
}) => {
  // pass serie number from the parent
  // get whole  state
  // find the viewport where series numbers match
  // navigate down to annotation of the series
  // iterate over the annotations
  let annotationsList = [];
  const annotationsArr = Object.values(
    patients[patient].studies[studyUID].series[seriesUID].annotations
  );
  annotationsArr.forEach(ann => {
    let item = (
      <div className="-annotation__container" key={ann.aimID}>
        <div className="-annotation__checkbox">
          <input
            type="checkbox"
            name="aim"
            data-seriesid={ann.seriesUID}
            data-studyid={ann.studyUID}
            value={ann.aimID}
            onChange={handleCheck}
            checked={ann.isDisplayed}
          />
        </div>
        <span className="-annotation__title">{ann.name}</span>
      </div>
    );
    annotationsList.push(item);
  });
  console.log(seriesUID);
  return annotationsArr.length === 0 ? (
    <div className="annList-annotations">There is no annotation</div>
  ) : (
    <div>
      <div className="annotations-collapse">
        <div className="-collapse-toggles">
          <label className="-collapse-toggle">
            <span>Show Annotations</span>
            <div>
              <Toggle
                defaultChecked={showAnns}
                onClick={onToggleSerie}
                data-seriesid={seriesUID}
              />
            </div>
          </label>
          <label className="-collapse-toggle">
            <span>Show Labels</span>
            <div>
              <Toggle
                defaultChecked={showLabels}
                onClick={onToggleLabels}
                data-seriesid={seriesUID}
              />
            </div>
          </label>
        </div>
        <div className="annList-annotations">{annotationsList}</div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    patients: state.annotationsListReducer.patients
  };
};
export default connect(mapStateToProps)(annotations);
