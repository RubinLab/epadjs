import React from "react";
import { connect } from "react-redux";
import { BrowserRouter, withRouter } from "react-router-dom";
import Dropdown from "./containers/dropdown";
import Header from "./containers/header";

class AnnotationsList extends React.Component {
  render = () => {
    const { series, activePort, onClick } = this.props;
    return (
      <div className="annList">
        <Header name={series[activePort].patientName} onClick={onClick} />
        <Dropdown display={series[activePort]} />
      </div>
    );
  };
}

const mapStateToProps = state => {
  console.log("mapState", state);
  return {
    series: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};
export default connect(mapStateToProps)(AnnotationsList);
