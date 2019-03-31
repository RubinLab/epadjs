import React from "react";
import { connect } from "react-redux";
import ListItem from "./listItem";

const list = ({ series, activePort }) => {
  const seriesMenu = [];
  let displayedSeries;
  const studiesArr = Object.values(series[activePort].studies);
  studiesArr.forEach(element => {
    if (element.studyUID === series[activePort].studyUID) {
      displayedSeries = Object.values(element["series"]);
    }
  });
  displayedSeries.forEach(serie => {
    seriesMenu.push(<ListItem serie={serie} key={serie.seriesUID} />);
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
