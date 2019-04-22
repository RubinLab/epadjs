import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { openProjectSelectionModal, clearGrid } from "./action";

const message = {
  title: "Not enough ports to open series"

  // explanation: "Please close a view screen before open a new one"
};
const selectSerieModal = props => {
  //when the series are selected, if the patient is there get single series,
  // if the patient is not there, get the first serie with big data action,
  //

  //get the serie list

  if (props.patients[props.selectedStudies.patientID]) {
  } else {
  }

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
          onClick={() => props.dispatch(clearGrid())}
        >
          Close all views
        </button>
        <div>and open Maximum 6 series can be viewed at a time.</div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button onClick={() => props.dispatch(openProjectSelectionModal())}>
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

selectSerieModal.propTypes = {
  onOK: PropTypes.func
};

const mapStateToProps = state => {
  return {
    selectedStudies: state.annotationsListReducer.selectedStudies,
    patients: state.annotationsListReducer.patients
  };
};
export default connect()(selectSerieModal);
