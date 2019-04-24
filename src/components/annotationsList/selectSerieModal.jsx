import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import {
  openProjectSelectionModal,
  clearGrid,
  getPatient,
  getWholeData,
  getSingleSerie,
  clearSelection
} from "./action";
import SerieSelect from "./containers/serieSelection";
import { getSeries } from "../../services/seriesServices";

const message = {
  title: "Not enough ports to open series"
};
class selectSerieModal extends React.Component {
  state = {
    selectionType: "",
    selectionArr: [],
    seriesList: [],
    selectedToDisplay: [],
    limit: 0
  };
  //get the serie list
  componentDidMount = async () => {
    let selectionArr = [];
    let seriesList = [];
    let selectionType = "";
    if (this.props.selectedStudies.length > 0) {
      selectionArr = this.props.selectedStudies;
      selectionType = "study";
    } else if (this.props.selectedSeries.length > 0) {
      seriesList = this.props.selectedSeries;
      selectionType = "series";
    } else {
      seriesList = this.props.selectedAnnotations;
      selectionType = "aim";
    }
    this.setState({ selectionType, selectionArr, seriesList });
    if (selectionType === "study") {
      for (let item of selectionArr) {
        let seriesOfSt;
        if (!this.props.patients[item.patientID]) {
          seriesOfSt = await this.getSerieListData(
            item.projectID,
            item.patientID,
            item.studyUID
          );
        } else {
          seriesOfSt = Object.values(
            this.props.patients[item.patientID].studies[item.studyUID].series
          );
        }
        seriesList = seriesList.concat(seriesOfSt);
      }
      this.setState({ seriesList });
    }
  };

  getPatient = async study => {
    return this.props.dispatch(getPatient(study));
  };

  getSerieListData = async (projectID, patientID, studyUID) => {
    const {
      data: {
        ResultSet: { Result: series }
      }
    } = await getSeries(projectID, patientID, studyUID);
    return series;
  };

  selectToDisplay = async e => {
    let selectCount = 0;
    let arr = [...this.state.selectedToDisplay];
    arr[e.target.dataset.index] = e.target.checked;
    await this.setState({ selectedToDisplay: arr });
    this.state.selectedToDisplay.forEach(item => {
      if (item) {
        selectCount++;
      }
    });
    let limit = this.props.openSeries.length + selectCount;
    this.setState({ limit });
  };

  displaySelection = async () => {
    for (let i = 0; i < this.state.selectedToDisplay.length; i++) {
      if (!this.props.patients[this.state.seriesList[i].patientID]) {
        let patient = await this.props.dispatch(
          getWholeData(null, this.state.seriesList[i])
        );
        await this.getPatient(patient);
      }
      if (this.state.selectedToDisplay[i]) {
        if (this.state.selectionType === "aim") {
          this.props.dispatch(getSingleSerie(null, this.state.seriesList[i]));
        } else {
          this.props.dispatch(getSingleSerie(this.state.seriesList[i]));
        }
      }
    }
    this.handleCancel();
    this.props.dispatch(clearSelection());
  };

  handleCancel = () => {
    this.setState({
      selectionType: "",
      selectionArr: [],
      seriesList: [],
      selectedToDisplay: [],
      limit: 0
    });
    this.props.dispatch(openProjectSelectionModal());
    this.props.dispatch(clearSelection());
  };

  render = () => {
    return (
      <Modal.Dialog dialogClassName="alert-selectSerie">
        <Modal.Header>
          <Modal.Title className="selectSerie__header">
            {message.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="selectSerie-container">
          <div>Maximum 6 series can be viewed at a time.</div>
          <button
            size="lg"
            className="selectSerie-clearButton"
            onClick={() => this.props.dispatch(clearGrid())}
          >
            Close all views
          </button>
          {this.state.limit >= 6 && <div>You reached Max number of series</div>}
          <SerieSelect
            itemArr={this.state.seriesList}
            onSelect={this.selectToDisplay}
            limit={this.state.limit}
            checkList={this.state.selectedToDisplay}
          />
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button onClick={this.displaySelection}>Display selection</button>
          <button onClick={this.handleCancel}>Cancel</button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

selectSerieModal.propTypes = {
  onOK: PropTypes.func
};

const mapStateToProps = state => {
  return {
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    patients: state.annotationsListReducer.patients,
    openSeries: state.annotationsListReducer.openSeries
  };
};
export default connect(mapStateToProps)(selectSerieModal);
