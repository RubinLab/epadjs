import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import _ from 'lodash';
import Collapsible from 'react-collapsible';
import { FaSearch, FaPlus, FaEraser } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import {
  searchAnnotations,
  getAllAnnotations,
  getSummaryAnnotations
} from './../../services/annotationServices.js';
import AnnotationTable from './AnnotationTable.jsx';
import './annotationSearch.css';
import { clearSelection, selectAnnotation } from '../annotationsList/action';
import AnnotationDownloadModal from '../searchView/annotationDownloadModal';

const lists = {
  organize: ['AND', 'OR', '(', ')'],
  paranthesis: ['(', ')'],
  condition: ['AND', 'OR'],
  type: ['modality', 'observation', 'anatomy'],
  criteria: ['equals', 'contains']
};

const explanation = {
  organize: 'Group and/or organize your query: ',
  type: 'Select a field from annotation',
  criteria: 'Select a criteria',
  term: 'Type the key word that you want to look for above',
  project: 'Search in all ePAD',
  noResult: 'Can not find any result!'
};

const styles = {
  buttonStyles: {
    width: '5rem',
    margin: '0.2rem',
    padding: '0.3rem 0.5rem',
    fontSize: '1.2 rem'
  },
  downloadButton: {
    width: '8rem',
    margin: '1rem 0.5rem',
    padding: '0.3rem 0.5rem',
    fontSize: '1.2 rem'
  },
  error: {
    color: 'orangered',
    padding: '0.3rem 0.5rem',
    height: 'fit-content',
    fontSize: '1.2rem',
    margin: '0.3rem 2rem'
  }
};

const mode = sessionStorage.getItem('mode');

const AnnotationSearch = props => {
  const [query, setQuery] = useState('');
  const [partialQuery, setPartialQuery] = useState({
    type: lists.type[0],
    criteria: lists.criteria[0],
    term: ''
  });
  const [selectedProject, setSelectedProject] = useState('');
  const [data, setData] = useState([]);
  const [rows, setRows] = useState(0);
  const [selectedAnnotations, setSelectedAnnotations] = useState({});
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [error, setError] = useState('');
  const [bookmark, setBookmark] = useState('');

  const populateSearchResult = (res, pagination) => {
    const result = Array.isArray(res) ? res[0] : res;
    if (pagination) {
      setData(data.concat(result.data.rows));
    } else {
      setData(result.data.rows);
    }
    setRows(result.data.total_rows);
    setBookmark(result.data.bookmark);
    if (result.data.total_rows === 0) {
      toast.info(explanation.noResult, { position: 'top-right' });
    }
  };

  const getAnnotationsOfProjets = () => {
    const promise =
      props.pid === 'all'
        ? getAllAnnotations()
        : getSummaryAnnotations(props.pid);
    Promise.all([promise])
      .then(res => {
        populateSearchResult(res);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (props.searchQuery) {
      searchAnnotations({ query: props.searchQuery })
        .then(res => {
          populateSearchResult(res);
        })
        .catch(err => console.error(err));
    } else {
      getAnnotationsOfProjets();
    }
  }, [props.pid]);

  const insertIntoQueryOnSelection = el => {
    const field = document.getElementsByClassName(
      'form-control annotationSearch-text'
    )[0];
    const start = field.selectionStart;
    if (start === query.length) {
      setQuery(`${query} ${el}`);
    } else {
      const firstPart = query.substring(0, start);
      const secondPart = query.substring(start);
      setQuery(`${firstPart} ${el} ${secondPart}`);
    }
  };

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
                  insertIntoQueryOnSelection(el);
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

  const updateSelectedAims = aimData => {
    props.dispatch(selectAnnotation(aimData));
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
          name="add-button"
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

  const getSearchResult = page => {
    if (query.length === 0) {
      getAnnotationsOfProjets();
    } else {
      let searchQuery = parseQuery();
      setData([]);
      if (selectedProject) searchQuery += ` AND project:${selectedProject}`;
      if (searchQuery) {
        setError('');
        props.setQuery(searchQuery);
        searchAnnotations({ query: searchQuery })
          .then(res => {
            populateSearchResult(res);
          })
          .catch(err => console.error(err));
      }
    }
  };

  const getNewData = bm => {
    getAllAnnotations(bm)
      .then(res => {
        populateSearchResult(res, true);
      })
      .catch(err => console.error(err));
    // get the new data with bookmark
    // concatanate the new 200 lines
  };

  const seperateParanthesis = arr => {
    const result = [];
    arr.forEach(el => {
      if (el.startsWith('(') || el.endsWith(')')) {
        if (el.length > 1) {
          const letterArr = el.split('');
          let closing = '';
          if (letterArr[0] === '(') result.push(letterArr.shift());
          if (letterArr[letterArr.length - 1] === ')') {
            closing = letterArr.pop();
          }
          if (letterArr.length > 0) result.push(letterArr.join(''));
          if (closing) result.push(closing);
        } else {
          result.push(el);
        }
      } else {
        result.push(el);
      }
    });
    return result;
  };

  const isNoOfParanthesisValid = arr => {
    let open = 0;
    let close = 0;
    arr
      .join()
      .split('')
      .forEach(el => {
        if (el === '(') {
          open += 1;
        } else if (el === ')') {
          close += 1;
        }
      });
    return close === open;
  };

  const validateQueryContent = arr => {
    let criteriaArr = [];
    let typeArr = [];
    arr.forEach((el, i) => {
      if (lists.criteria.includes(el)) criteriaArr.push(i);
      else if (lists.type.includes(el)) typeArr.push(i);
    });
    return { criteriaArr, typeArr };
  };

  const validateQueryOrder = arr => {
    let validOrder = true;
    const { criteriaArr, typeArr } = validateQueryContent(arr);
    // there should be equal number of crieria and type
    const sameLength = criteriaArr.length === typeArr.length;

    // type should follow the criteria
    criteriaArr.forEach((el, i) => {
      if (el !== typeArr[i] + 1) validOrder = false;
    });

    return validOrder && sameLength;
  };

  const countCondition = arr => {
    return arr.reduce((all, item) => {
      if (lists.condition.includes(item)) all += 1;
      return all;
    }, 0);
  };

  const validateConditionExists = arr => {
    const { criteriaArr, typeArr } = validateQueryContent(arr);
    const isMultipleSearch = criteriaArr.length > 1 || typeArr.length > 1;
    if (isMultipleSearch) {
      let noOfQuery = 1;
      if (criteriaArr.length === typeArr.length && criteriaArr.length > 1) {
        noOfQuery = criteriaArr.length;
      } else if (criteriaArr.length !== typeArr.length) {
        noOfQuery =
          criteriaArr.length > typeArr.length
            ? criteriaArr.length
            : typeArr.length;
      }
      const noOfCondition = countCondition(arr);
      return noOfQuery === noOfCondition + 1;
    } else return true;
  };

  const checkStartEndWithCondition = arr => {
    // first and last three word can not be AND/OR
    const uppercaseArr = arr.map(el => el.toUpperCase());
    const beginning = uppercaseArr.slice(0, 3);
    const end =
      uppercaseArr.length > 2
        ? uppercaseArr.slice(arr.length - 3)
        : [...uppercaseArr];
    const invalidBeginnig =
      beginning.includes('AND') || beginning.includes('OR');
    const invalidEnd = end.includes('AND') || end.includes('OR');
    return invalidBeginnig || invalidEnd;
  };

  const validateQuery = arr => {
    if (arr[0] === ')') {
      setError('Query can not start with a closing paranthesis');
      return false;
    }

    if (arr[arr.length - 1] === '(') {
      setError('Query can not end with an openning paranthesis');
      return false;
    }

    if (!isNoOfParanthesisValid(arr)) {
      setError(
        'Number of the opening and closing paranthesis should be equal!'
      );
      return false;
    }

    if (!validateQueryOrder(arr)) {
      const fields = lists.type.join(', ');
      const criterias = lists.criteria.join(', ');
      setError(
        `Search field (${fields}) must be followed by a criteria (${criterias})`
        // `Please select a search field:${fields} and a criteria:${criterias}!`
      );
      return false;
    }

    if (!validateConditionExists(arr)) {
      setError(`Multiple queries must be connected with AND/OR conditions!`);
      return false;
    }

    if (checkStartEndWithCondition(arr)) {
      setError(`AND/OR conditions should be used to connect two queries!`);
      return false;
    }
    return true;
  };

  const checkSingleTermQuery = arr => {
    const includeParanthesis = query.includes('(') || query.includes(')');
    const includeOperator =
      query.toUpperCase().includes('AND') || query.toUpperCase().includes('OR');
    const { criteriaArr, typeArr } = validateQueryContent(arr);
    const includeCriteria = criteriaArr.length > 0;
    const includeType = typeArr.length > 0;
    return !(
      includeParanthesis ||
      includeOperator ||
      includeCriteria ||
      includeType
    );
  };

  const parseQuery = () => {
    // check if query contains any predefined words
    const queryArray = seperateParanthesis(query.split(' '));
    let parsedQuery;
    if (checkSingleTermQuery(queryArray)) {
      parsedQuery = query;
    } else {
      const isQueryInputValid = validateQuery(queryArray);
      let criteria = '';
      if (isQueryInputValid) {
        parsedQuery = queryArray.reduce((all, item, index) => {
          if (lists.criteria.includes(item)) {
            all += ':';
            criteria = item;
          } else if (
            item.toLowerCase() === 'and' ||
            item.toLowerCase() === 'or'
          ) {
            all = `${all} ${item.toUpperCase()} `;
          } else if (lists.type.includes(item)) {
            all += `${item}`;
          } else if (lists.paranthesis.includes(item)) {
            all += `${item}`;
          } else {
            if (criteria === 'equals') {
              all += `"${item}"`;
            }
            if (criteria === 'contains') {
              all += `${item}`;
            }
          }
          return all;
        }, '');
      }
    }
    return parsedQuery;
  };

  const renderOptions = () => {
    const projectNames = Object.values(props.projectMap);
    const projectID = Object.keys(props.projectMap);
    const defaultOption = (
      <option key="default" data-project-id={''} value={''}>
        in all ePad
      </option>
    );
    const options = [defaultOption];
    projectNames.forEach((el, i) => {
      if (projectID[i] !== 'all' && projectID[i] !== 'nonassigned') {
        options.push(
          <option
            key={projectID[i]}
            data-project-id={projectID[i]}
            value={projectID[i]}
          >
            {el.projectName}
          </option>
        );
      }
    });
    return options;
  };

  const renderProjectSelect = () => {
    return (
      <div
        className="annotationSearch-cont__item"
        style={{ margin: '1rem 0rem' }}
      >
        <div
          className="annotaionSearch-title"
          style={{ fontsize: '1.2rem' }}
        >{`${explanation.project}`}</div>
        <input
          name="project-dropdown"
          type="checkbox"
          checked={selectedProject === ''}
          onChange={e => {
            if (e.target.checked === false) setSelectedProject(props.pid);
            else setSelectedProject('');
          }}
          onMouseDown={e => e.stopPropagation()}
          style={{ margin: '0rem 1rem', padding: '1.8px' }}
        />
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
          margin: '0.5rem 2rem'
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
            name="query"
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
          name="erase-button"
          data-tip
          data-for="erase-icon"
          className="btn btn-secondary annotationSearch-btn"
          onClick={() => setQuery('')}
          // onClick={parseIt}
          // disabled={index < count}
          style={{
            padding: '0.3rem 0.5rem',
            height: 'fit-content',
            fontSize: '1rem',
            marginTop: '0.1rem',
            width: '5%'
          }}
        >
          <FaEraser />
        </button>
        <ReactTooltip
          id="erase-icon"
          place="bottom"
          type="info"
          delayShow={500}
        >
          <span>Clear query</span>
        </ReactTooltip>
        <button
          className={`btn btn-secondary`}
          type="button"
          name="search-button"
          data-tip
          data-for="search-icon"
          className="btn btn-secondary annotationSearch-btn"
          onClick={getSearchResult}
          // onClick={parseIt}
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
        <ReactTooltip
          id="search-icon"
          place="bottom"
          type="info"
          delayShow={500}
        >
          <span>Search</span>
        </ReactTooltip>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      <div
        style={{
          margin: '0.5rem 2rem'
        }}
      >
        <Collapsible
          trigger="Advanced search"
          triggerClassName="advancedSearch__closed"
          triggerOpenedClassName="advancedSearch__open"
          contentInnerClassName="advancedSearch-content"
        >
          {renderQueryItem()}
          {renderOrganizeItem('organize')}
        </Collapsible>
        {mode !== 'lite' && renderProjectSelect()}
        {Object.keys(props.selectedAnnotations).length !== 0 && (
          <button
            className={`btn btn-secondary`}
            style={styles.downloadButton}
            name="download"
            onClick={() => setDownloadClicked(true)}
            type="button"
            disabled={Object.keys(props.selectedAnnotations).length === 0}
          >
            DOWNLOAD
          </button>
        )}
        {data.length > 0 && (
          <AnnotationTable
            data={data}
            selected={selectedAnnotations}
            updateSelectedAims={updateSelectedAims}
            noOfRows={rows}
            getNewData={getNewData}
            bookmark={bookmark}
          />
        )}
      </div>
      {downloadClicked && (
        <AnnotationDownloadModal
          onSubmit={() => {
            setDownloadClicked(false);
            getSearchResult();
          }}
          onCancel={() => setDownloadClicked(false)}
          updateStatus={() => console.log('update status')}
        />
      )}
    </div>
  );
};

const mapsStateToProps = state => {
  return {
    projectMap: state.annotationsListReducer.projectMap,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};

export default connect(mapsStateToProps)(AnnotationSearch);
