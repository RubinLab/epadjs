import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import PropagateLoader from "react-spinners/PropagateLoader";
import _ from "lodash";
import Collapsible from "react-collapsible";
import { HiOutlineFolderDownload } from "react-icons/hi";
import {
  FaDownload,
  FaUpload,
  FaRegTrashAlt,
  FaSearch,
  FaPlus,
  FaEraser,
} from "react-icons/fa";
import {
  RiCheckboxMultipleFill,
  RiCheckboxMultipleBlankFill,
  RiCloseCircleFill,
} from "react-icons/ri";
import { FcAbout, FcClearFilters } from "react-icons/fc";
import { BiSearch, BiX, BiTrash, BiDownload, BiPlay } from "react-icons/bi";
import { BsEyeFill } from "react-icons/bs";
import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from "react-icons/ai";
import ReactTooltip from "react-tooltip";
import {
  searchAnnotations,
  getAllAnnotations,
  getSummaryAnnotations,
  downloadProjectAnnotation,
  deleteAnnotationsList,
} from "../../services/annotationServices.js";
import AnnotationTable from "./AnnotationTable.jsx";
import {
  clearSelection,
  selectAnnotation,
  updateSearchTableIndex,
  refreshPage,
} from "../annotationsList/action";
import AnnotationDownloadModal from "../searchView/annotationDownloadModal";
import UploadModal from "../searchView/uploadModal";
import DeleteAlert from "../management/common/alertDeletionModal";
import {
  getPluginsForProject,
  addPluginsToQueue,
  runPluginsQueue,
} from "../../services/pluginServices";
import TeachingFilters from "./TeachingFilters.jsx";
import AddToWorklist from "../searchView/addWorklist";
import Projects from "../searchView/addToProject";
import Spinner from "react-bootstrap/Spinner";
import SeriesModal from "../annotationsList/selectSerieModal";
import WarningModal from "../common/warningModal";
import { COMP_MODALITIES as compModality } from "../../constants.js";
import {
  isSupportedModality,
  findSelectedCheckboxes,
  handleSelectDeselectAll,
  resetSelectAllCheckbox,
} from "Utils/aid.js";

import "./annotationSearch.css";

const lists = {
  organize: ["AND", "OR", "(", ")"],
  paranthesis: ["(", ")"],
  condition: ["AND", "OR"],
  type: [
    "modality",
    "observation",
    "anatomy",
    "lesion_name",
    "patient",
    "template",
    "user",
    "comment",
  ],
  criteria: ["contains"], // 'equals'
};

const pageSize = 200;

const explanation = {
  invalidQuery: "This search query is not valid.",
  deleteSelected: "Delete selected annotations? This cannot be undone.",
  organize: "Group and/or organize your query: ",
  type: "Select a field from annotation",
  criteria: "Select a criteria",
  term: "Type the key word that you want to look for above",
  project: "Search in all ePAD",
  noResult: "Can not find any result!",
  downloadProject:
    "Preparing project for download. The link to the files will be sent with a notification after completion!",
  pluginAnnotations: "You need to select an annotation first.",
  selectPlugin: "You need to select a plugin first.",
};

const styles = {
  buttonStyles: {
    width: "5rem",
    margin: "0.2rem",
    padding: "0.3rem 0.5rem",
    fontSize: "1.2 rem",
  },
  downloadButton: {
    width: "8rem",
    margin: "1rem 0.5rem",
    padding: "0.3rem 0.5rem",
    fontSize: "1.2 rem",
  },
  error: {
    color: "orangered",
    padding: "0.3rem 0.5rem",
    height: "fit-content",
    fontSize: "1.2rem",
    margin: "0.3rem 2rem",
  },
  enabledRunButton: {
    height: "41.98px",
    color: "#eaddb2",
    cursor: "pointer",
  },
  disabledRunButton: {
    height: "41.98px",
    color: "#eaddb2",
    cursor: "default",
  },
};

let mode;

const AnnotationSearch = (props) => {
  mode = sessionStorage.getItem("mode");
  const [query, setQuery] = useState("");
  const [partialQuery, setPartialQuery] = useState({
    type: lists.type[0],
    criteria: lists.criteria[0],
    term: "",
  });
  const [selectedProject, setSelectedProject] = useState("");
  const [data, setData] = useState([]);
  const [rows, setRows] = useState(0);
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [error, setError] = useState("");
  const [bookmark, setBookmark] = useState("");
  const [uploadClicked, setUploadClicked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [checkboxSelected, setCheckboxSelected] = useState(false);
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
  const [tfOnly, setTfOnly] = useState(mode === "teaching" ? true : false);
  // const [myCases, setMyCases] = useState(mode === 'teaching' ? false : true);
  const [myCases, setMyCases] = useState(false);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState([]);
  const [showSpinner, setShowSpinner] = useState(true);
  const [showWorklist, setShowWorklist] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showSelectSeries, setShowSelectSeries] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  const [encArgs, setEncArgs] = useState("");
  const [decrArgs, setDecrArgs] = useState("");
  const [allSelected, setAllSelected] = useState(false);

  const populateSearchResult = (res, pagination, afterDelete) => {
    const result = Array.isArray(res) ? res[0] : res;
    if ((typeof pagination === "number" || pagination) && !afterDelete) {
      setData(data.concat(result.data.rows));
    } else {
      setData(result.data.rows);
    }
    setRows(result.data.total_rows);
    setBookmark(result.data.bookmark);
    if (result.data.total_rows === 0) {
      toast.info(explanation.noResult, { position: "top-right" });
    }
  };

  const getAnnotationsOfProjets = (pageIndex, afterdelete) => {
    const bm = pageIndex ? bookmark : "";
    // const promise =
    //   props.pid === 'all'
    //     ? getAllAnnotations(bm)
    //     : getSummaryAnnotations(props.pid, bm);
    // Promise.all([promise])
    //   .then(res => {
    //     populateSearchResult(res, pageIndex, afterdelete);
    //   })
    //   .catch(err => console.error(err));
    getFieldSearchResults(pageIndex, afterdelete);
  };

  useEffect(() => {
    resetSelectAllCheckbox(false);
    if (mode === "teaching") return;
    setSelectedProject(props.pid);
    setQuery("");
    setBookmark("");
    setCheckboxSelected(false);
    props.dispatch(clearSelection());
    persistSearch();
    if (props.searchQuery) {
      getFieldSearchResults(undefined, undefined, true);
      //const searchQueryFinal = Object.keys(props.searchQuery)[0];
      //const searchQueryText = Object.values(props.searchQuery)[0].query;
      //const searchQueryProject = Object.values(props.searchQuery)[0].project;
      //setQuery(searchQueryText);
      //setSelectedProject(searchQueryProject || '');
      //searchAnnotations({ query: escapeSlashesQuery(searchQueryFinal) })
      //  .then(res => {
      //    populateSearchResult(res);
      //  })
      //  .catch(err => console.error(err));
    } else {
      // getAnnotationsOfProjets();
    }
    // cavit
    setShowRunPluginButton(false);
    setSelectedPluginDbId(-1);
    getPluginProjects();
    // cavit
  }, [props.pid, props.update]);

  useEffect(() => {
    if (props.refreshMap.plugins) {
      setShowRunPluginButton(false);
      setSelectedPluginDbId(-1);
      getPluginProjects();
      props.dispatch(refreshPage("plugins", false));
    }
  }, [props.refreshMap.plugins]);

  const handleUserKeyPress = (e) => {
    const teachingFields = document.getElementById("questionaire");
    if (e.key === "Enter" && !teachingFields) {
      getFieldSearchResults(undefined, undefined, true);
      props.dispatch(updateSearchTableIndex(0));
      //if (mode !== 'teaching') {
      //  getSearchResult(undefined, undefined, true);
      //  props.dispatch(updateSearchTableIndex(0));
      //} else {
      //  getFieldSearchResults(undefined, undefined, true);
      //  props.dispatch(updateSearchTableIndex(0));
      //}
    }
  };
  
  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const handleTeachingFilesModal = (event) => {
    let { seriesArray, args, packedData } = event.detail;

    for (let i = 0; i < seriesArray.length; i++) {
      seriesArray = seriesArray.filter(isSupportedModality);
    }

    let seriesList = [seriesArray];
    setShowSelectSeries(seriesArray.length > 0);
    setShowWarning(seriesArray.length === 0);
    setSeriesList(seriesList);
    setEncArgs(args);
    setDecrArgs(packedData);
  };

  useEffect(() => {
    window.addEventListener("openTeachingFilesModal", handleTeachingFilesModal);
    return () => {
      window.removeEventListener(
        "openTeachingFilesModal",
        handleTeachingFilesModal
      );
    };
  }, [handleTeachingFilesModal]);

  const useDebouncedEffect = (effect, deps, delay) => {
    useEffect(() => {
      const handler = setTimeout(() => effect(), delay);
      return () => {
        persistSearch();
        clearTimeout(handler);
      };
    }, [...(deps || []), delay]);
  };

  useDebouncedEffect(
    () => {
      if (selectedProject !== props.pid) {
        setSelectedProject(props.pid);
      }
      if (firstRun) {
        if (sessionStorage.searchState) {
          loadSearchState();
          setFirstRun(false);
          return;
        }
        setFirstRun(false);
      }
      getFieldSearchResults();
      props.dispatch(updateSearchTableIndex(0));
      return persistSearch;
    },
    [
      tfOnly,
      myCases,
      selectedSubs,
      selectedMods,
      selectedAnatomies,
      selectedDiagnosis,
      props.pid,
      query,
      sort,
      filters,
      props.update,
    ],
    500
  );

  const handleSort = (column) => {
    if (!sort.length || (sort[0] !== column && sort[0] !== "-" + column))
      setSort([column]);
    else if (sort[0] === column) {
      setSort(["-" + column]);
    } else if (sort[0] === "-" + column) setSort([]);
  };

  const handleFilter = (column, target) => {
    const { value } = target;
    const newFilters = { ...filters };
    if (value.length) newFilters[column] = value;
    else if (newFilters[column] && value === "") delete newFilters[column];
    setFilters(newFilters);
  };

  const clearSubspecialty = (sub) => {
    let index = selectedSubs.indexOf(sub);
    setSelectedSubs(selectedSubs.filter((_, i) => i !== index));
  };

  const clearModality = (mod) => {
    let index = selectedMods.indexOf(mod);
    setSelectedMods(selectedMods.filter((_, i) => i !== index));
  };

  const clearAnatomy = (anatomy) => {
    let index = selectedAnatomies.indexOf(anatomy);
    setSelectedAnatomies(selectedAnatomies.filter((_, i) => i !== index));
  };

  const clearDiagnosis = (diagnose) => {
    let index = selectedDiagnosis.indexOf(diagnose);
    setSelectedDiagnosis(selectedDiagnosis.filter((_, i) => i !== index));
  };

  const persistSearch = () => {
    const searchState = {
      tfOnly,
      myCases,
      selectedSubs,
      selectedMods,
      selectedAnatomies,
      selectedDiagnosis,
      query,
      selectedProject,
      filters,
      sort,
    };
    sessionStorage.searchState = JSON.stringify(searchState);
  };

  const loadSearchState = () => {
    const searchState = JSON.parse(sessionStorage.searchState);
    const {
      tfOnly,
      myCases,
      selectedSubs,
      selectedMods,
      selectedAnatomies,
      selectedDiagnosis,
      query,
      selectedProject,
      filters,
      sort,
    } = searchState;
    if (filters) setFilters(filters);
    if (tfOnly !== undefined) setTfOnly(tfOnly);
    if (myCases !== undefined) setMyCases(myCases);
    if (selectedSubs.length) setSelectedSubs(selectedSubs);
    if (selectedMods.length) setSelectedMods(selectedMods);
    if (selectedAnatomies) setSelectedAnatomies(selectedAnatomies);
    if (selectedDiagnosis) setSelectedDiagnosis(selectedDiagnosis);
    if (query) setQuery(query);
    if (selectedProject) setSelectedProject(selectedProject);
    if (sort.length) setSort(sort);
  };

  const insertIntoQueryOnSelection = (el) => {
    const field = document.getElementsByClassName(
      "form-control annotationSearch-text"
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

  const renderOrganizeItem = (name) => {
    return (
      <div className="annotationSearch-cont__item">
        <div className="annotaionSearch-title">{`${explanation[name]}`}</div>
        <div style={{ margin: "0rem 1rem" }}>
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

  const updateSelectedAims = (aimData) => {
    if (props.selectedAnnotations[aimData.aimID]) setAllSelected(false);
    props.dispatch(selectAnnotation(aimData));
  };

  const renderContentItem = (field) => {
    return (
      <select
        onChange={(e) =>
          setPartialQuery({ ...partialQuery, [field]: e.target.value })
        }
        name={field}
        onMouseDown={(e) => e.stopPropagation()}
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
        {renderContentItem("type")}
        {renderContentItem("criteria")}
        <input
          type="text"
          autoComplete="off"
          className="form-control annotationSearch-cont__item__sub"
          aria-label="Large"
          name="term"
          onChange={(e) =>
            setPartialQuery({ ...partialQuery, term: e.target.value })
          }
          style={{
            padding: "0.15rem",
            height: "fit-content",
            fontSize: "1.2rem",
          }}
        />
        <button
          className={`btn btn-secondary`}
          // style={styles.buttonStyles}
          onClick={addPartialToQuery}
          type="button"
          name="add-button"
          style={{
            padding: "0.3rem 0.5rem",
            height: "fit-content",
            fontSize: "1rem",
            margin: "0rem 0.3rem",
            width: "5%",
          }}
        >
          <FaPlus />
        </button>
      </div>
    );
  };

  // I replaced this function, and it can probably be removed - James
  const getSearchResult = (pageIndex, afterDelete, enterPressed) => {
    getFieldSearchResults(pageIndex, afterDelete, enterPressed);
    //props.dispatch(updateSearchTableIndex(0));
    //if (query.length === 0) {
    //  getAnnotationsOfProjets(pageIndex, afterDelete);
    //}
    //else {
    //  if (!syntaxVerify(query)) {
    //    if (enterPressed) {
    //      toast.info(explanation.invalidQuery, { position: 'top-right' });
    //    }
    //    return;
    //  }
    //  const queryToSave = {
    //    [query]: {
    //      query,
    //      project: selectedProject
    //    }
    //  };
    //  props.setQuery(queryToSave);
    //  const bm = pageIndex ? bookmark : '';
    //  searchAnnotations({ query: query }, bm)
    //    .then(res => {
    //      populateSearchResult(res, pageIndex, afterDelete);
    //    })
    //    .catch(err => console.error(err));
    //}
  };

  // Returns true if the string is valid, false otherwise.
  const syntaxVerify = (inputString) => {
    // Erase anything within quotes, because nothing in quotes can be invalid
    // Replace fancy quotes with regular quotes
    inputString = inputString.replace(/[\u201C\u201D]/g, '"').toLowerCase();
    // Matches `""...""` where the `...` doesn't start or end with `"` and doesn't
    // contain any double quotes, ie `""a"a""`
    inputString = inputString.replace(/""(?!"").+?""/g, "==");
    // Matches anything in quotation marks.
    inputString = inputString.replace(/"[^"]+?"/g, "##");
    if (inputString.includes('"')) {
      // Remaining quotes == quotation mark mismatch
      return false;
    }
    return checkParens(inputString) && checkOperators(inputString);
  };

  // Returns false if it finds a problem with the string, true otherwise.
  // This checks:
  // 1. The number of '(' is the same as the number of ')'
  // 2. The parentheses are a valid arrangement, so '(a)' is valid but ')a('
  //    is not.
  const checkParens = (inputString) => {
    let netParens = 0;
    for (const character of inputString) {
      if (character == "(") {
        netParens += 1;
      } else if (character == ")") {
        netParens -= 1;
        if (netParens < 0) {
          return false;
        }
      }
    }
    return netParens == 0;
  };

  // Returns false if it finds a problem with the string, true otherwise.
  // Checks various things related to the search operators '(', ')', 'and', 'or', 'not'.
  const checkOperators = (inputString) => {
    const operatorRegex = new RegExp(
      "(" +
        "\\( *\\)|" + // "()" and "( )" are invalid
        "\\( *and|\\( *or|\\( *not|" + // ( then operator
        "and *\\)|or *\\)|not *\\)|" + // ) then operator
        "^ *and *$|^ *or *$|^ *not *$|" + // Whole query is an operator
        "^ *and[ (]|^ *or[ (]|^ *not[ (]|" + // Unpaired operators at start of query
        "[ )]and *$|[ )]or *$|[ )]not *$|" + // Unpaired operators at end of the query
        "and +and|and +or|or +and|or +or|not +and|not +or|not +not" + // 2 operators other than "OR NOT", "AND NOT"
        ")"
    );
    return !operatorRegex.test(inputString);
  };

  // This handles the search.
  const getFieldSearchResults = (pageIndex, afterDelete, enterPressed) => {
    if (query.length) {
      if (!syntaxVerify(query)) {
        if (enterPressed) {
          toast.info(explanation.invalidQuery, { position: "top-right" });
        }
        return;
      }
    }
    // We want to escape any special characters in the filters that are sent to
    // the server, without changing what the user sees.
    const filterArray = Object.entries(filters);
    const newFilters = {};
    if (filterArray.length > 0) {
      for (const filt of filterArray) {
        let filterText = filt[1];
        filterText.replaceAll("\\\\", "\\");
        const charsToEscape = [
          "+",
          "!",
          "{",
          "}",
          "[",
          "]",
          "^",
          "~",
          "*",
          "?",
          ":",
          "/",
          ".",
          "$",
          "^",
          "(",
          ")",
        ];
        for (const char of charsToEscape) {
          filterText = filterText.replaceAll(char, "\\" + char);
        }
        newFilters[filt[0]] = filterText;
      }
    }
    setShowSpinner(true);
    const bm = pageIndex ? bookmark : "";
    let body = {};
    const fields = {};
    body["fields"] = fields;
    if (props.pid) fields["project"] = props.pid;
    if (query.length) fields["query"] = query;
    if (selectedSubs.length) fields["subSpecialty"] = selectedSubs;
    if (selectedMods.length) fields["modality"] = selectedMods;
    if (selectedAnatomies.length) fields["anatomy"] = selectedAnatomies;
    if (selectedDiagnosis.length) fields["diagnosis"] = selectedDiagnosis;
    if (mode === "teaching" && tfOnly) fields["teachingFiles"] = tfOnly;
    if (myCases) fields["myCases"] = myCases;
    if (sort.length) body["sort"] = sort;
    if (Object.keys(filters).length) body["filter"] = newFilters;
    searchAnnotations(body, bm)
      .then((res) => {
        populateSearchResult(res, pageIndex, afterDelete);
        setRows(res.data.total_rows);
        setShowSpinner(false);
        props.completeLoading();
      })
      .catch((err) => {
        console.error(err);
        setShowSpinner(false);
      });
  };

  const getNewData = (pageIndex, afterDelete) => {
    // const searchTableIndex = pageIndex || props.searchTableIndex || 0;
    if (mode === 'teaching') {
      getFieldSearchResults(props.searchTableIndex, afterDelete);
      return;
    }

    if (query) {
      getFieldSearchResults(pageIndex, afterDelete);
    } else {
      getAnnotationsOfProjets(pageIndex, afterDelete);
    }
  };

  const renderOptions = () => {
    const projectNames = Object.values(props.projectMap);
    const projectID = Object.keys(props.projectMap);
    const defaultOption = (
      <option key="default" data-project-id={""} value={""}>
        in all ePad
      </option>
    );
    const options = [defaultOption];
    projectNames.forEach((el, i) => {
      if (projectID[i] !== "all" && projectID[i] !== "nonassigned") {
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

  const handleMultipleSelect = (action) => {
    const pages = Math.ceil(props.rows / pageSize);
    const indexStart = props.searchTableIndex * pageSize;
    const indexEnd =
      props.searchTableIndex + 1 === pages
        ? rows
        : pageSize * (props.searchTableIndex + 1);
    const arrayToSelect = data.slice(indexStart, indexEnd);
    if (action === "selectPageAll") {
      arrayToSelect.forEach((el) => {
        if (!props.selectedAnnotations[el.aimID])
          props.dispatch(selectAnnotation(el));
      });
    } else if (action === "unselectPageAll") {
      // arrayToSelect.forEach(el => {
      //   if (props.selectedAnnotations[el.aimID])
      //     props.dispatch(selectAnnotation(el));
      // });
      props.dispatch(clearSelection());
    } else if (action === "unselectAll") {
      props.dispatch(clearSelection());
    }
  };

  const triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display: none";
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadProjectAim = () => {
    if (props.pid === "all" || props.pid === "nonassigned") return;
    downloadProjectAnnotation(props.pid)
      .then((result) => {
        if (result.data.type === "application/octet-stream") {
          let blob = new Blob([result.data], { type: "application/zip" });
          triggerBrowserDownload(blob, `Project ${props.pid}`);
        } else
          toast.success(explanation.downloadProject, {
            autoClose: false,
            position: "bottom-left",
          });
      })
      .catch((err) => console.error(err));
  };

  const renderProjectSelect = () => {
    return (
      <div
        className="annotationSearch-cont__item"
        style={{ margin: "1rem 0rem" }}
      >
        <div
          className="searchView-toolbar__group"
          style={{ padding: "0.2rem" }}
        >
          <>
            <RiCheckboxMultipleFill
              className="tool-icon"
              data-tip
              data-for="selectPageAll-icon"
              style={{ fontSize: "1.4rem" }}
              onClick={() => handleMultipleSelect("selectPageAll")}
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
              style={{ fontSize: "1.4rem" }}
              onClick={() => handleMultipleSelect("unselectPageAll")}
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
              style={{ fontSize: "1.4rem" }}
              onClick={() => handleMultipleSelect("unselectAll")}
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
          style={{ padding: "0.2rem" }}
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
                  props.pid === "all_aims" ? "hide-delete" : "tool-icon"
                }
                data-tip
                data-for="downloadProject-icon"
                style={{ fontSize: "1.7rem" }}
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
                        fontSize: "1.1rem",
                        color: "rgb(107, 107, 107)",
                        cursor: "not-allowed",
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
        {mode !== "lite" && (
          <div
            className="searchView-toolbar__group"
            style={{ padding: "0.2rem" }}
          >
            {" "}
            <div
              className="annotaionSearch-title"
              style={{ fontsize: "1.2rem" }}
            >{`${explanation.project}`}</div>
            <input
              name="project-dropdown"
              type="checkbox"
              checked={checkboxSelected}
              onChange={(e) => {
                if (e.target.checked === false) {
                  const project =
                    props.searchQuery &&
                    Object.values(props.searchQuery)[0].project
                      ? Object.values(props.searchQuery)[0].project
                      : props.pid;
                  setSelectedProject(project);
                  setCheckboxSelected(false);
                } else {
                  setSelectedProject("");
                  setCheckboxSelected(true);
                }
                setBookmark("");
              }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ margin: "0rem 1rem", padding: "1.8px" }}
            />{" "}
          </div>
        )}
        <div
          className="searchView-toolbar__group"
          style={{ padding: "0.2rem" }}
        >
          <div
            style={{ fontSize: "1.2rem", color: "aliceblue" }}
            onClick={() => {
              getPluginProjects();
            }}
          >
            select plugin :{" "}
          </div>
          {showPlugins && (
            <div>
              <select
                style={{
                  fontSize: "1.1rem",
                  marginLeft: "5px",
                  marginRight: "10px",
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
                  fontSize: "1.2rem",
                  background: "#861737",
                  marginLeft: "5px",
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

  const formSelectedAnnotationsData = () => {
    const aimArray = findSelectedCheckboxes();
    const aimMap = JSON.parse(sessionStorage.getItem("aimMap"));
    const aimObj = aimArray.reduce((all, item, index) => {
      all[item] = { ...aimMap[item] };
      return all;
    }, {});
    return aimObj;
  };

  const deleteAllSelected = () => {
    const notDeleted = {};
    // let newSelected = Object.assign({}, props.selectedAnnotations);
    let newSelected = formSelectedAnnotationsData();
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
        getNewData(props.searchTableIndex, true);
        resetSelectAllCheckbox(false);
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        )
          toast.error(error.response.data.message, { autoClose: false });
        getNewData(props.searchTableIndex, true);
        resetSelectAllCheckbox(false);
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

  const handleChangePlugin = (e) => {
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
      tempQueueObject.projectName = "";

      tempQueueObject.pluginDbId = tempPluginObject.id;
      tempQueueObject.pluginId = tempPluginObject.plugin_id;
      tempQueueObject.pluginName = tempPluginObject.name;
      tempQueueObject.pluginType = "local";
      tempQueueObject.processMultipleAims =
        tempPluginObject.processmultipleaims;
      tempQueueObject.runtimeParams = {};
      tempQueueObject.parameterType = "default";
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
      Object.keys(props.selectedAnnotations).forEach(async (eachAnnt) => {
        let aimObj = {};
        aimObj[eachAnnt] = props.selectedAnnotations[eachAnnt];

        console.log(`eachAnnt : ${JSON.stringify(aimObj)}`);

        const tempQueueObject = {};
        tempQueueObject.projectDbId =
          tempPluginObject.project_plugin.project_id;
        tempQueueObject.projectId = props.selectedProject;
        tempQueueObject.projectName = "";

        tempQueueObject.pluginDbId = tempPluginObject.id;
        tempQueueObject.pluginId = tempPluginObject.plugin_id;
        tempQueueObject.pluginName = tempPluginObject.name;
        tempQueueObject.pluginType = "local";
        tempQueueObject.processMultipleAims =
          tempPluginObject.processmultipleaims;
        tempQueueObject.runtimeParams = {};
        tempQueueObject.parameterType = "default";
        tempQueueObject.aims = aimObj;

        const resultAddQueue = await addPluginsToQueue(tempQueueObject);
        let responseRunPluginsQueue = null;
        console.log("plugin running queue ", JSON.stringify(resultAddQueue));
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
      tempQueueObject.projectName = "";

      tempQueueObject.pluginDbId = tempPluginObject.id;
      tempQueueObject.pluginId = tempPluginObject.plugin_id;
      tempQueueObject.pluginName = tempPluginObject.name;
      tempQueueObject.pluginType = "local";
      tempQueueObject.processMultipleAims =
        tempPluginObject.processmultipleaims;
      tempQueueObject.runtimeParams = {};
      tempQueueObject.parameterType = "default";
      if (props && props.selectedAnnotations) {
        tempQueueObject.aims = { ...props.selectedAnnotations };
      } else {
        tempQueueObject.aims = {};
      }

      const resultAddQueue = await addPluginsToQueue(tempQueueObject);
      let responseRunPluginsQueue = null;
      console.log("plugin running queue ", JSON.stringify(resultAddQueue));
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

  const clearAllTeachingFilers = () => {
    setSelectedSubs([]);
    setSelectedMods([]);
    setSelectedDiagnosis([]);
    setSelectedAnatomies([]);
  };

  const clearAllFilters = () => {
    setFilters({});
    setQuery("");
    clearAllTeachingFilers();
  };

  return (
    <>
      <div
        className="container-fluid body-dk"
        style={{
          zIndex: 6,
          position: "sticky",
          top: 0,
        }}
      >
        {/* search / filters */}
        <div className="search_filter">
          <div className="row">
            <div className="col-4">
              <div className="input-group input-group-sm mb-3">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Enter Search Terms and/or Use Filters at Right"
                  aria-label="default input example"
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  value={query}
                />
                <span className="input-group-text" id="basic-addon1">
                  <BiSearch />
                </span>

                <div>
                  <button
                    data-tip
                    data-for="clearAll"
                    className="btn btn-dark btn-sm color-schema"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={clearAllFilters}
                  >
                    <FcClearFilters />
                  </button>
                </div>
                <ReactTooltip
                  id="clearAll"
                  place="right"
                  type="info"
                  delayShow={1000}
                >
                  Clear all filters
                </ReactTooltip>
              </div>
            </div>
            {mode === "teaching" && (
              <TeachingFilters
                selectedAnatomies={selectedAnatomies}
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
                setMyCases={setMyCases}
              />
            )}
          </div>
          {selectedSubs.length +
            selectedMods.length +
            selectedAnatomies.length +
            selectedDiagnosis.length >
            0 && (
            <div
              className="filter-control"
              style={{ paddingLeft: "0.9rem", paddingTop: "0.9rem" }}
            >
              Filters Applied: &nbsp;
              {selectedSubs.map((sub) => {
                return (
                  <button
                    key={sub}
                    type="button"
                    className="btn btn-dark btn-sm color-schema"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => clearSubspecialty(sub)}
                  >
                    {" "}
                    {sub} <BiX />
                  </button>
                );
              })}
              {selectedMods.map((mod) => {
                return (
                  <button
                    key={mod}
                    type="button"
                    className="btn btn-dark btn-sm color-schema"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => clearModality(mod)}
                  >
                    {" "}
                    {compModality[mod.toLowerCase()]
                      ? compModality[mod.toLowerCase()]
                      : mod}{" "}
                    <BiX />
                  </button>
                );
              })}
              {selectedAnatomies.map((anatomy) => {
                return (
                  <button
                    key={anatomy}
                    type="button"
                    className="btn btn-dark btn-sm color-schema"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => clearAnatomy(anatomy)}
                  >
                    {" "}
                    {anatomy} <BiX />
                  </button>
                );
              })}
              {selectedDiagnosis.map((diagnose) => {
                return (
                  <button
                    key={diagnose}
                    type="button"
                    className="btn btn-dark btn-sm color-schema"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => clearDiagnosis(diagnose)}
                  >
                    {" "}
                    {diagnose} <BiX />
                  </button>
                );
              })}
              {selectedSubs.length +
                selectedMods.length +
                selectedAnatomies.length +
                selectedDiagnosis >
                1 && (
                <button
                  type="button"
                  className="btn btn-dark btn-sm color-schema"
                  style={{ marginRight: "0.5rem" }}
                  onClick={clearAllFilters}
                >
                  Clear All Filters <BiX />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          width: "auto",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "sticky",
          top: "84px",
          width: "100%",
          zIndex: 5,
          background: "#222222",
        }}
      >
        <div
          className="icon_row"
          style={
            {
              // 'position': 'sticky',
              // 'top': '84px',
              // // 'width': '100%',
              // 'zIndex': 5
            }
          }
        >
          <div className="icon_r">
            {/* <button type="button" className="btn btn-sm" ><BsEyeFill /><br />View</button> */}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowDownload(!showDownload)}
            >
              <BiDownload />
              <br />
              Download
            </button>
            {/* <button type="button" className="btn btn-sm worklist" onClick={() => { setShowWorklist(!showWorklist) }}><BiDownload /><br />Add to Worklist</button>
          {showWorklist && (<AddToWorklist className='btn btn-sm worklist' onClose={() => { setShowWorklist(false) }} />)} */}
            <AddToWorklist
              deselect={() => {
                handleSelectDeselectAll(false);
                resetSelectAllCheckbox(false);
              }}
              forceUpdatePage={props.forceUpdatePage}
            />
            <Projects
              deselect={() => {
                handleSelectDeselectAll(false);
                resetSelectAllCheckbox(false);
              }}
              updateUrl={props.history.push}
            />
            {/* <button type="button" className="btn btn-sm" onClick={() => { setShowProjects(!showProjects) }}><BiDownload /><br />Copy to Project</button>
          {showProjects && (<Projects className='btn btn-sm worklist' onClose={() => { setShowProjects(false) }} />)} */}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setShowDeleteModal(true);
              }}
            >
              <BiTrash />
              <br />
              Delete
            </button>
          </div>
        </div>
        {showPlugins && mode !== "teaching" && (
          <div
            style={{
              textAlign: "left",
              color: "#eaddb2",
              borderRight: "1px solid #ececec",
              backgroundColor: "#555",
              borderTop: "1px solid #ececec",
              marginRight: "3px",
              display: "flex",
              // 'height': "42.58px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ padding: "5px 3px" }}>
              <div
                style={{
                  color: "#eaddb2",
                  fontSize: ".8em",
                }}
                onClick={() => {
                  getPluginProjects();
                }}
              >
                Select Plugin
              </div>
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                margin: "5px 3px",
              }}
            >
              <select
                className="pluginaddqueueselect"
                id="plugins"
                onChange={handleChangePlugin}
                value={selectedPluginDbId}
                style={{ minWidth: "8rem" }}
              >
                <option key="-1" value="-1">
                  select
                </option>
                {prepareDropDownHtmlForPlugins()}
              </select>
            </div>
            <button
              style={
                showRunPluginButton
                  ? styles.enabledRunButton
                  : styles.disabledRunButton
              }
              className="btn btn-sm"
              onClick={() =>
                showRunPluginButton
                  ? runPlugin()
                  : toast.info(explanation.selectPlugin, {
                      position: "top-right",
                    })
              }
            >
              <BiPlay />
              <br />
              Run
            </button>
          </div>
        )}
      </div>
      <table
        className="table table-dark table-striped table-hover title-case"
        style={{ height: "100%" }}
      >
        <colgroup>
          <col className="select_row" />
          <col span="15" />
        </colgroup>
        <thead className="sticky">
          <tr>
            <th className="select_row">
              <div className="form-check">
                <input
                  id="search-select_all"
                  className="form-check-input __select-all"
                  type="checkbox"
                  onChange={({ target: { checked } }) =>
                    handleSelectDeselectAll(checked)
                  }
                />
              </div>
            </th>
            <th>
              <span onClick={() => handleSort("patientName")}>
                Patient Name{" "}
              </span>
              {(sort[0] === "patientName" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-patientName" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}{" "}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("patientName", target)}
                value={filters.patientName || ""}
              />
            </th>
            <th>
              <span onClick={() => handleSort("subjectID")}>
                {mode === "teaching" ? "MRN" : "Patient Id"}{" "}
              </span>
              {(sort[0] === "subjectID" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-subjectID" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}{" "}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("subjectID", target)}
                value={filters.subjectID || ""}
              />
            </th>
            {mode === "teaching" && (
              <th>
                <span onClick={() => handleSort("accessionNumber")}>
                  Accession #{" "}
                </span>
                {(sort[0] === "accessionNumber" && (
                  <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
                )) ||
                  (sort[0] === "-accessionNumber" && (
                    <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                  ))}{" "}
                <br />
                <input
                  className="form-control form-control-sm"
                  type="text"
                  aria-label=".form-control-sm example"
                  onInput={({ target }) =>
                    handleFilter("accessionNumber", target)
                  }
                  value={filters.accessionNumber || ""}
                />
              </th>
            )}
            <th>
              <span onClick={() => handleSort("name")}>
                {mode === "teaching" ? "Case Title" : "Annotation Name"}{" "}
              </span>
              {(sort[0] === "name" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-name" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("name", target)}
                value={filters.name || ""}
              />
            </th>
            <th style={{ width: "3.5rem" }}>
              <span onClick={() => handleSort("age")}>Age </span>
              {(sort[0] === "age" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-age" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("age", target)}
                value={filters.age || ""}
              />
            </th>
            <th style={{ width: "3rem" }}>
              <span onClick={() => handleSort("sex")}>Sex </span>
              {(sort[0] === "sex" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-sex" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("sex", target)}
                value={filters.sex || ""}
              />
            </th>
            <th>
              <span onClick={() => handleSort("modality")}>Modality </span>
              {(sort[0] === "modality" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-modality" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("modality", target)}
                value={filters.modality || ""}
              />
            </th>
            <th>
              <span onClick={() => handleSort("studyDate")}>Study Date </span>
              {(sort[0] === "studyDate" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-studyDate" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("studyDate", target)}
                value={filters.studyDate || ""}
              />
            </th>
            {mode === "teaching" && (
              <th>
                <span onClick={() => handleSort("anatomy")}>Anatomy </span>
                {(sort[0] === "anatomy" && (
                  <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
                )) ||
                  (sort[0] === "-anatomy" && (
                    <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                  ))}
                <br />
                <input
                  className="form-control form-control-sm"
                  type="text"
                  aria-label=".form-control-sm example"
                  onInput={({ target }) => handleFilter("anatomy", target)}
                  value={filters.anatomy || ""}
                />
              </th>
            )}
            {mode === "teaching" && (
              <th>
                <span onClick={() => handleSort("observation")}>
                  Observation{" "}
                </span>
                {(sort[0] === "observation" && (
                  <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
                )) ||
                  (sort[0] === "-observation" && (
                    <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                  ))}
                <br />
                <input
                  className="form-control form-control-sm"
                  type="text"
                  aria-label=".form-control-sm example"
                  onInput={({ target }) => handleFilter("observation", target)}
                  value={filters.observation || ""}
                />
              </th>
            )}
            <th>
              <span onClick={() => handleSort("date")}>Created </span>
              {(sort[0] === "date" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-date" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("date", target)}
                value={filters.date || ""}
              />
            </th>
            <th>
              <span onClick={() => handleSort("templateType")}>Template </span>
              {(sort[0] === "templateType" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-templateType" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("templateType", target)}
                value={filters.templateType || ""}
              />
            </th>
            <th>
              <span onClick={() => handleSort("fullName")}>User </span>
              {(sort[0] === "fullName" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-fullName" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("fullName", target)}
                value={filters.fullName || ""}
              />
            </th>
            <th>
              <span onClick={() => handleSort("userComment")}>
                {mode === "teaching" ? "Narrative" : "Comment"}{" "}
              </span>
              {(sort[0] === "userComment" && (
                <AiOutlineSortAscending style={{ fontSize: "1.5em" }} />
              )) ||
                (sort[0] === "-userComment" && (
                  <AiOutlineSortDescending style={{ fontSize: "1.5em" }} />
                ))}
              <br />
              <input
                className="form-control form-control-sm"
                type="text"
                aria-label=".form-control-sm example"
                onInput={({ target }) => handleFilter("userComment", target)}
                value={filters.userComment || ""}
              />
            </th>
          </tr>
        </thead>
          <PropagateLoader
            color={"#7A8288"}
            loading={props.loading || showSpinner || props.teachingLoading}
            // loading={props.loading}
            margin={"8"}
          />
        <tbody>
          {data.length > 0 && !showSpinner && (
            <AnnotationTable
              data={data}
              allSelected={allSelected}
              selected={props.selectedAnnotations}
              updateSelectedAims={updateSelectedAims}
              noOfRows={rows}
              getNewData={getNewData}
              bookmark={bookmark}
              switchToDisplay={() => props.history.push("/display")}
              pid={props.pid}
              handleSort={handleSort}
              handleFilter={handleFilter}
              filters={filters}
              teachingLoading={props.teachingLoading}
            />
          )}
        </tbody>
        {showSelectSeries && (
          <SeriesModal
            seriesPassed={seriesList}
            onCancel={() => {
              setShowSelectSeries(false);
            }}
            isTeachingFile={true}
            encrUrlArgs={encArgs}
            decrArgs={decrArgs}
            onSave={() => getNewData(0, true)}
            completeLoading={props.completeLoading}
            forceUpdatePage={props.forceUpdatePage}
          />
        )}
      </table>
      <DeleteAlert
        message={explanation.deleteSelected}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={deleteAllSelected}
        error={explanation.errorMessage}
        show={showDeleteModal}
      />
      <AnnotationDownloadModal
        onSubmit={() => {
          setShowDownload(false);
          getFieldSearchResults();
          //if (mode === 'teaching')
          //  getFieldSearchResults();
          //else
          //  getFieldSearchResults();
        }}
        onCancel={() => setShowDownload(false)}
        // updateStatus={() => console.log('update status')}
        projectID={selectedProject}
        show={showDownload}
      />
      {showWarning && (
        <WarningModal
          onOK={() => {
            setShowWarning(false);
            props.completeLoading();
          }}
          title={"No series to display"}
          message={`There is no Series to display in the Study. ${
            mode === "teaching" ? "The teaching file can not be created!" : ""
          }`}
        />
      )}
    </>
  );
};

const mapsStateToProps = (state) => {
  return {
    projectMap: state.annotationsListReducer.projectMap,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    openSeries: state.annotationsListReducer.openSeries,
    searchTableIndex: state.annotationsListReducer.searchTableIndex,
    refreshMap: state.annotationsListReducer.refreshMap,
  };
};

export default connect(mapsStateToProps)(AnnotationSearch);
