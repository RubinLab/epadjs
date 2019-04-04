import React from "react";
import { connect } from "react-redux";
import { BrowserRouter, withRouter } from "react-router-dom";
import Dropdown from "./containers/dropdown";
import Header from "./containers/header";
import List from "./containers/list";

class AnnotationsList extends React.Component {
  state = { selectedStudy: "" };

  componentDidMount = () => {
    const { openSeries, activePort, patients } = this.props;
    const patient = openSeries[activePort].patientID;
    const studiesArr = patients[patient].studies;
    this.setState({ selectedStudy: openSeries[activePort].studyUID });
  };

  handleStudyChange = e => {
    console.log("study changed", e.target.value);
    this.setState({ selectedStudy: e.target.value });
  };

  render = () => {
    const { openSeries, activePort, onClick, patients } = this.props;
    const patient = patients[openSeries[activePort].patientID];
    //find the study in the studies array
    return (
      <div className="annList">
        <Header name={patient.patientName} onClick={onClick} />
        <Dropdown
          display={patient.studies}
          selectedStudy={this.state.selectedStudy}
          changeStudy={this.handleStudyChange}
        />
        {/* <List /> */}
      </div>
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
