import React from "react";
import { connect } from "react-redux";
import { BrowserRouter, withRouter } from "react-router-dom";
import { Rnd } from "react-rnd";
import Dropdown from "./containers/dropdown";
import Header from "./containers/header";
import List from "./containers/list";
import CustomModal from "../management/common/resizeAndDrag";

class AnnotationsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedStudy: "", serieList: [] };
    this.openSeries = this.props.openSeries;
    this.activePort = this.props.activePort;
    this.patients = this.props.patients;
    console.log(this.patients);
    console.log(this.props.openSeries[this.props.activePort]);
    console.log(this.props.openSeries[this.props.activePort].patientID);
    this.patient = this.patients[this.openSeries[this.activePort].patientID];
  }
  componentDidMount = () => {
    const selectedStudy = this.openSeries[this.activePort].studyUID;
    this.setState({ selectedStudy });

    const serieList = Object.values(this.patient.studies[selectedStudy].series);
    this.setState({ serieList });
  };

  handleStudyChange = e => {
    const newSerieList = Object.values(
      this.patient.studies[e.target.value].series
    );
    this.setState({ selectedStudy: e.target.value, serieList: newSerieList });
  };

  render = () => {
    const selectedSerie = this.openSeries[this.activePort].seriesUID;
    //find the study in the studies array
    return (
      <Rnd id="annList-modal">
        <div className="annList">
          <Header
            name={this.patient.patientName}
            onClick={this.props.onClick}
          />
          <Dropdown
            display={this.patient.studies}
            selectedStudy={this.state.selectedStudy}
            changeStudy={this.handleStudyChange}
          />
          <List series={this.state.serieList} selectedSerie={selectedSerie} />
        </div>
      </Rnd>
    );
  };
}

const mapStateToProps = state => {
  const { openSeries, activePort, patients } = state.annotationsListReducer;
  return {
    openSeries,
    activePort,
    patients
  };
};
export default connect(mapStateToProps)(AnnotationsList);
