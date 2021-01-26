import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaMinus, FaPlus } from 'react-icons/fa';
import './annotationSearch.css';

const SearchFieldsLine = ({ count, index, onFormInput, onPlus, onMinus }) => {
  return (
    <div
      class="annotationSearch-line"
      style={{
        marginBottom: '0rem 0.5rem',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ width: '170px', height: '35.9px', marginRight: '0.5rem' }}>
        {index > 1 ? (
          <select
            class="custom-select custom-select-lg mb-3 annotationSearch-select"
            style={{padding: '0.15rem', height: 'fit-content', fontSize: '1.2rem'}}
          >
            <option>AND</option>
            <option>OR</option>
          </select>
        ) : (
          <div/>
        )}
      </div>
      <select
        class="custom-select custom-select-lg mb-3 annotationSearch-select"
        // style={{ width: '32%' }}
        style={{padding: '0.15rem', height: 'fit-content', fontSize: '1.2rem', width: '32%'}}

      >
        <option>Modality</option>
        <option>Diagnosis</option>
        <option>Anatomic Entity</option>
      </select>
      <select
        class="custom-select custom-select-lg mb-3 annotationSearch-select"
        // style={{ width: '20%' }}
        style={{padding: '0.15rem', height: 'fit-content', fontSize: '1.2rem', width: '20%'}}

      >
        <option>equals</option>
        <option>contains</option>
      </select>
      <div
        class="input-group input-group-lg"
        style={{padding: '0.15rem', height: 'fit-content', fontSize: '1.2rem'}}

      >
        <input
          type="text"
          class="form-control annotationSearch-text"
          aria-label="Large"
          style={{padding: '0.15rem', height: 'fit-content', fontSize: '1.2rem'}}
        />
      </div>
      <button
        type="button"
        class="btn btn-light annotationSearch-btn"
        onClick={onPlus}
        disabled={index < count}
        style={{ width: '5%' }}
        style={{padding: '0.3rem 0.5rem', height: 'fit-content', fontSize: '1rem', marginTop: '0.1rem'}}

      >
        <FaPlus />
      </button>
      <button
        type="button"
        class="btn btn-light annotationSearch-btn"
        onClick={() => onMinus(count)}
        disabled={index === 1}
        style={{ width: '5%' }}
        style={{padding: '0.3rem 0.5rem', height: 'fit-content', fontSize: '1rem'}}

      >
        <FaMinus />
      </button>
    </div>
  );
};

export default SearchFieldsLine;

SearchFieldsLine.propTypes = {
  count: PropTypes.number,
  index: PropTypes.number,
  onPlus: PropTypes.func,
  onMinus: PropTypes.func,
  onFormInput: PropTypes.func
};
