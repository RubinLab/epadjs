import React from "react";
import { connect } from "react-redux";
// import Collapse from "react-bootstrap/Collapse";
import { FaMinus, FaPlus } from "react-icons/fa";
import Switch from "react-toggle-switch";

import Annotations from "./annotations";
import {
  updateAnnotation,
  toggleAllAnnotations,
  toggleAllLabels,
  changeActivePort,
  getAnnotationListData,
  getSingleSerie
} from "../action";

//single serie will be passed
class ListItem extends React.Component {
  state = {
    isSerieOpen: false,
    collapseAnnList: false,
    displayAnnotations: false,
    displayLabels: false
  };

  componentDidMount = () => {
    this.setState({
      isSerieOpen: this.props.selected,
      collapseAnnList: this.props.selected,
      displayAnnotations: this.props.selected,
      displayLabels: this.props.selected
    });
  };

  handleCollapse = () => {
    this.setState(state => ({ collapseAnnList: !state.collapseAnnList }));
  };

  handleAnnotationClick = async e => {
    const { seriesUID, studyUID, patientID } = this.props.serie;
    const { value, checked } = e.target;
    const { seriesid } = e.target.dataset;
    //check if the current serie match, if matches update the annotation
    const openSeriesUID = this.props.openSeries[this.props.activePort]
      .seriesUID;
    if (openSeriesUID === seriesid) {
      this.props.dispatch(
        updateAnnotation(seriesUID, studyUID, patientID, value, checked)
      );
    } else {
      //if doesn't match check if the serie exists in the open series
      let isOpen = false;
      let index;
      this.props.openSeries.forEach((serie, i) => {
        if (serie.seriesUID === seriesid) {
          isOpen = true;
          index = i;
        }
      });
      if (isOpen) {
        // if it exists in the openSeries update activeport
        this.props.dispatch(changeActivePort(index));
        //update the status of the clicked annotation
        this.props.dispatch(
          updateAnnotation(seriesUID, studyUID, patientID, value, checked)
        );
      } else {
        //else get single serie dispatch action
        await this.props.dispatch(getSingleSerie(this.props.serie, value));
        this.props.dispatch(
          updateAnnotation(seriesUID, studyUID, patientID, value, checked)
        );
      }
    }
  };

  handleToggleSerie = e => {
    //select de select all anotations
    const { seriesUID, studyUID } = this.props.serie;
    //if isSerieOpen
    if (this.state.isSerieOpen) {
      this.props.dispatch(
        toggleAllAnnotations(seriesUID, studyUID, e.target.checked)
      );
      this.setState(state => ({
        displayAnnotations: !state.displayAnnotations
      }));
    } else {
    }
    //dispatch yap ve o serie icin viewport ac openSeriese ekle
  };

  handleToggleLabels = e => {
    //select de select all anotations
    const { seriesUID, studyUID } = this.props.serie;
    //if isSerieOpen
    if (this.state.isSerieOpen) {
      this.props.dispatch(
        toggleAllLabels(seriesUID, studyUID, e.target.checked)
      );
      this.setState(state => ({
        displayLabels: !state.displayLabels
      }));
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

    const numOfAnn = this.props.serie.annotations
      ? Object.values(this.props.serie.annotations).length
      : 0;
    console.log(this.state.displayAnnotations);
    return (
      <>
        <div className="-serieButton__container" onClick={this.handleCollapse}>
          <button className="annList-serieButton">
            {this.state.collapseAnnList ? (
              <FaMinus className="-serieButton__icon" />
            ) : (
              <FaPlus className="-serieButton__icon" />
            )}
            <span className="-serieButton__value">
              {desc} - ({numOfAnn})
            </span>
          </button>
        </div>
        {this.state.collapseAnnList && (
          <Annotations
            handleCheck={this.handleAnnotationClick}
            seriesUID={seriesUID}
            studyUID={studyUID}
            patient={patientID}
            showAnns={this.state.displayAnnotations}
            onToggleSerie={this.handleToggleSerie}
            showLabels={this.state.displayLabels}
            onToggleLabels={this.handleToggleLabels}
          />
        )}
      </>
    );
  };
}
const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort
  };
};
export default connect(mapStateToProps)(ListItem);

{
  /* <label>
  <span>Switch with default style</span>
  <Switch onChange={this.handleChange} checked={this.state.checked} />
</label>; */
}
