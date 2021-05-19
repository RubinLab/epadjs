import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { searchAnnotations } from './../../services/annotationServices.js';
import './annotationSearch.css';

const lists = {
  organize: ['AND', 'OR', '(', ')'],
  paranthesis: ['(', ')'],
  condition: ['AND', 'OR'],
  type: ['modality', 'diagnosis', 'anatomic entity'],
  criteria: ['equals', 'contains']
};

const title = {
  type: 'STEP 1: ',
  criteria: 'STEP 2: ',
  term: 'STEP 3: ',
  organize: 'STEP 4: ',
  project: 'STEP 5: '
};

const explanation = {
  organize: 'Group and/or organize your query: ',
  type: 'Select a field from annotation',
  criteria: 'Select a criteria',
  term: 'Type the key word that you want to look for above',
  project: 'Select project: '
};

const styles = {
  buttonStyles: {
    width: '5rem',
    margin: '0.2rem',
    padding: '0.3rem 0.5rem',
    fontSize: '1.2 rem'
  }
};

const AnnotationSearch = ({ projectMap }) => {
  const [query, setQuery] = useState('');
  const [partialQuery, setPartialQuery] = useState({
    type: lists.type[0],
    criteria: lists.criteria[0],
    term: ''
  });
  const [typeSelected, setTypeSelected] = useState(false);
  const [selectedProject, setSelectedProject] = useState('all');

  const renderOrganizeItem = name => {
    return (
      <div className="annotationSearch-cont__item">
        <div className="annotaionSearch-title">{`${explanation[name]}`}</div>
        <div style={{ margin: '0rem 1rem' }}>
          {lists[name]?.map((el, i) => {
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
          })}
        </div>
      </div>
    );
  };

  const addPartialToQuery = () => {
    const { type, criteria, term } = partialQuery;
    const newQuery = `${query} ${type} ${criteria} ${term}`;
    setQuery(newQuery);
  };

  const insertIntoQuery = selection => {
    // get the cursor index and add the selection at that index
  };

  const renderContentItem = field => {
    return (
      <select
        onChange={e =>
          setPartialQuery({ ...partialQuery, [field]: e.target.value })
        }
        name={field}
        onMouseDown={e => e.stopPropagation()}
        className="annotationSearch-cont__item__sub"
      >
        {lists[field]?.map((el, i) => {
          return (
            <option key={lists[field][i]} value={lists[field][i]}>
              {lists[field][i]}
            </option>
          );
        })}
      </select>
    );
  };

  // const renderContent = () => {
  //   return (
  //     <div className="annotationSearch-wrapper">
  //       {renderContentItem('type')}
  //       {renderContentItem('criteria')}
  //       {renderContentItem('term')}
  //       {renderContentItem('organize')}
  //       {renderSelect('project')}
  //     </div>
  //   );
  // };

  const renderQueryItem = () => {
    return (
      <div className="annotationSearch-cont__item">
        {renderContentItem('type')}
        {renderContentItem('criteria')}
        <input
          type="text"
          autoComplete="off"
          className="form-control annotationSearch-cont__item__sub"
          aria-label="Large"
          name="term"
          onChange={e =>
            setPartialQuery({ ...partialQuery, term: e.target.value })
          }
          style={{
            padding: '0.15rem',
            height: 'fit-content',
            fontSize: '1.2rem'
          }}
        />
        <button
          className={`btn btn-secondary`}
          style={styles.buttonStyles}
          onClick={addPartialToQuery}
          type="button"
          style={{
            padding: '0.3rem 0.5rem',
            height: 'fit-content',
            fontSize: '1rem',
            margin: '0rem 0.3rem',
            width: '5%'
          }}
        >
          <FaPlus />
        </button>
      </div>
    );
  };

  // const renderContent = () => {
  //   return (
  //     <div className="annotationSearch-wrapper">
  //       {renderContentSelection('type')}
  //       {renderContentSelection('criteria')}
  //       {renderContentItem('term')}
  //       {renderContentItem('organize')}
  //       {renderSelect('project')}
  //     </div>
  //   );
  // };

  const detactConstant = (str, constant) => {
    // const baseQuery = str.toUpperCase();
    let result = '';
    if (lists[constant]) {
      lists[constant].forEach((el, i) => {
        // const upperVersion = el.toUpperCase();
        if (str.indexOf(el) === 0) {
          result = str.substring(0, el.length);
        }
      });
    }
    return { result };
  };

  const findMinIndex = indexMap => {
    const words = Object.keys(indexMap);
    const indeces = Object.values(indexMap);
    const min = { word: words[0], index: indeces[0] };
    indeces.forEach((el, i) => {
      if (el < min.index && el > -1) {
        min.word = words[i];
        min.index = indeces[i];
      }
    });
    return min;
  };

  // finds the index of firt predefined term
  const detactTermEndIndex = baseQuery => {
    const { organize, paranthesis, type, criteria } = lists;
    const indexMap = {};
    const list = _.concat(organize, paranthesis, type, criteria);
    list.forEach(el => {
      indexMap[el] = baseQuery.indexOf(el);
    });
    // cover if query ends there ??????

    return findMinIndex(indexMap);
  };

  const getSearchResult = () => {
    const query = parseQuery();
    searchAnnotations({ query })
      .then(res => {
        console.log(res);
      })
      .catch(err => console.error(err));
  };

  const parseQuery = () => {
    console.log('parseQuery clicked');
    // debugger;
    let baseQuery = query;
    let parsedQuery = '';
    let i = 0;
    let endIndex;
    let type;
    let criteria;
    while (baseQuery.length > 0) {
      type = detactConstant(baseQuery, 'type').result;
      criteria = detactConstant(baseQuery, 'criteria').result;
      if (baseQuery[i] === ' ') {
        baseQuery = baseQuery.substring(1);
        continue;
      } else if (lists.paranthesis.includes(baseQuery[i])) {
        // if closing check there is opening and give error if required
        // if there is an opening and all map full empty it
        // fill the flag object accordingly
        parsedQuery += `${baseQuery[i]} `;
        baseQuery = baseQuery.substring(1);
        continue;
      } else if (type) {
        // TODO: keep the order of the default query, if out of order give an error
        //
        // const { result } = detactConstant(baseQuery, 'type');
        parsedQuery += `${type}`;
        baseQuery = baseQuery.substring(type.length);
        setTypeSelected(true);
        continue;
        // TODO: keep the order of the default query, if out of order give an error
        // make sure there is a type before
      } else if (criteria) {
        // if (typeSelected) {
        // const { result } = detactConstant(baseQuery, 'criteria');
        parsedQuery += `:`;
        baseQuery = baseQuery.substring(criteria.length);
        setTypeSelected(false);
        endIndex = detactTermEndIndex(baseQuery).index;
        continue;
        // } else {
        // if there is no term show error
        // if word is not criteria show error
        // fill map term flag
        // }
      } else if (endIndex >= 0 || endIndex === -1) {
        if (endIndex < 2 && endIndex !== -1) {
          // error: please enter a search term
          return;
        } else if (endIndex !== -1) {
          const searchTerm = baseQuery.substring(0, endIndex);
          parsedQuery += `${searchTerm.trim()} `;
          baseQuery = baseQuery.substring(searchTerm.length);
        } else if (endIndex === -1) {
          parsedQuery += baseQuery.trim();
          baseQuery = '';
        }
      }
      console.log('parsedQuery', parsedQuery);
    }
    alert(parsedQuery);
    return parsedQuery;
  };

  const renderProjectSelect = () => {
    const projectNames = Object.values(projectMap);
    const projectID = Object.keys(projectMap);
    return (
      <div
        className="annotationSearch-cont__item"
        style={{ margin: '1rem 0rem' }}
      >
        <div
          className="annotaionSearch-title"
          style={{ fontsize: '1.2rem' }}
        >{`${explanation['project']}`}</div>
        <select
          onChange={e => setSelectedProject(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
          style={{ margin: '0rem 1rem', padding: '0.35rem 0rem' }}
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
          margin: '1rem 2rem'
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
          type="button"
          className="btn btn-secondary annotationSearch-btn"
          onClick={getSearchResult}
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
          margin: '1rem 2rem'
        }}
      >
        {renderQueryItem()}
        {renderOrganizeItem('organize')}
        {renderProjectSelect()}
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
