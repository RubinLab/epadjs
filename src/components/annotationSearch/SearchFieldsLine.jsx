import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaMinus, FaPlus } from 'react-icons/fa';
import './annotationSearch.css';

const SearchFieldsLine = ({ count, onFormInput, onPlus, onMinus }) => {
  return (
    <div
      class="form-group annotationSearch-line"
      // style={{ width: 'inherit', width: '-webkit-fill-available' }}
      style={{ width: 'inherit', width: '-webkit-fill-available' }}
    >
      <select
        class="custom-select custom-select-lg mb-3 annotationSearch-select"
        style={{ width: 'fit-content' }}
      >
        <option>Modality</option>
        <option>Diagnosis</option>
        <option>Anatomic Entity</option>
      </select>
      <select
        class="custom-select custom-select-lg mb-3 annotationSearch-select"
        style={{ width: 'fit-content' }}
      >
        <option>equals</option>
        <option>contains</option>
      </select>
      <div class="input-group input-group-lg">
        <input type="text" class="form-control" aria-label="Large" />
        <button
          type="button"
          class="btn btn-light annotationSearch-btn"
          onClick={onPlus}
        >
          <FaPlus />
        </button>
        <button
          type="button"
          class="btn btn-light annotationSearch-btn"
          onClick={() => onMinus(count)}
          disabled={count === 1}
        >
          <FaMinus />
        </button>
      </div>
    </div>
  );
};

export default SearchFieldsLine;

SearchFieldsLine.propTypes = {
  count: PropTypes.number,
  onPlus: PropTypes.func,
  onMinus: PropTypes.func,
  onFormInput: PropTypes.func
};
