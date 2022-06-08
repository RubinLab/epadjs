import React, { useState, useEffect, useCallback } from 'react';
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
import { BiSearch, BiX, BiTrash, BiDownload } from 'react-icons/bi';
import { BsEyeFill } from 'react-icons/bs';
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai';
import ReactTooltip from 'react-tooltip';
import {
  searchAnnotations,
  getAllAnnotations,
  getSummaryAnnotations,
  downloadProjectAnnotation,
  deleteAnnotationsList
} from '../../services/annotationServices.js';
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
import TeachingFilters from './TeachingFilters.jsx';
import Worklists from '../searchView/addWorklist';
import Spinner from 'react-bootstrap/Spinner';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [checkboxSelected, setCheckboxSelected] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  // cavit
  const [showPlugins, setShowPluginDropdown] = useState(false);
  const [pluginListArray, setpluginListArray] = useState([]);
  const [selectedPluginDbId, setSelectedPluginDbId] = useState(-1);
  const [showRunPluginButton, setShowRunPluginButton] = useState(false);
  // cavit

  const [firstRun, setFirstRun] = useState(true);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [selectedMods, setSelectedMods] = useState([]);
  const [selectedAnatomies, setSelectedAnatomies] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState([]);
  const [tfOnly, setTfOnly] = useState(false);
  const [myCases, setMyCases] = useState(false);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showWorklist, setShowWorklist] = useState(false);
  const [selecteds, setSelecteds] = useState([]);

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

  const getAnnotationsOfProjets = (pageIndex, afterdelete) => {
    const bm = pageIndex ? bookmark : '';
    const promise =
      props.pid === 'all'
        ? getAllAnnotations(bm)
        : getSummaryAnnotations(props.pid, bm);
    Promise.all([promise])
      .then(res => {
        populateSearchResult(res, pageIndex, afterdelete);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (mode === "teaching")
      return;
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
      searchAnnotations({ query: escapeSlashesQuery(searchQueryFinal) })
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

  const handleUserKeyPress = (e => {
    if (e.key === 'Enter') {
      if (mode !== 'teaching') {
        getSearchResult();
        setPageIndex(0);
      }
      else {
        getFieldSearchResults();
        setPageIndex(0);
      }
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const useDebouncedEffect = (effect, deps, delay) => {
    useEffect(() => {
      const handler = setTimeout(() => effect(), delay);
      return () => { persistSearch(); clearTimeout(handler) };
    }, [...deps || [], delay]);
  }

  useDebouncedEffect(() => {
    if (selectedProject !== props.pid)
      setSelectedProject(props.pid);
    if (firstRun) {
      if (sessionStorage.searchState) {
        loadSearchState();
      }
      setFirstRun(false);
      return;
    }
    getFieldSearchResults();
    setPageIndex(0);
    // return persistSearch;
  }, [tfOnly, myCases, selectedSubs, selectedMods, selectedAnatomies, selectedDiagnosis, props.pid, query, sort, filters], 500)

  const handleSort = (column) => {
    if (!sort.length || (sort[0] !== column && sort[0] !== ("-" + column)))
      setSort([column]);
    else if (sort[0] === column) {
      console.log("-" + column);
      setSort(["-" + column]);
    }
    else if (sort[0] === ("-" + column))
      setSort([]);
  }

  const handleFilter = (column, target) => {
    const { value } = target;
    const newFilters = { ...filters };
    if (value.length)
      newFilters[column] = value;
    else if (newFilters[column] && value === '')
      delete newFilters[column];
    setFilters(newFilters);
  }
  // useDebouncedEffect(() => {
  //   console.log("Dbounce first", firstRun);
  //   if (firstRun)
  //     return;
  //   if (mode === 'teaching')
  //     getFieldSearchResults();
  // }, [query], 500);

  const clearSubspecialty = (sub) => {
    let index = selectedSubs.indexOf(sub);
    setSelectedSubs(selectedSubs.filter((_, i) => i !== index));
  }

  const clearModality = (mod) => {
    let index = selectedMods.indexOf(mod);
    setSelectedMods(selectedMods.filter((_, i) => i !== index));
  }

  const clearAnatomy = (anatomy) => {
    let index = selectedAnatomies.indexOf(anatomy);
    setSelectedAnatomies(selectedAnatomies.filter((_, i) => i !== index));
  }

  const clearDiagnosis = (diagnose) => {
    let index = selectedDiagnosis.indexOf(diagnose);
    setSelectedDiagnosis(selectedDiagnosis.filter((_, i) => i !== index));
  }

  const persistSearch = () => {
    const searchState = { tfOnly, myCases, selectedSubs, selectedMods, selectedAnatomies, selectedDiagnosis, query, selectedProject, filters, sort };
    sessionStorage.searchState = JSON.stringify(searchState);
  }

  const loadSearchState = () => {
    const searchState = JSON.parse(sessionStorage.searchState);
    const { tfOnly, myCases, selectedSubs, selectedMods, selectedAnatomies, selectedDiagnosis, query, selectedProject, filters, sort } = searchState;
    if (tfOnly !== undefined)
      setTfOnly(tfOnly);
    if (myCases !== undefined)
      setMyCases(myCases);
    if (selectedSubs.length)
      setSelectedSubs(selectedSubs);
    if (selectedMods.length)
      setSelectedMods(selectedMods);
    if (selectedAnatomies)
      setSelectedAnatomies(selectedAnatomies);
    if (selectedDiagnosis)
      setSelectedDiagnosis(selectedDiagnosis);
    if (query)
      setQuery(query);
    if (selectedProject)
      setSelectedProject(selectedProject);
    if (filters)
      setFilters(filters);
    if (sort.length)
      setSort(sort);
  }

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

  const escapeSlashesString = str => {
    const projectComponents = str.includes('project') ? str.split(':') : null;
    const word = projectComponents ? str.split(':')[1] : str;
    let result = word.split('').reduce((all, item, index) => {
      if (item === '/') {
        return (all += '\\' + item);
      } else {
        return (all += item);
      }
    }, '');
    result = result.includes('/') ? `\"${result}\"` : result;
    return projectComponents ? `project:${result}` : result;
  };

  const escapeSlashesQuery = q => {
    return q.split(' ').reduce((all, item, index) => {
      return (all += `${escapeSlashesString(item)} `);
    }, '');
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
      getAnnotationsOfProjets(pageIndex, afterDelete);
    }
    else {
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

        searchAnnotations({ query: escapeSlashesQuery(searchQuery) }, bm)
          .then(res => {
            populateSearchResult(res, pageIndex, afterDelete);
          })
          .catch(err => console.error(err));
      }
    }
  };

  const getFieldSearchResults = (pageIndex, afterDelete) => {
    setShowSpinner(true);
    const bm = pageIndex ? bookmark : '';
    const fields = {};
    if (props.pid)
      fields['project'] = props.pid;
    if (query.length) {
      fields['query'] = query;
    }
    if (selectedSubs.length)
      fields['subSpecialty'] = selectedSubs;
    if (selectedMods.length)
      fields['modality'] = selectedMods;
    if (selectedAnatomies.length)
      fields['anatomy'] = selectedAnatomies
    if (selectedDiagnosis.length)
      fields['diagnosis'] = selectedDiagnosis;
    if (tfOnly)
      fields['teachingFiles'] = tfOnly;
    if (myCases)
      fields['myCases'] = myCases;
    let body = {};
    if (sort.length) {
      body = { fields, sort };
    } else
      body = { fields };
    if (Object.keys(filters).length)
      body['filters'] = filters;
    searchAnnotations(body, bm)
      .then(res => {
        populateSearchResult(res, pageIndex, afterDelete);
        setShowSpinner(false);
      })
      .catch(err => { console.error(err); setShowSpinner(false); });
  }

  const getNewData = (pageIndex, afterDelete) => {
    if (query) {
      getSearchResult(pageIndex, afterDelete);
    } else {
      getAnnotationsOfProjets(pageIndex, afterDelete);
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
        const str = `(${allArr[len - 1]}${parsedQueryArr[0]} OR ${allArr[len - 1]
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
            <div onClick={() => setShowDeleteModal(true)}>
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
                  const project =
                    props.searchQuery &&
                      Object.values(props.searchQuery)[0].project
                      ? Object.values(props.searchQuery)[0].project
                      : props.pid;
                  setSelectedProject(project);
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
              getPluginProjects();
            }}
          >
            select plugin :{' '}
          </div>
          {showPlugins && (
            <div>
              <select
                style={{
                  fontSize: '1.1rem',
                  marginLeft: '5px',
                  marginRight: '10px'
                }}
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
    setShowDeleteModal(false);
    props.dispatch(clearSelection());
  };
  // cavit
  const prepareDropDownHtmlForPlugins = () => {
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

    if (tempPluginObject.processmultipleaims === null) {
      const tempQueueObject = {};
      tempQueueObject.projectDbId = tempPluginObject.project_plugin.project_id;
      tempQueueObject.projectId = props.selectedProject;
      tempQueueObject.projectName = '';

      tempQueueObject.pluginDbId = tempPluginObject.id;
      tempQueueObject.pluginId = tempPluginObject.plugin_id;
      tempQueueObject.pluginName = tempPluginObject.name;
      tempQueueObject.pluginType = 'local';
      tempQueueObject.processMultipleAims =
        tempPluginObject.processmultipleaims;
      tempQueueObject.runtimeParams = {};
      tempQueueObject.parameterType = 'default';
      tempQueueObject.aims = {};

      const resultAddQueue = await addPluginsToQueue(tempQueueObject);
      let responseRunPluginsQueue = null;
      // console.log('plugin running queue ', JSON.stringify(resultAddQueue));
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
    } else if (tempPluginObject.processmultipleaims === 0) {
      Object.keys(props.selectedAnnotations).forEach(async eachAnnt => {
        let aimObj = {};
        aimObj[eachAnnt] = props.selectedAnnotations[eachAnnt];

        console.log(`eachAnnt : ${JSON.stringify(aimObj)}`);

        const tempQueueObject = {};
        tempQueueObject.projectDbId =
          tempPluginObject.project_plugin.project_id;
        tempQueueObject.projectId = props.selectedProject;
        tempQueueObject.projectName = '';

        tempQueueObject.pluginDbId = tempPluginObject.id;
        tempQueueObject.pluginId = tempPluginObject.plugin_id;
        tempQueueObject.pluginName = tempPluginObject.name;
        tempQueueObject.pluginType = 'local';
        tempQueueObject.processMultipleAims =
          tempPluginObject.processmultipleaims;
        tempQueueObject.runtimeParams = {};
        tempQueueObject.parameterType = 'default';
        tempQueueObject.aims = aimObj;

        const resultAddQueue = await addPluginsToQueue(tempQueueObject);
        let responseRunPluginsQueue = null;
        console.log('plugin running queue ', JSON.stringify(resultAddQueue));
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
      });
    } else {
      const tempQueueObject = {};
      tempQueueObject.projectDbId = tempPluginObject.project_plugin.project_id;
      tempQueueObject.projectId = props.selectedProject;
      tempQueueObject.projectName = '';

      tempQueueObject.pluginDbId = tempPluginObject.id;
      tempQueueObject.pluginId = tempPluginObject.plugin_id;
      tempQueueObject.pluginName = tempPluginObject.name;
      tempQueueObject.pluginType = 'local';
      tempQueueObject.processMultipleAims =
        tempPluginObject.processmultipleaims;
      tempQueueObject.runtimeParams = {};
      tempQueueObject.parameterType = 'default';
      if (props && props.selectedAnnotations) {
        tempQueueObject.aims = { ...props.selectedAnnotations };
      } else {
        tempQueueObject.aims = {};
      }

      const resultAddQueue = await addPluginsToQueue(tempQueueObject);
      let responseRunPluginsQueue = null;
      console.log('plugin running queue ', JSON.stringify(resultAddQueue));
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

  const clearAll = () => {
    setSelectedSubs([]);
    setSelectedMods([]);
    setSelectedDiagnosis([]);
    setSelectedAnatomies([]);
  }

  useEffect(() => {
    console.log('Chanfed', showDeleteModal);
  }, [showDeleteModal]);

  return (
    <>
      <div className="container-fluid body-dk">
        {/* search / filters */}
        <div className="search_filter">
          <div className="row">
            <div className="col-4">
              <div className="input-group input-group-sm mb-3">
                <input className="form-control" type="text" placeholder="Enter Search Terms and/or Use Filters at Right" aria-label="default input example" onChange={e => { setQuery(e.target.value) }} value={query} />
                <span className="input-group-text" id="basic-addon1"><BiSearch /></span>
              </div>
            </div>
            <TeachingFilters selectedAnatomies={selectedAnatomies}
              setSelectedAnatomies={setSelectedAnatomies}
              selectedDiagnosis={selectedDiagnosis}
              setSelectedDiagnosis={setSelectedDiagnosis}
              selectedSubs={selectedSubs}
              setSelectedSubs={setSelectedSubs}
              selectedMods={selectedMods}
              setSelectedMods={setSelectedMods}
              tfOnly={tfOnly}
              setTfOnly={setTfOnly}
              myCases={myCases}
              setMyCases={setMyCases} />
          </div>
          {(selectedSubs.length + selectedMods.length + selectedAnatomies.length + selectedDiagnosis.length) > 0 &&
            (<div className="filter-control">
              Filters Applied: &nbsp;
              {selectedSubs.map(sub => {
                return (<button key={sub} type="button" className="btn btn-dark btn-sm" onClick={() => clearSubspecialty(sub)} > {sub} < BiX /></button>);
              })}
              {selectedMods.map(mod => {
                return (<button key={mod} type="button" className="btn btn-dark btn-sm" onClick={() => clearModality(mod)} > {mod} < BiX /></button>);
              })}
              {selectedAnatomies.map(anatomy => {
                return (<button key={anatomy} type="button" className="btn btn-dark btn-sm" onClick={() => clearAnatomy(anatomy)} > {anatomy} < BiX /></button>);
              })}
              {selectedDiagnosis.map(diagnose => {
                return (<button key={diagnose} type="button" className="btn btn-dark btn-sm" onClick={() => clearDiagnosis(diagnose)} > {diagnose
                } < BiX /></button>);
              })}
              {(selectedSubs.length + selectedMods.length + selectedAnatomies.length + selectedDiagnosis) > 1 && (<button type="button" className="btn btn-dark btn-sm" onClick={clearAll}>Clear All Filters <BiX /></button>)}
            </div>)
          }
        </div>
      </div >
      <div className="icon_row">
        <div className="icon_r">
          <button type="button" className="btn btn-sm"><BsEyeFill /><br />View</button>
          <button type="button" className="btn btn-sm"><BiDownload /><br />Download</button>
          <button type="button" className="btn btn-sm worklist" onClick={() => { setShowWorklist(!showWorklist) }}><BiDownload /><br />Add to Worklist</button>
          {showWorklist && (<Worklists className='btn btn-sm worklist' onClose={() => { setShowWorklist(false) }} />)}
          <button type="button" className="btn btn-sm"><BiDownload /><br />Move to Project</button>
          <button type="button" className="btn btn-sm" onClick={() => { setShowDeleteModal(true) }}><BiTrash /><br />Delete</button>
        </div>
      </div>
      <table className="table table-dark table-striped table-hover title-case" >
        <colgroup><col className="select_row" />
          <col span="15" />
        </colgroup>
        <thead>
          <tr>
            <th className="select_row">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="Select" id="flexCheckDefault" />
              </div>
            </th>
            <th>
              <span onClick={() => handleSort('patientName')}>Patient Name </span>{
                sort[0] === 'patientName' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-patientName' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)} < br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter name" aria-label=".form-control-sm example" onInput={({ target }) => handleFilter('patientName', target)} value={filters.patientName} />
            </th>
            <th>
              <span onClick={() => handleSort('subjectID')}>MRN </span>{
                sort[0] === 'subjectID' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-subjectID' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)} <br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter MRN" aria-label=".form-control-sm example" />
            </th>
            <th><span onClick={() => handleSort('accessionNumber')}>Accession # </span>{
              sort[0] === 'accessionNumber' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
              sort[0] === '-accessionNumber' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)} < br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Acc#" aria-label=".form-control-sm example" />
            </th>
            <th><span onClick={() => handleSort('name')}>Case Title </span>{
              sort[0] === 'name' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
              sort[0] === '-name' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Title" aria-label=".form-control-sm example" />
            </th>
            <th><span onClick={() => handleSort('name')}>Age </span>{
              sort[0] === 'age' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
              sort[0] === '-age' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Age" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('sex')}>Sex </span>{
                sort[0] === 'sex' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-sex' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Sex" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('modality')}>Modality </span>{
                sort[0] === 'modality' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-modality' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Modality" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('studyDate')}>Study Date </span>{
                sort[0] === 'studyDate' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-studyDate' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Date" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('anatomy')}>Anatomy </span>{
                sort[0] === 'anatomy' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-anatomy' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Anatomy" aria-label=".form-control-sm example" />
            </th>
            <th><span onClick={() => handleSort('observation')}>Observation </span>{
              sort[0] === 'observation' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
              sort[0] === '-observation' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Observation" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('date')}>Created </span>{
                sort[0] === 'date' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-date' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Created" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('templateType')}>Template </span>{
                sort[0] === 'templateType' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-templateType' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Template" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('fullName')}>User </span>{
                sort[0] === 'fullName' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-fullName' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter User" aria-label=".form-control-sm example" />
            </th>
            <th><span onClick={() => handleSort('userComment')}>Comment </span>{
              sort[0] === 'userComment' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
              sort[0] === '-userComment' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Comment" aria-label=".form-control-sm example" />
            </th>
            <th>
              <span onClick={() => handleSort('projectName')}>Project </span>{
                sort[0] === 'projectName' && (<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />) ||
                sort[0] === '-projectName' && (<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)}<br />
              <input className="form-control form-control-sm" type="text" placeholder="Filter Project" aria-label=".form-control-sm example" />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 && !showSpinner && (
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
              handleSort={handleSort}
              handleFilter={handleFilter}
              filters={filters}
            />
          )}
        </tbody>
      </table>
      <DeleteAlert
        message={explanation.deleteSelected}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={deleteAllSelected}
        error={explanation.errorMessage}
        show={showDeleteModal}
      // onHide={() => setDeleteSelectedClicked(false)}
      />

    </>
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
