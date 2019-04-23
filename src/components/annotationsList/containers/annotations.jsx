import React from "react";
import { connect } from "react-redux";
import Toggle from "react-toggle";
import Switch from "react-switch";

const annotations = ({
  seriesUID,
  studyUID,
  patient,
  handleCheck,
  patients,
  showAnns,
  onToggleSerie
}) => {
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
  return annotationsArr.length === 0 ? (
    <div className="annList-annotations">There is no annotation</div>
  ) : (
    <div>
      <div className="annotations-collapse">
        <div className="-collapse-toggles">
          <label className="-collapse-toggle">
            <span>Show Annotations</span>
            <div>
              <Switch
                checked={showAnns}
                onChange={onToggleSerie}
                data-seriesid={seriesUID}
                id={seriesUID}
                onColor="#86d3ff"
                onHandleColor="#007bff"
                handleDiameter={25}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={15}
                width={40}
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
