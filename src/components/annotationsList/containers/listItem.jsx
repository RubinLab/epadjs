import React from "react";
import { connect } from "react-redux";
// import Collapse from "react-bootstrap/Collapse";
import { FaMinus, FaPlus } from "react-icons/fa";

import Annotations from "./annotations";
import {
  updateAnnotation,
  toggleAllAnnotations,
  changeActivePort,
  getAnnotationListData
} from "../action";

//single serie will be passed
class ListItem extends React.Component {
  state = { isSerieOpen: false, collapseAnnList: false };

  componentDidMount = () => {
    this.setState({
      isSerieOpen: this.props.selected,
      collapseAnnList: this.props.selected
    });
  };

  handleCollapse = () => {
    this.setState(state => ({ collapseAnnList: !state.collapseAnnList }));
  };

  handleAnnotationClick = e => {
    const { seriesUID, studyUID, patientID } = this.props.serie;
    const { value, checked } = e.target;
    this.props.dispatch(
      updateAnnotation(seriesUID, studyUID, patientID, value, checked)
    );
  };

  handleToggleSerie = e => {
    //select de select all anotations
    const { seriesUID, studyUID } = this.props.serie;
    //if isSerieOpen
    if (this.state.isSerieOpen) {
      this.props.dispatch(
        toggleAllAnnotations(seriesUID, studyUID, e.target.checked)
      );
      this.setState(state => ({ showAnnotations: !state.showAnnotations }));
    } else {
    }
    //dispatch yap ve o serie icin viewport ac openSeriese ekle
  };

  render = () => {
    const {
      seriesDescription,
      seriesUID,
      studyUID,
      patientID
    } = this.props.serie;
    let desc =
      seriesDescription.length === 0 ? "unnamed serie" : seriesDescription;
    return (
      <>
        <div className="-serieButton__container" onClick={this.handleCollapse}>
          <button className="annList-serieButton">
            {this.state.collapseAnnList ? (
              <FaMinus className="-serieButton__icon" />
            ) : (
              <FaPlus className="-serieButton__icon" />
            )}
            <span className="-serieButton__value">{desc}</span>
          </button>
        </div>
        {this.state.collapseAnnList && (
          <Annotations
            handleCheck={this.handleAnnotationClick}
            seriesUID={seriesUID}
            studyUID={studyUID}
            patient={patientID}
          />
        )}
      </>
    );
  };
}

export default connect()(ListItem);
