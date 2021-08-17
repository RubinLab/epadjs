import React from "react";
import { connect } from "react-redux";
import { FaMinus, FaPlus, FaEye, FaCheck } from "react-icons/fa";
import Annotations from "./annotations";
import {
  updateAnnotationDisplay,
  toggleAllAnnotations,
  changeActivePort,
  showAnnotationWindow,
  getSingleSerie,
  alertViewPortFull,
  addToGrid,
  updatePatient,
  jumpToAim,
  showAnnotationDock
} from "../action";

const MAX_PORT = sessionStorage.getItem("MAX_PORT");

//single serie will be passed
class ListItem extends React.Component {
  state = {
    isSerieOpen: false,
    collapseAnnList: false,
    displayAnnotations: false,
    displayLabels: false
  };

  componentDidMount = () => {
    const { patientID, studyUID, seriesUID } = this.props.serie;
    this.setState({
      isSerieOpen: this.props.patients[patientID].studies[studyUID].series[
        seriesUID
      ].isDisplayed,
      collapseAnnList: this.checkIfSerieOpen(this.props.serie.seriesUID).isOpen,
      displayAnnotations: this.props.serie.isDisplayed,
      displayLabels: this.props.serie.isLabelDisplayed
    });
  };

  componentDidUpdate = prevProps => {
    if (prevProps.activePort !== this.props.activePort) {
      const { patientID, studyUID, seriesUID } = this.props.serie;
      const collapseAnnList = this.checkIfSerieOpen(seriesUID).isOpen;
      const currentStatus = this.props.patients[patientID].studies[studyUID]
        .series[seriesUID].isDisplayed;
      this.setState({ isSerieOpen: currentStatus, collapseAnnList });
    }
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

  openSerie = async e => {
    const { patientID, studyUID, seriesUID } = this.props.serie;
    const openSeries = Object.values(this.props.openSeries);
    let serieCheck = this.checkIfSerieOpen(this.props.serie);
    //check if there is enough space in the grid
    let isGridFull = openSeries.length === MAX_PORT;
    //check if the serie is already open
    if (serieCheck.isOpen) {
      this.props.dispatch(changeActivePort(serieCheck.index));
    }
    if (!serieCheck.isOpen) {
      if (isGridFull) {
        this.props.dispatch(alertViewPortFull());
      } else {
        this.props.dispatch(addToGrid(this.props.serie));
        this.props
          .dispatch(getSingleSerie(this.props.serie))
          .then(() => { })
          .catch(err => console.log(err));
        this.props.dispatch(
          updatePatient("serie", true, patientID, studyUID, seriesUID)
        );
      }
    }
  };

  handleAnnotationClick = async e => {
    const { seriesUID, studyUID, patientID } = this.props.serie;
    const { seriesid, aimid } = e.target.dataset;
    const activeSeriesUID = this.props.openSeries[this.props.activePort]
      .seriesUID;
    if (activeSeriesUID === seriesid) {
      // this.checkIfSerieOpen(seriesid).index;
      this.props.dispatch(jumpToAim(seriesid, aimid, this.props.activePort));
    } else {
      //if doesn't match check if the serie exists in the open series
      const isOpen = this.checkIfSerieOpen(seriesid).isOpen;
      const index = this.checkIfSerieOpen(seriesid).index;
      if (isOpen) {
        // if it exists in the openSeries update activeport
        this.props.dispatch(changeActivePort(index));
        //update the status of the clicked annotation
        this.props.dispatch(jumpToAim(seriesid, aimid, index));
      } else {
        //else get single serie dispatch action
        if (this.props.openSeries.length === MAX_PORT) {
          this.props.dispatch(alertViewPortFull());
        } else {
          // let { patientID, studyUID, seriesUID, projectID } = serie;
          this.props.dispatch(addToGrid(this.props.serie, aimid));
          this.props
            .dispatch(getSingleSerie(this.props.serie, aimid))
            .then(() => {
              // this.props.dispatch(showAnnotationDock());

              this.props.dispatch(
                updateAnnotationDisplay(
                  patientID,
                  studyUID,
                  seriesUID,
                  aimid,
                  true
                )
              );
            })
            .catch(err => console.log(err));
        }
      }
    }
    this.props.dispatch(showAnnotationWindow());
  };

  handleToggleSerie = async (checked, e, id) => {
    //select de select all anotations
    const { patientID, studyUID, seriesUID } = this.props.serie;
    // const { seriesid } = e.target.dataset;
    // const activeSeriesUID = this.props.openSeries[this.props.activePort]
    //   .seriesUID;
    //check if user toggle on or off and change the state accordingly
    await this.setState({ displayAnnotations: checked });
    // if checked true
    const isOpen = this.checkIfSerieOpen(seriesUID).isOpen;
    const index = this.checkIfSerieOpen(seriesUID).index;
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
          this.props
            .dispatch(getSingleSerie(this.props.serie))
            .then(() => { })
            .catch(err => console.log(err));
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
        <div className="-serieButton__container">
          <div className="annList-serieButton">
            {this.state.collapseAnnList ? (
              <div className="-serie-icon__cont" onClick={this.handleCollapse}>
                <FaMinus className="-serieButton__icon" />
              </div>
            ) : (
              <div className="-serie-icon__cont" onClick={this.handleCollapse}>
                <FaPlus className="-serieButton__icon" />
              </div>
            )}
            <span
              className="-serieButton__value"
              onClick={this.handleCollapse}
              onDoubleClick={this.openSerie}
            >
              {desc} - ({numOfAnn})
            </span>
            {this.state.isSerieOpen ? (
              <div className="-serie-icon__cont">
                <FaCheck className="-serieButton__icon" />
              </div>
            ) : (
              <div className="-serie-icon__cont" onClick={this.openSerie}>
                <FaEye className="-serieButton__icon" />
              </div>
            )}
          </div>
        </div>
        {this.state.collapseAnnList && (
          <Annotations
            handleClick={this.handleAnnotationClick}
            seriesUID={seriesUID}
            studyUID={studyUID}
            patient={patientID}
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
    activePort: state.annotationsListReducer.activePort,
    patients: state.annotationsListReducer.patients
  };
};
export default connect(mapStateToProps)(ListItem);
