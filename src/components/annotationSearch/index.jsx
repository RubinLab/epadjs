import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FaSearch, FaPlus } from 'react-icons/fa';
import {
  searchAnnotations,
  getAllAnnotations
} from './../../services/annotationServices.js';
import AnnotationTable from './AnnotationTable.jsx';
import './annotationSearch.css';
import { clearSelection, selectAnnotation } from '../annotationsList/action';
import AnnotationDownloadModal from '../searchView/annotationDownloadModal';

const lists = {
  organize: ['AND', 'OR', '(', ')'],
  paranthesis: ['(', ')'],
  condition: ['AND', 'OR'],
  type: ['modality', 'diagnosis', 'anatomy'],
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
  project: 'Select project: ',
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

const AnnotationSearch = props => {
  const [query, setQuery] = useState('');
  const [partialQuery, setPartialQuery] = useState({
    type: lists.type[0],
    criteria: lists.criteria[0],
    term: ''
  });
  const [typeSelected, setTypeSelected] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [data, setData] = useState([]);
  const [rows, setRows] = useState(0);
  const [selectedAnnotations, setSelectedAnnotations] = useState({});
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [error, setError] = useState('');
  const [bookmark, setBookmark] = useState('');

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

  const insertIntoQuery = selection => {
    // get the cursor index and add the selection at that index
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

  // const detactConstant = (str, constant) => {
  //   // const baseQuery = str.toUpperCase();
  //   let result = '';
  //   if (lists[constant]) {
  //     lists[constant].forEach((el, i) => {
  //       // const upperVersion = el.toUpperCase();
  //       if (str.indexOf(el) === 0) {
  //         result = str.substring(0, el.length);
  //       }
  //     });
  //   }
  //   return { result };
  // };

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

  const populateSearchResult = res => {
    setData(data.concat(res.data.rows));
    setRows(res.data.total_rows);
    setBookmark(res.data.bookmark);
  };

  const getSearchResult = page => {
    let query = parseQuery();
    setData([]);
    if (selectedProject) query += ` AND project:${selectedProject}`;
    if (query) {
      setError('');
      searchAnnotations({ query })
        .then(res => {
          populateSearchResult(res);
        })
        .catch(err => console.error(err));
    }
  };

  const getNewData = bm => {
    getAllAnnotations(bm)
      .then(res => {
        populateSearchResult(res);
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
    // query order is type + criteria + term
    const firstAndLastThree = arr.slice(0, 3).concat(arr.slice(arr.length - 3));
    // first and last three word can not be AND/OR
    return (
      firstAndLastThree.includes('AND') || firstAndLastThree.includes('OR')
    );
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

  const parseQuery = () => {
    const queryArray = seperateParanthesis(query.split(' '));
    const isQueryInputValid = validateQuery(queryArray);
    let criteria = '';
    if (isQueryInputValid) {
      const parsedQuery = queryArray.reduce((all, item, index) => {
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
      return parsedQuery;
    }
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
    const projectNames = Object.values(props.projectMap);
    const projectID = Object.keys(props.projectMap);
    return (
      <div
        className="annotationSearch-cont__item"
        style={{ margin: '1rem 0rem' }}
      >
        <div
          className="annotaionSearch-title"
          style={{ fontsize: '1.2rem' }}
        >{`${explanation.project}`}</div>
        <select
          name="project-dropdown"
          onChange={e => setSelectedProject(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
          style={{ margin: '0rem 1rem', padding: '1.8px' }}
        >
          {renderOptions()}
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
          name="search-button"
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
      </div>
      {error && <div style={styles.error}>{error}</div>}
      <div
        style={{
          margin: '0.5rem 2rem'
        }}
      >
        {renderQueryItem()}
        {renderOrganizeItem('organize')}
        {renderProjectSelect()}
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
        {rows === 0 && (
          <div style={{ ...styles.error, margin: '0rem' }}>
            {explanation.noResult}
          </div>
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
