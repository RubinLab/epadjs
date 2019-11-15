import React from "react";
import { connect } from "react-redux";
import { Rnd } from "react-rnd";
import Dropdown from "./containers/dropdown";
import Header from "./containers/header";
import List from "./containers/list";
import { showAnnotationWindow } from "../annotationsList/action";

//make it only drable not resiable

class AnnotationsList extends React.Component {
  constructor(props) {
    super(props);
    this.openSeries = this.props.openSeries;
    this.activePort = this.props.activePort;
    this.patients = this.props.patients;
    this.patient = this.patients[this.openSeries[this.activePort].patientID];
    this.state = {
      width: "215px",
      x: 100,
      y: 75,
      selectedStudy: "",
      serieList: []
    };
  }
  componentDidMount = () => {
    const icon = document.getElementsByClassName("patient-icon")[0];
    let x = Math.ceil(icon.getBoundingClientRect().left);
    let y = Math.ceil(icon.getBoundingClientRect().bottom);
    x = x - 200;
    // y = window.innerWidth <= 932 ? (y = y * 2) : y * 1.5;

    this.setState({ x, y });

    const selectedStudy = this.openSeries[this.activePort].studyUID;
    this.setState({ selectedStudy });

    const serieList = Object.values(this.patient.studies[selectedStudy].series);
    this.setState({ serieList });
  };

  componentDidUpdate = prevProps => {
    const { patientID, studyUID, seriesUID } = this.openSeries[this.activePort];
    if (this.props.openSeries.length !== prevProps.openSeries.length) {
      const selectedStudy = this.props.openSeries[this.props.activePort]
        .studyUID;
      this.setState({ selectedStudy });

      const serieList = Object.values(
        this.props.patients[patientID].studies[selectedStudy].series
      );
      this.setState({ serieList });
    }
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
    const style = {
      minWidth: "215px",
      maxWidth: "30%",
      maxHeight: "100%"
    };
    return (
      <Rnd
        id="annList-modal"
        style={style}
        size={{ width: this.state.width, height: this.state.height }}
        position={{ x: this.state.x, y: this.state.y }}
        onDragStop={(e, d) => {
          this.setState({ x: d.x, y: d.y });
        }}
        onResize={(e, direction, ref, delta, position) => {
          this.setState({
            width: ref.style.width,
            height: ref.style.height,
            ...position
          });
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
