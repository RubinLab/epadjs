import React from "react";
import { connect } from "react-redux";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MAX_PORT } from "../../../constants";
import Annotations from "./annotations";
import {
  updateAnnotation,
  toggleAllAnnotations,
  changeActivePort,
  getAnnotationListData,
  getSingleSerie,
  alertViewPortFull,
  addToGrid,
  updatePatient
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
      collapseAnnList: this.checkIfSerieOpen(this.props.serie.seriesUID).isOpen,
      displayAnnotations: this.props.serie.isDisplayed,
      displayLabels: this.props.serie.isLabelDisplayed
    });
  };

  handleCollapse = () => {
    this.setState(state => ({ collapseAnnList: !state.collapseAnnList }));
  };

  checkIfSerieOpen = selectedSerie => {
    let isOpen = false;
    let index;
    this.props.openSeries.forEach((serie, i) => {
      if (serie.seriesUID === selectedSerie) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  handleAnnotationClick = async e => {
    const { seriesUID, studyUID, patientID } = this.props.serie;
    const { value, checked } = e.target;
    const { seriesid } = e.target.dataset;
    //check if the current serie match, if matches update the annotation
    const activeSeriesUID = this.props.openSeries[this.props.activePort]
      .seriesUID;
    if (activeSeriesUID === seriesid) {
      this.props.dispatch(
        updateAnnotation(seriesUID, studyUID, patientID, value, checked)
      );
    } else {
      //if doesn't match check if the serie exists in the open series
      const isOpen = this.checkIfSerieOpen(seriesid).isOpen;
      const index = this.checkIfSerieOpen(seriesid).index;
      if (isOpen) {
        // if it exists in the openSeries update activeport
        this.props.dispatch(changeActivePort(index));
        //update the status of the clicked annotation
        this.props.dispatch(
          updateAnnotation(seriesUID, studyUID, patientID, value, checked)
        );
      } else {
        //else get single serie dispatch action
        if (this.props.openSeries.length === MAX_PORT) {
          this.props.dispatch(alertViewPortFull());
        } else {
          await this.props.dispatch(getSingleSerie(this.props.serie, value));
          this.props.dispatch(
            updateAnnotation(seriesUID, studyUID, patientID, value, checked)
          );
        }
      }
    }
  };

  handleToggleSerie = async (checked, e, id) => {
    //select de select all anotations
    // console.log("check attributes", this.props.serie);
    const { projectID, patientID, studyUID, seriesUID } = this.props.serie;
    const { seriesid } = e.target.dataset;
    const activeSeriesUID = this.props.openSeries[this.props.activePort]
      .seriesUID;
    //check if user toggle on or off and change the state accordingly
    await this.setState({ displayAnnotations: checked });
    // if checked true
    const isOpen = this.checkIfSerieOpen(seriesUID).isOpen;
    const index = this.checkIfSerieOpen(seriesUID).index;
    console.log(seriesUID);
    console.log(this.checkIfSerieOpen(seriesUID));

    if (checked) {
      //check if the serie is already open
      //if open
      if (isOpen) {
        //update the active port
        this.props.dispatch(changeActivePort(index));
        // change the annotations as displayed in patient and aimlist
        this.props.dispatch(
          updatePatient("serie", checked, patientID, studyUID, seriesUID)
        );
        this.props.dispatch(toggleAllAnnotations(seriesUID, checked));
        //else - if not open
      } else {
        //check if the grid is full
        if (this.props.openSeries.length === MAX_PORT) {
          //if full bring modal
          this.props.dispatch(alertViewPortFull());
          //else - not full
        } else {
          //addtogrid
          this.props.dispatch(addToGrid(this.props.serie));
          //getsingleserie
          this.props.dispatch(getSingleSerie(this.props.serie));
          //update patient?? with serie
          this.props.dispatch(
            updatePatient("serie", checked, patientID, studyUID, seriesUID)
          );
        }
      }
      // if checked false
    } else {
      //update patients and aimlist just annotations to be false
      this.props.dispatch(
        updatePatient("serie", checked, patientID, studyUID, seriesUID)
      );
      this.props.dispatch(toggleAllAnnotations(seriesUID, checked));
      if (isOpen) {
        this.props.dispatch(changeActivePort(index));
      }
    }
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
