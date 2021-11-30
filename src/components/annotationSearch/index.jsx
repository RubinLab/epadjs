import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import _ from 'lodash';
import Collapsible from 'react-collapsible';
import { HiOutlineFolderDownload } from 'react-icons/hi';
import {
  FaDownload,
  FaUpload,
  FaRegTrashAlt,
  FaSearch,
  FaPlus,
  FaEraser
} from 'react-icons/fa';
import {
  RiCheckboxMultipleFill,
  RiCheckboxMultipleBlankFill,
  RiCloseCircleFill
} from 'react-icons/ri';
import { FcAbout } from 'react-icons/fc';
import ReactTooltip from 'react-tooltip';
import {
  searchAnnotations,
  getAllAnnotations,
  getSummaryAnnotations,
  downloadProjectAnnotation,
  deleteAnnotationsList
} from './../../services/annotationServices.js';
import AnnotationTable from './AnnotationTable.jsx';
import './annotationSearch.css';
import { clearSelection, selectAnnotation } from '../annotationsList/action';
import AnnotationDownloadModal from '../searchView/annotationDownloadModal';
import UploadModal from '../searchView/uploadModal';
import DeleteAlert from '../management/common/alertDeletionModal';
import ellipse from 'cornerstone-tools/util/ellipse/index.js';
import {
  getPluginsForProject,
  addPluginsToQueue,
  runPluginsQueue
} from '../../services/pluginServices';
const lists = {
  organize: ['AND', 'OR', '(', ')'],
  paranthesis: ['(', ')'],
  condition: ['AND', 'OR'],
  type: [
    'modality',
    'observation',
    'anatomy',
    'lesion_name',
    'patient',
    'template',
    'user',
    'comment'
  ],
  criteria: ['contains'] // 'equals'
};

const pageSize = 200;

const explanation = {
  deleteSelected: 'Delete selected annotations? This cannot be undone.',
  organize: 'Group and/or organize your query: ',
  type: 'Select a field from annotation',
  criteria: 'Select a criteria',
  term: 'Type the key word that you want to look for above',
  project: 'Search in all ePAD',
  noResult: 'Can not find any result!',
  downloadProject:
    'Preparing project for download. The link to the files will be sent with a notification after completion!',
  pluginAnnotations: 'you need to select an annotation'
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
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [error, setError] = useState('');
  const [bookmark, setBookmark] = useState('');
  const [uploadClicked, setUploadClicked] = useState(false);
  const [deleteSelectedClicked, setDeleteSelectedClicked] = useState(false);
  const [checkboxSelected, setCheckboxSelected] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  // cavit
  const [showPlugins, setShowPluginDropdown] = useState(false);
  const [pluginListArray, setpluginListArray] = useState([]);
  const [selectedPluginDbId, setSelectedPluginDbId] = useState(-1);
  const [showRunPluginButton, setShowRunPluginButton] = useState(false);
  // cavit

  const populateSearchResult = (res, pagination, afterDelete) => {
    const result = Array.isArray(res) ? res[0] : res;
    if ((typeof pagination === 'number' || pagination) && !afterDelete) {
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

  const getAnnotationsOfProjets = pageIndex => {
    const bm = pageIndex ? bookmark : '';
    const promise =
      props.pid === 'all'
        ? getAllAnnotations(bm)
        : getSummaryAnnotations(props.pid, bm);
    Promise.all([promise])
      .then(res => {
        populateSearchResult(res, pageIndex);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    setSelectedProject(props.pid);
    setQuery('');
    setBookmark('');
    setCheckboxSelected(false);
    props.dispatch(clearSelection());

    if (props.searchQuery) {
      const searchQueryFinal = Object.keys(props.searchQuery)[0];
      const searchQueryText = Object.values(props.searchQuery)[0].query;
      const searchQueryProject = Object.values(props.searchQuery)[0].project;
      setQuery(searchQueryText);
      setSelectedProject(searchQueryProject || '');
      searchAnnotations({ query: searchQueryFinal })
        .then(res => {
          populateSearchResult(res);
        })
        .catch(err => console.error(err));
    } else {
      getAnnotationsOfProjets();
    }
    // cavit
    setShowRunPluginButton(false);
    setSelectedPluginDbId(-1);
    getPluginProjects();
    // cavit
  }, [props.pid]);

  const handleUserKeyPress = e => {
    if (e.key === 'Enter') {
      getSearchResult();
      setPageIndex(0);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

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

  const getSearchResult = (pageIndex, afterDelete) => {
    setPageIndex(0);
    if (query.length === 0) {
      getAnnotationsOfProjets();
    } else {
      let searchQuery = parseQuery();
      // setData([]);
      if (selectedProject) {
        const multiSearch =
          searchQuery.includes('AND') || searchQuery.includes('OR');
        const notHaveParanthesis =
          searchQuery[0] !== '(' || searchQuery[searchQuery.length - 1] !== ')';
        if (multiSearch && notHaveParanthesis)
          searchQuery = `(${searchQuery}) AND project:${selectedProject}`;
        else searchQuery += ` AND project:${selectedProject}`;
      }
      if (searchQuery) {
        // setError('');
        const queryToSave = {
          [searchQuery]: {
            query,
            project: selectedProject
          }
        };
        props.setQuery(queryToSave);
        const bm = pageIndex ? bookmark : '';

        searchAnnotations({ query: searchQuery }, bm)
          .then(res => {
            populateSearchResult(res, pageIndex, afterDelete);
          })
          .catch(err => console.error(err));
      }
    }
  };

  const getNewData = (pageIndex, afterDelete) => {
    if (query) {
      getSearchResult(pageIndex, afterDelete);
    } else {
      getAnnotationsOfProjets(pageIndex);
    }
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
      );
      return false;
    }

    if (!validateConditionExists(arr)) {
      setError(`Multiple queries must be connected with AND/OR conditions!`);
      return false;
    }

    if (checkStartEndWithCondition(arr)) {
      setError(
        `AND/OR conditions should be used to connect two queries. Please use advanced search to build a query.`
      );
      return false;
    }
    return true;
  };

  const checkSingleTermQuery = arr => {
    const includeParanthesis = query.includes('(') || query.includes(')');
    const { criteriaArr, typeArr } = validateQueryContent(arr);
    const includeCriteria = criteriaArr.length > 0;
    const includeType = typeArr.length > 0;
    return !(includeParanthesis || includeCriteria || includeType);
  };

  // const handleWhitespace = text => {
  //   let result = text.trim().replace(/ {2,}/g, ' ');
  //   if (result.includes(' ')) {
  //     result = result.split(' ').reduce((all, item, i) => {
  //       if (item === ' ') all += `\\${item}`;
  //       return all;
  //     }, '');
  //   }
  //   return result;
  // };

  // if quoted, handle space and do 2 search combined with OR
  // if not quoted check if there is white space, if there is a white space check for a single letter if there is a single letter wrap with double quote
  // if there is a single letter wrap with doublequote

  const replaceWithCaret = text => {
    return text
      .trim()
      .split('')
      .reduce((all, item) => {
        return item === ' ' ? all + '^' : all + item;
      }, '');
  };
  const handleWhiteSpaceinQuote = text => {
    const wrappedInQuote = text.startsWith('"') && text.endsWith('"');
    const hasWhiteSpace = text.includes(' ');
    let caretAddedQuery = '';
    let handleSingleChar = text.includes(' ')
      ? text
          .split(' ')
          .map(item => handleSingleLetter(item))
          .join(' ')
      : handleSingleLetter(text);
    if (wrappedInQuote && hasWhiteSpace) {
      caretAddedQuery = replaceWithCaret(handleSingleChar);
    }
    return [handleSingleChar, caretAddedQuery];
  };

  const handleSingleLetter = q => (q.length === 1 ? `"${q}"` : q);

  // if text has double quotes should look for caret version too
  const addCaretVersion = (parsedQueryArr, all) => {
    if (parsedQueryArr[1]) {
      const allArr = all.split(' ');
      const len = allArr.length;
      if (allArr[len - 1].length > 0 && allArr[len - 1].includes(':')) {
        const str = `(${allArr[len - 1]}${parsedQueryArr[0]} OR ${
          allArr[len - 1]
        }${parsedQueryArr[1]})`;
        allArr.splice(len - 1, 1, str);
        all = allArr.join(' ');
      }
    } else {
      all += parsedQueryArr[0];
    }
    return all;
  };

  const parseQuery = () => {
    // check if query contains any predefined words
    const queryArray = seperateParanthesis(query.trim().split(' '));
    let parsedQuery;
    if (checkSingleTermQuery(queryArray)) {
      // wrap single letter in double qute
      // if caret added query combine with or
      const parsedQueryArr = handleWhiteSpaceinQuote(query);
      parsedQuery = parsedQueryArr[1]
        ? `${parsedQueryArr[0]} OR ${parsedQueryArr[1]}`
        : parsedQueryArr[0];
    } else {
      const isQueryInputValid = validateQuery(queryArray);
      let criteria = '';
      if (isQueryInputValid) {
        // form a variable to collect
        let parsedQueryString = '';
        parsedQuery = queryArray.reduce((all, item, index) => {
          if (lists.criteria.includes(item)) {
            all += ':';
            criteria = item;
          } else if (
            item.toLowerCase() === 'and' ||
            item.toLowerCase() === 'or'
          ) {
            if (parsedQueryString.length > 0) {
              const parsedQueryArr = handleWhiteSpaceinQuote(parsedQueryString);
              all = addCaretVersion(parsedQueryArr, all);
              parsedQueryString = '';
            }
            all = `${all} ${item.toUpperCase()} `;
          } else if (lists.type.includes(item)) {
            if (parsedQueryString.length > 0) {
              const parsedQueryArr = handleWhiteSpaceinQuote(parsedQueryString);
              all = addCaretVersion(parsedQueryArr, all);
              parsedQueryString = '';
            }
            if (item === 'patient') {
              all += 'patient_name';
            } else if (item === 'template') {
              all += 'template_code';
            } else if (item === 'lesion_name') {
              all += 'name';
            } else all += `${item}`;
            parsedQueryString = '';
          } else if (lists.paranthesis.includes(item)) {
            if (item === ')' && parsedQueryString.length > 0) {
              const parsedQueryArr = handleWhiteSpaceinQuote(parsedQueryString);
              all = addCaretVersion(parsedQueryArr, all);
              parsedQueryString = '';
            }
            all += `${item}`;
            parsedQueryString = '';
          } else {
            // check if it is the end of the query
            // if it is end of the query do the same with above (add to all)
            parsedQueryString =
              parsedQueryString.length > 0
                ? `${parsedQueryString} ${item}`
                : item;
            if (index === queryArray.length - 1) {
              const parsedQueryArr = handleWhiteSpaceinQuote(parsedQueryString);
              all = addCaretVersion(parsedQueryArr, all);
              parsedQueryString = '';
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

  const handleMultipleSelect = action => {
    const pages = Math.ceil(props.rows / pageSize);
    const indexStart = pageIndex * pageSize;
    const indexEnd =
      pageIndex + 1 === pages ? rows : pageSize * (pageIndex + 1);
    const arrayToSelect = data.slice(indexStart, indexEnd);
    if (action === 'selectPageAll') {
      arrayToSelect.forEach(el => {
        if (!props.selectedAnnotations[el.aimID])
          props.dispatch(selectAnnotation(el));
      });
    } else if (action === 'unselectPageAll') {
      arrayToSelect.forEach(el => {
        if (props.selectedAnnotations[el.aimID])
          props.dispatch(selectAnnotation(el));
      });
    } else if (action === 'unselectAll') {
      props.dispatch(clearSelection());
    }
  };

  const triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.style = 'display: none';
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadProjectAim = () => {
    if (props.pid === 'all' || props.pid === 'nonassigned') return;
    downloadProjectAnnotation(props.pid)
      .then(result => {
        if (result.data.type === 'application/octet-stream') {
          let blob = new Blob([result.data], { type: 'application/zip' });
          triggerBrowserDownload(blob, `Project ${props.pid}`);
        } else
          toast.success(explanation.downloadProject, {
            autoClose: false,
            position: 'bottom-left'
          });
      })
      .catch(err => console.error(err));
  };

  const renderProjectSelect = () => {
    return (
      <div
        className="annotationSearch-cont__item"
        style={{ margin: '1rem 0rem' }}
      >
        <div
          className="searchView-toolbar__group"
          style={{ padding: '0.2rem' }}
        >
          <>
            <RiCheckboxMultipleFill
              className="tool-icon"
              data-tip
              data-for="selectPageAll-icon"
              style={{ fontSize: '1.4rem' }}
              onClick={() => handleMultipleSelect('selectPageAll')}
            />
            <ReactTooltip
              id="selectPageAll-icon"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Select rows on page</span>
            </ReactTooltip>
          </>
          <>
            <RiCheckboxMultipleBlankFill
              className="tool-icon"
              data-tip
              data-for="unselectPageAll-icon"
              style={{ fontSize: '1.4rem' }}
              onClick={() => handleMultipleSelect('unselectPageAll')}
            />
            <ReactTooltip
              id="unselectPageAll-icon"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Unselect rows on page</span>
            </ReactTooltip>
          </>
          <>
            <RiCloseCircleFill
              className="tool-icon"
              data-tip
              data-for="unSelectAll-icon"
              style={{ fontSize: '1.4rem' }}
              onClick={() => handleMultipleSelect('unselectAll')}
            />
            <ReactTooltip
              id="unSelectAll-icon"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Unselect all</span>
            </ReactTooltip>
          </>
        </div>
        <div
          className="searchView-toolbar__group"
          style={{ padding: '0.2rem' }}
        >
          <>
            <div onClick={() => setUploadClicked(true)}>
              <FaUpload className="tool-icon" data-tip data-for="upload-icon" />
            </div>
            <ReactTooltip
              id="upload-icon"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Upload files</span>
            </ReactTooltip>
          </>
          <>
            <div onClick={() => setDownloadClicked(true)}>
              <FaDownload
                className="tool-icon"
                data-tip
                data-for="download-icon"
              />
            </div>
            <ReactTooltip
              id="download-icon"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Download selections</span>
            </ReactTooltip>
          </>
          <>
            <div onClick={downloadProjectAim}>
              <HiOutlineFolderDownload
                className={
                  props.pid === 'all_aims' ? 'hide-delete' : 'tool-icon'
                }
                data-tip
                data-for="downloadProject-icon"
                style={{ fontSize: '1.7rem' }}
              />
            </div>
            <ReactTooltip
              id="downloadProject-icon"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">
                Download all annotations of the project
              </span>
            </ReactTooltip>
          </>
          <>
            <div onClick={() => setDeleteSelectedClicked(true)}>
              <FaRegTrashAlt
                className="tool-icon"
                // className="tool-icon"
                // onClick={onDelete}
                style={
                  Object.keys(props.selectedAnnotations).length === 0
                    ? {
                        fontSize: '1.1rem',
                        color: 'rgb(107, 107, 107)',
                        cursor: 'not-allowed'
                      }
                    : null
                }
                data-tip
                data-for="trash-icon"
              />
            </div>
            <ReactTooltip
              id="trash-icon"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Delete selections</span>
            </ReactTooltip>
          </>
        </div>
        {mode !== 'lite' && (
          <div
            className="searchView-toolbar__group"
            style={{ padding: '0.2rem' }}
          >
            {' '}
            <div
              className="annotaionSearch-title"
              style={{ fontsize: '1.2rem' }}
            >{`${explanation.project}`}</div>
            <input
              name="project-dropdown"
              type="checkbox"
              checked={checkboxSelected}
              onChange={e => {
                if (e.target.checked === false) {
                  setSelectedProject(selectedProject);
                  setCheckboxSelected(false);
                } else {
                  setSelectedProject('');
                  setCheckboxSelected(true);
                }
                setBookmark('');
              }}
              onMouseDown={e => e.stopPropagation()}
              style={{ margin: '0rem 1rem', padding: '1.8px' }}
            />{' '}
          </div>
        )}
        <div
          className="searchView-toolbar__group"
          style={{ padding: '0.2rem' }}
        >
          <div
            style={{ fontSize: '1.2rem', color: 'aliceblue' }}
            onClick={() => {
              //  console.log(JSON.stringify(props.selectedAnnotations));
              //  console.log(props.pid);
              getPluginProjects();
            }}
          >
            select plugin :{' '}
          </div>
          {showPlugins && (
            <div>
              <select
                style={{ fontSize: '1.1rem', marginLeft: '5px', marginRight: '10px' }}
                className="pluginaddqueueselect"
                id="plugins"
                onChange={handleChangePlugin}
                value={selectedPluginDbId}
              >
                <option key="-1" value="-1">
                  select
                </option>
                {prepareDropDownHtmlForPlugins()}
              </select>
            </div>
          )}
          {showRunPluginButton && (
            <div>
              <button
                style={{
                  fontSize: '1.2rem',
                  background: '#861737',
                  marginLeft: '5px'
                }}
                variant="primary"
                className="btn btn-sm btn-outline-light"
                onClick={runPlugin}
              >
                run
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSubmitUpload = () => {
    setUploadClicked(false);
    getAnnotationsOfProjets();
  };

  const checkIfSerieOpen = (obj, openSeries) => {
    let isOpen = false;
    let index;
    const { seriesUID, projectID } = obj;
    openSeries.forEach((serie, i) => {
      if (serie.seriesUID === seriesUID && projectID === serie.projectID) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  const deleteAllSelected = () => {
    const notDeleted = {};
    let newSelected = Object.assign({}, props.selectedAnnotations);
    const toBeDeleted = {};
    const promiseArr = [];
    for (let annotation in newSelected) {
      const { projectID } = newSelected[annotation];
      if (checkIfSerieOpen(newSelected[annotation], props.openSeries).isOpen) {
        notDeleted[annotation] = newSelected[annotation];
        delete newSelected[annotation];
      } else {
        toBeDeleted[projectID]
          ? toBeDeleted[projectID].push(annotation)
          : (toBeDeleted[projectID] = [annotation]);
      }
    }
    const projects = Object.keys(toBeDeleted);
    const aims = Object.values(toBeDeleted);

    projects.forEach((pid, i) => {
      promiseArr.push(deleteAnnotationsList(pid, aims[i]));
    });

    Promise.all(promiseArr)
      .then(() => {
        getNewData(pageIndex, true);
      })
      .catch(error => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        )
          toast.error(error.response.data.message, { autoClose: false });
        getNewData(pageIndex, true);
      });
    setDeleteSelectedClicked(false);
    props.dispatch(clearSelection());
  };
  // cavit
  const prepareDropDownHtmlForPlugins = () => {
    console.log(showPlugins);
    console.log(pluginListArray);
    const list = pluginListArray;
    let options = [];
    for (let i = 0; i < list.length; i++) {
      options.push(
        <option key={list[i].id} value={list[i].id}>
          {list[i].name}
        </option>
      );
    }

    return options;
  };

  const getPluginProjects = async () => {
    const { data: dataplugin } = await getPluginsForProject(props.pid);
    if (dataplugin) {
      setpluginListArray(dataplugin.projectplugin);
    } else {
      setpluginListArray([]);
    }
    setShowPluginDropdown(true);
  };

  const handleChangePlugin = e => {
    const tempSelectedPluign = parseInt(e.target.value);
    console.log(parseInt(e.target.value));
    setSelectedPluginDbId(parseInt(e.target.value));
    if (tempSelectedPluign > -1) {
      setShowRunPluginButton(true);
    } else {
      setShowRunPluginButton(false);
    }
  };

  const runPlugin = async () => {
    console.log(
      `selected aims to pass to plugin : ${JSON.stringify(
        props.selectedAnnotations
      )}`
    );

    let tempPluginObject = {};
    for (let i = 0; i < pluginListArray.length; i++) {
      if (pluginListArray[i].id === selectedPluginDbId) {
        tempPluginObject = { ...pluginListArray[i] };
        break;
      }
    }


      if (tempPluginObject.processmultipleaims === null){

      
                  const tempQueueObject = {};
                  tempQueueObject.projectDbId = tempPluginObject.project_plugin.project_id;
                  tempQueueObject.projectId = props.selectedProject;
                  tempQueueObject.projectName = '';

                  tempQueueObject.pluginDbId = tempPluginObject.id;
                  tempQueueObject.pluginId =tempPluginObject.plugin_id;
                  tempQueueObject.pluginName =tempPluginObject.name;
                  tempQueueObject.pluginType = "local";
                  tempQueueObject.processMultipleAims = tempPluginObject.processmultipleaims;
                  tempQueueObject.runtimeParams = {};
                  tempQueueObject.parameterType ='default';
                  tempQueueObject.aims = {};
                  
                  
                  const resultAddQueue = await addPluginsToQueue(tempQueueObject);
                  let responseRunPluginsQueue = null;
                  console.log('plugin running queue ',JSON.stringify(resultAddQueue));
                  // if (resultAddQueue && resultAddQueue.data){
                  //   if (Array.isArray(resultAddQueue.data)){
                  //     responseRunPluginsQueue = await runPluginsQueue(resultAddQueue.data[0].id);
                  //   }else{
                  //     responseRunPluginsQueue = await runPluginsQueue(resultAddQueue.data.id);
                  //   }
                  // }
                  
                //  if (responseRunPluginsQueue.status === 202) {
                //     console.log("queue is running case null");
                //  } else {
                //     console.log("error happened while running queue");
                //  }
          } else if (tempPluginObject.processmultipleaims === 0){
            Object.keys(props.selectedAnnotations).forEach(async (eachAnnt) => {

              let aimObj = {};
              aimObj[eachAnnt] = props.selectedAnnotations[eachAnnt];
             
              console.log(`eachAnnt : ${JSON.stringify(aimObj)}`);
            
            
           

            
                  const tempQueueObject = {};
                  tempQueueObject.projectDbId = tempPluginObject.project_plugin.project_id;
                  tempQueueObject.projectId = props.selectedProject;
                  tempQueueObject.projectName = '';

                  tempQueueObject.pluginDbId = tempPluginObject.id;
                  tempQueueObject.pluginId =tempPluginObject.plugin_id;
                  tempQueueObject.pluginName =tempPluginObject.name;
                  tempQueueObject.pluginType = "local";
                  tempQueueObject.processMultipleAims = tempPluginObject.processmultipleaims;
                  tempQueueObject.runtimeParams = {};
                  tempQueueObject.parameterType ='default';
                  tempQueueObject.aims = aimObj;

                  
                  const resultAddQueue = await addPluginsToQueue(tempQueueObject);
                  let responseRunPluginsQueue = null;
                  console.log('plugin running queue ',JSON.stringify(resultAddQueue));
                  // if (resultAddQueue && resultAddQueue.data){
                  //   if (Array.isArray(resultAddQueue.data)){
                  //     responseRunPluginsQueue = await runPluginsQueue(resultAddQueue.data[0].id);
                  //   }else{
                  //     responseRunPluginsQueue = await runPluginsQueue(resultAddQueue.data.id);
                  //   }
                  // }
                  
                  // if (responseRunPluginsQueue.status === 202) {
                  //   console.log("queue is running case 0 - 1 annot req");
                  // } else {
                  //   console.log("error happened while running queue");
                  // }
                })
          }else {

                  const tempQueueObject = {};
                  tempQueueObject.projectDbId = tempPluginObject.project_plugin.project_id;
                  tempQueueObject.projectId = props.selectedProject;
                  tempQueueObject.projectName = '';

                  tempQueueObject.pluginDbId = tempPluginObject.id;
                  tempQueueObject.pluginId =tempPluginObject.plugin_id;
                  tempQueueObject.pluginName =tempPluginObject.name;
                  tempQueueObject.pluginType = "local";
                  tempQueueObject.processMultipleAims = tempPluginObject.processmultipleaims;
                  tempQueueObject.runtimeParams = {};
                  tempQueueObject.parameterType ='default';
                  if (props && props.selectedAnnotations){
                    tempQueueObject.aims = { ...props.selectedAnnotations };
                  }else{
                    tempQueueObject.aims = {};
                  }
                  
                  const resultAddQueue = await addPluginsToQueue(tempQueueObject);
                  let responseRunPluginsQueue = null;
                  console.log('plugin running queue ',JSON.stringify(resultAddQueue));
                  // if (resultAddQueue && resultAddQueue.data){
                  //   if (Array.isArray(resultAddQueue.data)){
                  //     responseRunPluginsQueue = await runPluginsQueue(resultAddQueue.data[0].id);
                  //   }else{
                  //     responseRunPluginsQueue = await runPluginsQueue(resultAddQueue.data.id);
                  //   }
                  // }
                  
                //  if (responseRunPluginsQueue.status === 202) {
                //     console.log("queue is running case  1 multi  annot required");
                //   } else {
                //     console.log("error happened while running queue");
                //  }

    }
    setSelectedPluginDbId(-1);
    setShowRunPluginButton(false);
    // updateSelectedAims;
    // getSearchResult();
  };
  // cavit
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
        <>
          <FcAbout
            data-tip
            data-for="about-icon"
            style={{ fontSize: '2rem' }}
            className="annotationSearch-btn"
          />
          <ReactTooltip
            id="about-icon"
            place="bottom"
            type="info"
            delayShow={200}
          >
            <p>
              <span>For exact match, use double quote: "7 3225"</span>
            </p>
            <p>For complex queries, combine terms with AND/OR:</p>
            <p>RECIST_v2 AND CT</p>
          </ReactTooltip>
        </>
        <button
          className={`btn btn-secondary`}
          type="button"
          name="erase-button"
          data-tip
          data-for="erase-icon"
          className="btn btn-secondary annotationSearch-btn"
          onClick={() => {
            setQuery('');
            setCheckboxSelected(false);
            getAnnotationsOfProjets();
            props.dispatch(clearSelection());
            props.setQuery('');
            setPageIndex(0);
          }}
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
        {renderProjectSelect()}
        {/* {Object.keys(props.selectedAnnotations).length !== 0 && (
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
        )} */}
        {data.length > 0 && (
          <AnnotationTable
            data={data}
            selected={props.selectedAnnotations}
            updateSelectedAims={updateSelectedAims}
            noOfRows={rows}
            getNewData={getNewData}
            bookmark={bookmark}
            switchToDisplay={() => props.history.push('/display')}
            pid={props.pid}
            setPageIndex={setPageIndex}
            indexFromParent={pageIndex}
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
      {uploadClicked && (
        <UploadModal
          onCancel={() => setUploadClicked(false)}
          onResolve={handleSubmitUpload}
          className="mng-upload"
          // projectID={this.state.projectID}
          pid={props.pid}
          // clearTreeData={this.props.clearTreeData}
          // clearTreeExpand={this.props.clearTreeExpand}
        />
      )}
      {deleteSelectedClicked && (
        <DeleteAlert
          message={explanation.deleteSelected}
          onCancel={() => setDeleteSelectedClicked(false)}
          onDelete={deleteAllSelected}
          error={explanation.errorMessage}
        />
      )}
    </div>
  );
};

const mapsStateToProps = state => {
  return {
    projectMap: state.annotationsListReducer.projectMap,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    openSeries: state.annotationsListReducer.openSeries
  };
};

export default connect(mapsStateToProps)(AnnotationSearch);
