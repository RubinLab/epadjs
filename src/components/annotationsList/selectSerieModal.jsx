import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import {
  openProjectSelectionModal,
  clearGrid,
  getPatient,
  getWholeData
} from "./action";
import SerieSelect from "./containers/serieSelection";

const message = {
  title: "Not enough ports to open series"

  // explanation: "Please close a view screen before open a new one"
};
class selectSerieModal extends React.Component {
  //when the series are selected, if the patient is there get single series,
  // if the patient is not there, get the first serie with big data action,
  //
  state = {
    selection: "",
    selectionArr: [],
    seriesList: [],
    selectedToDisplay: [],
    limit: 0
  };
  //get the serie list
  componentDidMount = async () => {
    let selectionArr = [];
    let seriesList = [];
    let selection = "";
    if (this.props.selectedStudies.length > 0) {
      selectionArr = this.props.selectedStudies;
      selection = "study";
    } else if (this.props.selectedSeries.length > 0) {
      seriesList = this.props.selectedSeries;
      selection = "series";
    } else {
      seriesList = this.props.selectedAnnotations;
      selection = "aim";
    }
    this.setState({ selection, selectionArr, seriesList });
    if (selection === "study") {
      for (let item of selectionArr) {
        if (!this.props.patients[item.patientID]) {
          let patient = await this.props.dispatch(getWholeData(null, item));
          console.log("patient in modal", patient);
          await this.getPatient(patient);
        }

        let seriesOfPatient = Object.values(
          this.props.patients[item.patientID].studies[item.studyUID].series
        );
        seriesList = seriesList.concat(seriesOfPatient);
      }
      console.log(seriesList);
      this.setState({ seriesList });
    }
  };

  getPatient = async study => {
    return this.props.dispatch(getPatient(study));
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

  render = () => {
    console.log("state", this.state);
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
          <button
            onClick={() => this.props.dispatch(openProjectSelectionModal())}
          >
            OK
          </button>
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
