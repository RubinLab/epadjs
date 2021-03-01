import React, { useState } from 'react';
import _ from 'lodash';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FaSearch } from 'react-icons/fa';
import './annotationSearch.css';
import { ConsoleWriter } from 'istanbul-lib-report';
import { set } from 'date-fns/esm';

const lists = {
  organize: ['AND', 'OR', '(', ')'],
  // conditions: ['AND', 'OR'],
  type: ['Modality', 'Diagnosis', 'Anatomic Entity'],
  criteria: ['Equals', 'Contains']
};

const title = {
  type: 'STEP 1: ',
  criteria: 'STEP 2: ',
  term: 'STEP 3: ',
  organize: 'STEP 4: '
};

const explanation = {
  organize: 'Group and/or organize your query',
  type: 'Select a field from annotation',
  criteria: 'Select a criteria',
  term: 'Type the key word that you want to look for above'
};

const styles = {
  buttonStyles: {
    width: '10rem',
    margin: '0.2rem',
    padding: '0.2rem',
    fontSize: '1.1 rem'
  }
};

const AnnotationSearch = () => {
  const [query, setQuery] = useState('');

  const renderButton = (el, i) => {
    return (
      <button
        className={`btn btn-secondary`}
        style={styles.buttonStyles}
        key={`${el}-${i}`}
        name={el}
        onClick={() => {
          setQuery(`${query} ${el}`);
        }}
        type="button"
      >
        {el}
      </button>
    );
  };

  const renderContentItem = name => {
    return (
      <>
        <div  className="annotaionSearch-title">{`${title[name]} ${explanation[name]}`}</div>
        <div>
          {lists[name]?.map((el, i) => {
            return renderButton(el, i);
          })}
        </div>
      </>
    );
  };

  const renderContent = () => {
    return (
      <div className="annotationSearch-wrapper">
        <div className="annotationSearch-cont__item">{renderContentItem('type')}</div>
        <div className="annotationSearch-cont__item">{renderContentItem('criteria')}</div>
        <div className="annotationSearch-cont__item">{renderContentItem('term')}</div>
        <div className="annotationSearch-cont__item">{renderContentItem('organize')}</div>
      </div>
    );
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
            onChange={e => setQuery(e.target.value)}
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
        {renderContent()}
      </div>
    </div>
  );
};

export default AnnotationSearch;
