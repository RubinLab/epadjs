import React from "react";
import { connect } from "react-redux";
import { FaMinus, FaPlus, FaEye, FaCheck } from "react-icons/fa";
import Annotations from "./annotations";
import {
  updateAnnotationDisplay,
  toggleAllAnnotations,
  changeActivePort,
  showAnnotationWindow,
  alertViewPortFull,
  addToGrid,
  updatePatient,
  jumpToAim,
  showAnnotationDock
} from "../action";
import { openSeriesInDisplay } from "../../common/openSeriesHelper";

const maxPort = parseInt(sessionStorage.getItem("maxPort"));

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
      isSerieOpen: this.props.aimslist[seriesUID],
      collapseAnnList: this.checkIfSerieOpen(this.props.serie.seriesUID).isOpen,
      displayAnnotations: this.props.serie.isDisplayed,
      displayLabels: this.props.serie.isLabelDisplayed
    });
  };

  componentDidUpdate = prevProps => {
    if (prevProps.activePort !== this.props.activePort) {
      const { patientID, studyUID, seriesUID } = this.props.serie;
      const collapseAnnList = this.checkIfSerieOpen(seriesUID).isOpen;
      const currentStatus = this.props.aimslist[seriesUID];
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
    openSeriesInDisplay({
      dispatch: this.props.dispatch,
      navigate: () => {},  // already in display view
      openSeries: Object.values(this.props.openSeries),
      series: this.props.serie,
    });
  };

  handleAnnotationClick = async e => {
    const { seriesUID, studyUID, patientID } = this.props.serie;
    const { seriesid, aimid } = e.target.dataset;
    const activeSeriesUID = this.props.openSeries[this.props.activePort].seriesUID;

    if (activeSeriesUID === seriesid) {
      this.props.dispatch(jumpToAim(seriesid, aimid, this.props.activePort));
    } else {
      openSeriesInDisplay({
        dispatch: this.props.dispatch,
        navigate: () => {},  // already in display view
        openSeries: this.props.openSeries,
        series: this.props.serie,
        aimID: aimid,
      })?.then(() => {
        this.props.dispatch(
          updateAnnotationDisplay(patientID, studyUID, seriesUID, aimid, true)
        );
      });
    }
    this.props.dispatch(showAnnotationWindow());
  };

  handleToggleSerie = async (checked, e, id) => {
    const { seriesUID } = this.props.serie;
    await this.setState({ displayAnnotations: checked });
    const { isOpen, index } = this.checkIfSerieOpen(seriesUID);
    if (checked) {
      if (isOpen) {
        this.props.dispatch(changeActivePort(index));
        this.props.dispatch(toggleAllAnnotations(seriesUID, checked));
      } else {
        openSeriesInDisplay({
          dispatch: this.props.dispatch,
          navigate: () => {},  // already in display view
          openSeries: this.props.openSeries,
          series: this.props.serie,
        });
      }
    } else {
      this.props.dispatch(toggleAllAnnotations(seriesUID, checked));
      if (isOpen) this.props.dispatch(changeActivePort(index));
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
    // patients: state.annotationsListReducer.patients
    aimslist: state.annotationsListReducer.aimslist
  };
};
export default connect(mapStateToProps)(ListItem);
