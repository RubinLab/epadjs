import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FaSearch } from 'react-icons/fa';
import './annotationSearch.css';

const lists = {
  organize: ['AND', 'OR', '(', ')'],
  paranthesis: ['(', ')'],
  condition: ['AND', 'OR'],
  type: ['Modality', 'Diagnosis', 'Anatomic Entity'],
  criteria: ['Equals', 'Contains']
};

const title = {
  type: 'STEP 1: ',
  criteria: 'STEP 2: ',
  term: 'STEP 3: ',
  organize: 'STEP 4: ',
  project: 'STEP 5: '
};

const explanation = {
  organize: 'Group and/or organize your query',
  type: 'Select a field from annotation',
  criteria: 'Select a criteria',
  term: 'Type the key word that you want to look for above',
  project: 'You may select a project'
};

const styles = {
  buttonStyles: {
    width: '10rem',
    margin: '0.2rem',
    padding: '0.2rem',
    fontSize: '1.1 rem'
  }
};

const AnnotationSearch = ({ projectMap }) => {
  const [query, setQuery] = useState('');
  const [validationMap, setValidationMap] = useState({
    openPar: false,
    closePAar: false,
    type: '',
    criteria: '',
    term: '',
    organize: ''
  });
  const [selectedProject, setSelectedProject] = useState('all');
  console.log('projectMap', projectMap);
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
      <div className="annotationSearch-cont__item">
        <div className="annotaionSearch-title">{`${title[name]} ${explanation[name]}`}</div>
        <div>
          {lists[name]?.map((el, i) => {
            return renderButton(el, i);
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="annotationSearch-wrapper">
        {renderContentItem('type')}
        {renderContentItem('criteria')}
        {renderContentItem('term')}
        {renderContentItem('organize')}
        {renderSelect('project')}
      </div>
    );
  };

  const detactConstant = (str, constant) => {
    const baseQuery = str.toUpperCase();
    let result = '';
    if (lists[constant]) {
      lists[constant].forEach((el, i) => {
        const upperVersion = el.toUpperCase();
        if (baseQuery.indexOf(upperVersion) === 0) {
          result = baseQuery.substring(0, el.length);
        }
      });
    }
    return { result };
  };

  const findMinIndex = indexMap => {
    const words = Object.key(indexMap);
    const indeces = Object.values(indexMap);
    const min = { word: words[0], index: indeces[0] };
    indeces.forEach((el, i) => {
      if (el < min[index] && el > -1) {
        min.word = words[i];
        min.index = indeces[i];
      }
    });
    return min;
  };

  const detactTerm = baseQuery => {
    const { organize, paranthesis, type, criteria } = lists;
    const indexMap = {};
    const list = _.concat(organize, paranthesis, type, criteria);
    list.forEach(el => {
      indexMap[el] = baseQuery.indexOf(el);
    });
    // cover if query ends there ??????

    return findMinIndex(indexMap);
  };

  const parseQuery = () => {
    console.log('parseQuery clicked')
    debugger;
    let baseQuery = query;
    let parsedQuery = '';
    let i = 0;
    while (baseQuery.length > 0) {
      if (baseQuery[i] === ' ') {
        baseQuery = baseQuery.substring(1);
        continue;
      } else if (lists.paranthesis.includes(baseQuery[i])) {
        // if closing check there is opening and give error if required
        // if there is an opening and all map full empty it
        // fill the flag object accordingly
        parsedQuery += `\\${baseQuery[i]} `;
        baseQuery = baseQuery.substring(1);
        continue;
      } else if (detactConstant(baseQuery, 'type').result) {
        // TODO: keep the order of the default query, if out of order give an error
        //
        const { result } = detactConstant(baseQuery);
        parsedQuery += `${result} `;
        baseQuery = baseQuery.substring(result.length);
        continue;
        // TODO: keep the order of the default query, if out of order give an error
        // make sure there is a type before
      } else if (detactConstant(baseQuery, 'criteria').result) {
        const { result } = detactConstant(baseQuery);
        parsedQuery += `${result} `;
        baseQuery = baseQuery.substring(result.length);
        continue;
        // if there is no term show error
        // if word is not criteria show error
        // fill map term flag
      } else if (
        detactTerm(baseQuery).index >= 0 ||
        detactTerm(baseQuery).end
      ) {
        const { word, index, end } = detactTerm(baseQuery);
        if (index < 2) {
          // error: please enter a search term
          return;
        }
        const searchTerm = baseQuery.substring(0, index).trim();
        parsedQuery += `${searchTerm} `;
        if (end) return;
        else baseQuery = baseQuery.substring(index);
      } else if (detactConstant(baseQuery, 'condition').result) {
        // check 
        console.log('parsedQuery', parsedQuery)
        return;
      }
      console.log('parsedQuery', parsedQuery)
      return parsedQuery;
    }
  };

  const renderSelect = () => {
    const projectNames = Object.values(projectMap);
    const projectID = Object.keys(projectMap);
    return (
      <div className="annotationSearch-cont__item">
        <div className="annotaionSearch-title">{`${title['project']} ${
          explanation['project']
        }`}</div>
        <select
          onChange={e => setSelectedProject(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
        >
          {projectNames.map((el, i) => {
            return (
              <option
                key={projectID[i]}
                data-project-id={projectID[i]}
                value={projectID[i]}
              >
                {el.projectName}
              </option>
            );
          })}
        </select>
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
          onClick={parseQuery}
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

const mapsStateToProps = state => {
  return {
    projectMap: state.annotationsListReducer.projectMap
  };
};

export default connect(mapsStateToProps)(AnnotationSearch);
