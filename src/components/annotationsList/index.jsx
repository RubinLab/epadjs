import React from "react";
import { connect } from "react-redux";
import { BrowserRouter, withRouter } from "react-router-dom";
import Dropdown from "./containers/dropdown";
import Header from "./containers/header";
import List from "./containers/list";

class AnnotationsList extends React.Component {
  state = { displayedSeries: [] };

  componentDidMount = () => {
    let displayedSeries = [];
    const { series, activePort } = this.props;
    series[activePort].studies.forEach(element => {
      if (element.studyUID === series[activePort].studyUID) {
        displayedSeries = element["series"];
      }
    });
    this.setState({ displayedSeries });
  };

  handleStudyChange = () => {
    console.log("study changed");
  };

  render = () => {
    const { series, activePort, onClick } = this.props;
    //find the study in the studies array
    return (
      <div className="annList">
        <Header name={series[activePort].patientName} onClick={onClick} />
        <Dropdown
          display={series[activePort]}
          changeStudy={this.handleStudyChange}
        />
        <List series={this.state.displayedSeries} />
      </div>
    );
  };
}

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};
export default connect(mapStateToProps)(AnnotationsList);
