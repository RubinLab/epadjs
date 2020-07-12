import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { FaCheckSquare } from "react-icons/fa";

const errorStyle = {
  maxWidth: "20rem",
  textAlign: "center",
  overflowWrap: "break-word"
};
const sidebarPopup = ({
  series,
  open,
  cancel,
  selectSeries,
  error,
  openSeries
}) => {
  const list = series.map(el => {
    const { projectID, patientID, studyUID, seriesUID } = el;
    const isOpen = openSeries.includes(seriesUID);
    return (
      <div className="openSeries-select" key={el.seriesUID}>
        {isOpen ? (
          <div>
            <FaCheckSquare />
          </div>
        ) : (
          <input
            type="checkbox"
            className="checkbox-cell"
            onChange={() =>
              selectSeries({ projectID, patientID, studyUID, seriesUID })
            }
          />
        )}
        <span className="seriesDesc">
          {el.seriesDescription || "Unnamed Series"}
        </span>
      </div>
    );
  });
  return (
    // <Modal.Dialog dialogClassName="openSeries__modal">
    <Modal.Dialog id="modal-fix" className="modal-minwidth">
      <Modal.Body className="openSeries__mbody">{list}</Modal.Body>
      {error && (
        <div className="err-message __field" style={errorStyle}>
          {error}
        </div>
      )}
      <Modal.Footer className="modal-footer__buttons">
        <button variant="primary" onClick={open}>
          Open Series
        </button>
        <button variant="secondary" onClick={cancel}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default sidebarPopup;
