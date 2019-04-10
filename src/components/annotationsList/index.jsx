import React from "react";
import { connect } from "react-redux";
import { BrowserRouter, withRouter } from "react-router-dom";
import { Rnd } from "react-rnd";
import Dropdown from "./containers/dropdown";
import Header from "./containers/header";
import List from "./containers/list";
import CustomModal from "../management/common/resizeAndDrag";
import { showAnnotationWindow } from "../annotationsList/action";

const style = {
  left: "70%",
  maxWidth: "30%",
  maxHeight: "100%"
  // color: "red"
};

class AnnotationsList extends React.Component {
  constructor(props) {
    super(props);
    this.openSeries = this.props.openSeries;
    this.activePort = this.props.activePort;
    this.patients = this.props.patients;
    this.patient = this.patients[this.openSeries[this.activePort].patientID];
    this.state = {
      width: "20%",
      x: 1000,
      y: 50,
      selectedStudy: "",
      serieList: []
    };
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

  handleAnnotationListClick = async () => {
    this.props.dispatch(showAnnotationWindow());
  };

  render = () => {
    const selectedSerie = this.openSeries[this.activePort].seriesUID;
    //find the study in the studies array
    return (
      <Rnd
        id="annList-modal"
        style={style}
        size={{ width: this.state.width, height: this.state.height }}
        position={{ x: this.state.x, y: this.state.y }}
        onDragStop={(e, d) => {
          this.setState({ x: d.x, y: d.y });
        }}
      >
        <div className="annList">
          <Header
            name={this.patient.patientName}
            onClick={this.handleAnnotationListClick}
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
