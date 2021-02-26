import React, { useState } from 'react';
import _ from 'lodash';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FaSearch } from 'react-icons/fa';
import './annotationSearch.css';
import { ConsoleWriter } from "istanbul-lib-report";
import { set } from "date-fns/esm";

const paranthesis = ['(', ')'];
const conditions = ['AND', 'OR'];
const type = ['Modality', 'Diagnosis', 'Anatomic Entity'];
const criteria = ['Equals', 'Contains'];

const styles = {
  buttonStyles: {
    width: '10rem',
    margin: '0.2rem',
    padding: '0.2rem',
    fontSize: '1.1 rem'
  }
};

const AnnotationSearch = () => {
  const [entryMap, setEntryMap] = useState({
    paranthesis: '',
    conditions: '',
    type: '',
    criteria: '',
    term: ''
  });
  const [query, setQuery] = useState('');
  const [openinigParanthesis, setOpeningParanthesis] = useState(false);
  const [closingParanthesis, setClosingParanthesis] = useState(false);
  const [status, setStatus] = useState('');
  const [lastConstantIndex, setLastConstantIndex] = useState(0);

  const deleteQueryItem = () => {
    // form array out of he string by spliting by space
    // if change is in he fixed terms (contains/and/equal/paranthesis) delete it completely and show menu and/or give error to be fixed
    // else continue
  };

  const addQueryItem = () => {};

  const controlQueryEntry = query => {};

  const validateQuery = () => {};

  const handleKeydown = e => {
    console.log('handle keydown evente');
    console.log(e);
  };

  const handleClick = e => {
    console.log('hhandleClick event');
    console.log(e);
    if (query.length === 0) {
      if (!entryMap.type) {
        setStatus('type');
      }
    } else {
    }
  };

  const handleQueryTerm = e => {
    // get the index of the cursor if it is longer than the
    // existing query add it as new term
    // if it is inside the query don't put anything in between fixed terms
    // don't accept anything other than or/and and paranthesis before the contains

    const { name, value, selectionStart } = e.target;
    console.log('query', query, query.length);
    console.log('selectionStart', selectionStart);
    console.log('lastConstantIndex', lastConstantIndex);
    let newTermEntry;
    const oldQueryLengh = query.length;
    if (selectionStart > lastConstantIndex) {
      newTermEntry = value.slice(lastConstantIndex);
      setEntryMap({ ...entryMap, [name]: newTermEntry });
    }
    setQuery(value);
    setStatus('type');

    // don't let user to add something between fixed terms
    // get the length of the sring
    // if string is shorter call delete
    // if longer call add
  };

  const handleParameterSelection = (key, value) => {
    const newQuery = `${query} ${value}`;  
    setQuery(newQuery);
    setEntryMap({ ...entryMap, [key]: value });
    if (status === 'type') {
      setStatus('criteria');
    } else if (status === 'criteria') {
      setStatus('term');
    }
    setLastConstantIndex(newQuery.length);  
  };

  const renderPopupContent = () => {
    switch (status) {
      case 'paranthesis':
        return [...paranthesis, ...type].map((el, i) => {
          return (
            <button
              className={`btn btn-secondary`}
              style={styles.buttonStyles}
              key={`${el}-${i}`}
              type="button"
              onClick={() => handleParameterSelection('paranthesis', el)}
            >
              {el}
            </button>
          );
        });
      case 'condition':
        return conditions.map((el, i) => {
          return (
            <button
              className={`btn btn-secondary`}
              style={styles.buttonStyles}
              key={`${el}-${i}`}
              type="button"
              onClick={() => handleParameterSelection('conditions', el)}
            >
              {el}
            </button>
          );
        });
      case 'type':
        return type.map((el, i) => {
          return (
            <button
              className={`btn btn-secondary`}
              style={styles.buttonStyles}
              key={`${el}-${i}`}
              name={el}
              onClick={() => {
                handleParameterSelection('type', el);
              }}
              type="button"
            >
              {el}
            </button>
          );
        });
      case 'criteria':
        return criteria.map((el, i) => {
          return (
            <button
              className={`btn btn-secondary`}
              style={styles.buttonStyles}
              key={`${el}-${i}`}
              type="button"
              onClick={() => handleParameterSelection('criteria', el)}
            >
              {el}
            </button>
          );
        });
      case 'term':
        return (
        //   <input
        //     type="text"
        //     className="form-control annotationSearch-text"
        //     aria-label="Large"
        //     name="term"
        //     onChange={handleQueryTerm}
        //     style={{
        //       padding: '0.15rem',
        //       height: 'fit-content',
        //       fontSize: '1.2rem'
        //     }}
        //   />
        <div>enter tthe tterm you want to searrch above!</div>
        );
      default:
        setStatus('');
        return;
    }
  };

  return (
    <div>
      <div
        className="form-group annotationSearch-container"
        style={{
          width: '-webkit-fill-available',
          display: 'flex',
          margin: '2rem'
        }}
      >
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
            autoComplete="off"
            className="form-control annotationSearch-text"
            aria-label="Large"
            name="term"
            onChange={handleQueryTerm}
            onKeyDown={handleKeydown}
            onClick={handleClick}
            style={{
              padding: '0.15rem',
              height: 'fit-content',
              fontSize: '1.2rem'
            }}
            value={query}
          />
        </div>
        <button
          className={`btn btn-secondary`}
          style={{ width: '10rem', margin: '1rem' }}
          type="button"
          className="btn btn-secondary annotationSearch-btn"
          // onClick={onPlus}
          // disabled={index < count}
          style={{
            padding: '0.3rem 0.5rem',
            height: 'fit-content',
            fontSize: '1rem',
            marginTop: '0.1rem',
            width: '5%'
          }}
        >
          <FaSearch />
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          margin: '2rem'
        }}
      >
        {status && renderPopupContent()}
      </div>
    </div>
  );
};

export default AnnotationSearch;
