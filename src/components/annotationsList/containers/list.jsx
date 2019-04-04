import React from "react";
import { connect } from "react-redux";
import ListItem from "./listItem";

const list = ({ series, activePort }) => {
  const seriesMenu = [];
  let displayedSeries;
  const studiesArr = Object.values(series[activePort].studies);

  // console.log("series actieveport", series[activePort]);
  studiesArr.forEach(element => {
    // console.log(element.studyUID, series[activePort].studyUID);
    if (element.studyUID === series[activePort].studyUID) {
      displayedSeries = Object.values(element["series"]);
    }
  });
  // console.log(displayedSeries);

  displayedSeries.forEach(serie => {
    seriesMenu.push(
      <ListItem
        serie={serie}
        // activeSerie={series[activePort]}
        key={serie.seriesUID}
      />
    );
  });
  return <div>{seriesMenu}</div>;
};

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};

export default connect(mapStateToProps)(list);
