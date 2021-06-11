import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { searchAnnotations } from './../../services/annotationServices.js';
import AnnotationTable from './AnnotationTable.jsx';
import './annotationSearch.css';
import { clearSelection, selectAnnotation } from '../annotationsList/action';
import AnnotationDownloadModal from '../searchView/annotationDownloadModal';
import { id } from 'date-fns/locale';
import { arrayMin } from 'highcharts';

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
  project: 'Select project: '
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
  const [selectedAnnotations, setSelectedAnnotations] = useState({});
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [error, setError] = useState('');

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
    let query = parseQuery();
    setData([]);
    if (selectedProject) query += ` AND project:${selectedProject}`;
    if (query) {
      setError('');
      searchAnnotations({ query })
        .then(res => {
          console.log(res);
          setData(res.data.rows);
        })
        .catch(err => console.error(err));
    }
  };

  const seperateParanthesis = arr => {
    console.log('arr', arr);
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
        `Please select a search field:${fields} and a criteria:${criterias}!`
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
    if (isQueryInputValid) {
      const parsedQuery = queryArray.reduce((all, item, index) => {
        if (lists.criteria.includes(item)) {
          all += ':';
        } else if (
          item.toLowerCase() === 'and' ||
          item.toLowerCase() === 'or'
        ) {
          all = `${all} ${item.toUpperCase()} `;
        } else {
          all += `${item}`;
        }
        return all;
      }, '');
      return parsedQuery;
    }
  };

  /*

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
      } else if (endIndex && (endIndex >= 0 || endIndex === -1)) {
        console.log('endindex -->', endIndex);
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
    }
    console.log('parsedQuery', parsedQuery);
    return parsedQuery;
  };
  */

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
      {error && (
        <div
          style={{
            color: 'orangered',
            padding: '0.3rem 0.5rem',
            height: 'fit-content',
            fontSize: '1.2rem',
            margin: '0.3rem 2rem'
          }}
        >
          {error}
        </div>
      )}
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

        {data.length > 0 && (
          <AnnotationTable
            data={data}
            selected={selectedAnnotations}
            updateSelectedAims={updateSelectedAims}
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
