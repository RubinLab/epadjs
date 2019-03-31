import React from "react";
import { connect } from "react-redux";

// const annotations = ({ seriesUID, annotations, handleCheck }) => {
//pass serie number from the parent
//get whole  state
//find the viewport where series numbers match
//navigate down to annotation of the series
//iterate over the annotations
// console.log("props here", seriesUID, annotations, handleCheck);
// let annotationsList = [];
// const annotationsArr = Object.values(annotations);
// annotationsArr.forEach(ann => {
//   let item = (
//     <div className="-annotation__container" key={ann.aimID}>
//       <div className="-annotation__checkbox">
//         <input
//           type="checkbox"
//           name="aim"
//           value={ann.aimID}
//           onChange={handleCheck}
//           checked={ann.isDisplayed}
//         />
//       </div>
//       <span className="-annotation__title">{ann.name}</span>
//     </div>
//   );
//   annotationsList.push(item);
// });
// return <div className="annList-annotations">{annotationsList}</div>;
const annotations = props => {
  const { series, activePort } = props;
  let annotationsList = [];
  const { seriesUID, studyUID } = series[activePort];
  let annotationsFromProps =
    series[activePort]["studies"][studyUID]["series"][seriesUID]["annotations"];
  const annotationsArr = Object.values(annotationsFromProps);
  annotationsArr.forEach(ann => {
    let item = (
      <div className="-annotation__container" key={ann.aimID}>
        <div className="-annotation__checkbox">
          <input
            type="checkbox"
            name="aim"
            value={ann.aimID}
            onChange={props.handleCheck}
            checked={ann.isDisplayed}
          />
        </div>
        <span className="-annotation__title">{ann.name}</span>
      </div>
    );
    annotationsList.push(item);
  });
  return <div className="annList-annotations">{annotationsList}</div>;
};

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};

export default connect(mapStateToProps)(annotations);
