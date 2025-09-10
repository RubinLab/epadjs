import React from "react";
import PropTypes from "prop-types";
import AnchoredPortalModal from "../common/AnchoredPortalModal";
import "../menuStyle.css";

const updateDueDate = props => {
  let today;
  if (!props.duedate) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    today = `${year}-${month + 1}-${day}`;
  }
  const defaultDate = props.duedate || today;

  const renderFooter = () => {
    return (
      <div className="updateDueDate__modal--buttons">
      <button
        className="updateDueDate__modal--button"
        variant="secondary"
        onClick={props.onSubmit}
      >
        Submit
      </button>
      <button
        className="edit-permission__modal--button"
        variant="secondary"
        onClick={props.onCancel}
      >
        Cancel
      </button>
    </div>
    )
  }
  return (
    // <Modal.Dialog dialogClassName="updateDueDate__modal">
    <AnchoredPortalModal
    open={true}
    onClose={props.onCancel}
    anchorEl={props.anchorEl}
    placement="bottom-start"
    title="Update Due Date"
    minWidth={260}
    backdrop={false}            // set true if you want dim behind
    showCloseButton={true}
    footer={renderFooter()}
    minusLeft={100}
  >
    <input
      type="date"
      name="duedate"
      onChange={props.onChange}
      defaultValue={defaultDate}
      style={{"width": "100%"}}
    />
    </AnchoredPortalModal>
  );
};

updateDueDate.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string
};

export default updateDueDate;
