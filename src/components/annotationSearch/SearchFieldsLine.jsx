import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaMinus, FaPlus } from 'react-icons/fa';
import './annotationSearch.css';

const SearchFieldsLine = ({
  item,
  count,
  index,
  postFormInput,
  onPlus,
  onMinus
}) => {
  return (
    <div
      className="annotationSearch-line"
      style={{
        marginBottom: '0rem 0.5rem',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ width: '170px', height: '35.9px', marginRight: '0.5rem' }}>
        {index > 1 ? (
          <select
            className="custom-select custom-select-lg mb-3 annotationSearch-select"
            style={{
              padding: '0.15rem',
              height: 'fit-content',
              fontSize: '1.2rem'
            }}
            onChange={(e) => postFormInput(e, index)}
            name='andor'
          >
            <option value='and'>AND</option>
            <option value='or'>OR</option>
          </select>
        ) : (
          <div />
        )}
      </div>
      <button
        type="button"
        className={`btn btn-${item.openpar ? 'danger' : 'light'} annotationSearch-btn`}
        onClick={(e) => postFormInput(e, index)}
        style={{ width: '5%' }}
        variant={item.openpar ? 'info' : null}
        name='openpar'
        style={{
          padding: '0.3rem 0.5rem',
          height: 'fit-content',
          fontSize: '1rem',
          marginTop: '0.1rem'
        }}
      >
        (
      </button>
      <select
        className="custom-select custom-select-lg mb-3 annotationSearch-select"
        name="type"
        onChange={(e) => postFormInput(e, index)}
        style={{
          padding: '0.15rem',
          height: 'fit-content',
          fontSize: '1.2rem',
          width: '32%'
        }}
      >
        <option value='modality'>Modality</option>
        <option value='observation'>Imaging Observation/Diagnosis</option>
        <option value='anatomy'>Anatomic Entity</option>
      </select>
      <select
        className="custom-select custom-select-lg mb-3 annotationSearch-select"
        onChange={(e) => postFormInput(e, index)}
        style={{
          padding: '0.15rem',
          height: 'fit-content',
          fontSize: '1.2rem',
          width: '20%'
        }}
      >
        <option value='equals'>equals</option>
        <option value='contains'>contains</option>
      </select>
      <div
        className="input-group input-group-lg"
        style={{
          padding: '0.15rem',
          height: 'fit-content',
          fontSize: '1.2rem'
        }}
      >
        <input
          type="text"
          className="form-control annotationSearch-text"
          aria-label="Large"
          name='text'
          onChange={(e) => postFormInput(e, index)}
          style={{
            padding: '0.15rem',
            height: 'fit-content',
            fontSize: '1.2rem'
          }}
        />
      </div>
      <button
        type="button"
        className={`btn btn-${item.closepar ? 'danger' : 'light'} annotationSearch-btn`}
        onClick={(e) => postFormInput(e, index)}
        style={{ width: '5%' }}
        name="closepar"
        style={{
          padding: '0.3rem 0.5rem',
          height: 'fit-content',
          fontSize: '1rem',
          marginTop: '0.1rem'
        }}
      >
        )
      </button>
      <button
        type="button"
        className="btn btn-light annotationSearch-btn"
        onClick={onPlus}
        disabled={index < count}
        style={{
          padding: '0.3rem 0.5rem',
          height: 'fit-content',
          fontSize: '1rem',
          marginTop: '0.1rem',
          width: '5%'
        }}
      >
        <FaPlus />
      </button>
      <button
        type="button"
        className="btn btn-light annotationSearch-btn"
        onClick={() => onMinus(count)}
        disabled={index === 1}
        style={{
          padding: '0.3rem 0.5rem',
          height: 'fit-content',
          fontSize: '1rem',
          marginTop: '0.1rem',
          width: '5%'
        }}
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
  onFormInput: PropTypes.func,
  item: PropTypes.object,
  postFormInput: PropTypes.func,
};
