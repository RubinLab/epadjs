import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table-v6';
import ReactTooltip from 'react-tooltip';
import { toast } from 'react-toastify';
import ToolBar from './toolbar';
import { FaRegEye, FaEyeSlash, FaCommentsDollar } from 'react-icons/fa';
import {
  getSummaryAnnotations,
  downloadProjectAnnotation,
  getAllAnnotations,
  deleteAnnotationsList
} from '../../../services/annotationServices';
import { getProjects } from '../../../services/projectServices';
import matchSorter from 'match-sorter';
import DeleteAlert from '../common/alertDeletionModal';
import UploadModal from '../../searchView/uploadModal';
import DownloadModal from '../../searchView/annotationDownloadModal';
import {
  changeActivePort,
  jumpToAim,
  alertViewPortFull,
  addToGrid,
  getSingleSerie,
  getWholeData,
  updatePatient,
  startLoading,
  loadCompleted,
  annotationsLoadingError
} from '../../annotationsList/action';
import WarningModal from '../../common/warningModal';
import '../menuStyle.css';
import { getSeries } from '../../../services/seriesServices';
import SelectSeriesModal from '../../annotationsList/selectSerieModal';

const mode = sessionStorage.getItem('mode');
const maxPort = parseInt(sessionStorage.getItem("maxPort"));

const messages = {
  deleteSelected: 'Delete selected annotations? This cannot be undone.',
  fillRequiredFields: 'Please fill the required fields',
  dateFormat: 'Date format should be M/d/yy.',
  title: 'Item is open in display',
  itemOpen: {
    title: 'Series is open in display',
    openSeries:
      'could not be deleted because the series is open. Please close it before deleting'
  },
  downloadProject:
    'Preparing project for download. The link to the files will be sent with a notification after completion!'
};

class Annotations extends React.Component {
  state = {
    annotations: [],
    projectList: [],
    hasAddClicked: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    filteredData: [],
    uploadClicked: false,
    downloadClicked: false,
    projectID: '',
    allAims: [],
    seriesAlreadyOpen: {},
    total: 0,
    bookmark: '',
    pages: null,
    defaultPageSize: 10,
    pageSize: 10,
    page: 0,
    oldPageSize: 10,
    oldPage: 0,
    tableLoading: false,
    data: [],
    isSerieSelectionOpen: false,
    selectedStudy: [],
    studyName: '',
    change: ''
  };

  downloadProjectAim = () => {
    const pid = this.state.projectID || this.props.pid;
    if (pid === 'all_aims') return;
    downloadProjectAnnotation(pid)
      .then(result => {
        if (result.data.type === 'application/octet-stream') {
          let blob = new Blob([result.data], { type: 'application/zip' });
          this.triggerBrowserDownload(blob, `Project ${pid}`);
        } else
          toast.success(messages.downloadProject, {
            autoClose: false,
            position: 'bottom-left'
          });
      })
      .catch(err => console.error(err));
  };

  triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.style = 'display: none';
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  componentDidMount = async () => {
    if (mode !== 'lite') {
      const { data: projectList } = await getProjects();
      for (let i = 0; i < projectList.length; i++) {
        if (projectList[i].id === 'all') {
          projectList.splice(i, 1);
          i = i - 1;
          continue;
        }
        if (projectList[i].id === 'nonassigned') {
          projectList.splice(i, 1);
          i = i - 1;
          continue;
        }
      }
      const { pid } = this.props;
      if (projectList.length > 0) {
        const projectID = pid || projectList[0].id;
        this.setState({ projectList, projectID });
        this.getAnnotationsData(projectID);
      } else {
        this.setState({ projectList });
        this.getAnnotationsData();
      }
    } else {
      this.getAnnotationsData();
    }
  };

  componentDidUpdate = prevProps => {
    try {
      const { projectID, refresh, lastEventId } = this.props;
      let pid = this.state.projectID || projectID;
      if (refresh && lastEventId !== prevProps.lastEventId) {
        this.getAnnotationsData(pid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  populateDisplayRows = (list, pageSize, page) => {
    const { oldPageSize, oldPage, change } = this.state;

    if (oldPage !== page || oldPageSize !== pageSize) {
      let data = [];
      const size = pageSize || this.state.pageSize;
      const p = page >= 0 ? page : this.state.page;
      let startIndex;
      let endIndex;
      if (change === 'page') {
        startIndex = size * p;
        endIndex = size * (p + 1);
      } else if (change === 'pageSize') {
        if (oldPageSize * p < size) {
          // strt indx should be calculted from old page start index to new number
          const adjustedPage = p - 1 >= 0 ? p - 1 : 0;
          startIndex = size * adjustedPage;
          endIndex = size * (adjustedPage + 1);
          this.setState({ page: adjustedPage });
        } else {
          startIndex = size * p;
          endIndex = size * (p + 1);
        }
      } else {
        startIndex = size * p;
        endIndex = size * (p + 1);
      }
      if (list) {
        list.forEach((el, i) => {
          if (i >= startIndex && i < endIndex) data.push(el);
        });
      }
      return data;
    }
  };

  getAnnotationsData = async (projectID, bookmarkPassed, pageSize) => {
    try {
      const {
        data: { rows, total_rows, bookmark }
      } =
        projectID && projectID !== 'all_aims'
          ? await getSummaryAnnotations(projectID, bookmarkPassed)
          : await getAllAnnotations(bookmarkPassed);

      if (bookmarkPassed) {
        const pages = Math.ceil(total_rows / pageSize);
        const combinedRows = this.state.annotations.concat(rows);
        this.setState({
          annotations: combinedRows,
          total: total_rows,
          bookmark,
          pages
        });
        return combinedRows;
      } else {
        const pages = Math.ceil(total_rows / this.state.pageSize);
        const data = this.populateDisplayRows(rows);
        this.setState({
          annotations: rows,
          total: total_rows,
          bookmark,
          pages,
          data
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  handleProjectSelect = e => {
    this.setState({ projectID: e.target.value, page: 0 });

    if (e.target.value === 'all_aims') {
      this.getAnnotationsData();
      this.setState({ isAllAims: true });
    } else {
      this.getAnnotationsData(e.target.value);
      this.setState({ isAllAims: false });
    }
    this.setState({ filteredData: [] });
  };

  handleFilterInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  toggleRow = async (id, projectID, seriesUID) => {
    projectID = projectID ? projectID : 'lite';
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[id]) {
      delete newSelected[id];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[id] = { projectID, seriesUID };
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    const { filteredData, annotations } = this.state;
    const selectedAims = filteredData?.length ? filteredData : annotations;
    if (this.state.selectAll === 0) {
      selectedAims.forEach(annotation => {
        const projectID = annotation.projectID ? annotation.projectID : 'lite';
        const { seriesUID } = annotation;
        newSelected[annotation.aimID] = { projectID, seriesUID };
      });
    }
    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      name: '',
      id: '',
      user: '',
      description: '',
      error: '',
      deleteAllClicked: false,
      uploadClicked: false,
      downloadClicked: false
    });
  };

  closeWarningModal = () => {
    this.setState({ seriesAlreadyOpen: 0 });
  };

  deleteAllSelected = () => {
    const notDeleted = {};
    let newSelected = Object.assign({}, this.state.selected);
    const toBeDeleted = {};
    const promiseArr = [];
    for (let annotation in newSelected) {
      const { projectID } = newSelected[annotation];
      if (
        this.checkIfSerieOpen(newSelected[annotation], this.props.openSeries)
          .isOpen
      ) {
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
        this.getAnnotationsData(this.state.projectID);
        this.props.updateProgress();
        const keys = Object.keys(notDeleted);
        this.props.clearAllTreeData();
        keys.length === 0
          ? this.setState({ selectAll: 0, selected: {}, filteredData: [] })
          : this.setState({
            seriesAlreadyOpen: keys.length,
            selected: notDeleted,
            selectAll: 2
          });
      })
      .catch(error => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        )
          toast.error(error.response.data.message, { autoClose: false });
        this.getAnnotationsData(this.state.projectID);
      });
    this.handleCancel();
  };

  handleDeleteAll = () => {
    const selectedArr = Object.values(this.state.selected);
    const notSelected = selectedArr.includes(false) || selectedArr.length === 0;
    if (notSelected || this.state.isAllAims) {
      return;
    } else {
      this.setState({ deleteAllClicked: true });
    }
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleClearFilter = () => {
    this.setState({
      filteredData: [],
      name: '',
      subject: '',
      template: '',
      createdStart: '',
      createdEnd: '',
      isAllAims: false
    });
  };

  handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.filterTableData();
    }
  };
  filterTableData = () => {
    const {
      name,
      patientName,
      template,
      createdStart,
      createdEnd
    } = this.state;
    if (!(name || patientName || template || createdStart || createdEnd)) {
      return;
    } else {
      let filteredData = [].concat(this.state.annotations);
      filteredData = name
        ? this.filterText(filteredData, 'name')
        : filteredData;
      filteredData = patientName
        ? this.filterText(filteredData, 'patientName')
        : filteredData;
      filteredData = template
        ? this.filterText(filteredData, 'template')
        : filteredData;
      filteredData = createdStart
        ? this.filterStartDate(filteredData)
        : filteredData;
      filteredData = createdEnd
        ? this.filterEndDate(filteredData)
        : filteredData;
      this.setState({ filteredData });
    }
  };

  filterText = (arr, propName) => {
    const result = [];
    const input = this.state[propName].toLowerCase();
    for (let ann of arr) {
      if (ann[propName].toLowerCase().includes(input)) {
        result.push(ann);
      }
    }
    return result;
  };

  filterStartDate = arr => {
    const result = [];
    if (this.validateDateFormat(this.state.createdStart)) {
      const input = new Date(this.state.createdStart);
      for (let ann of arr) {
        const formattedDate = this.convertDateFormat(ann.date, 'date');
        let date = new Date(formattedDate.split(' ')[0] + ' 00:00:00');
        if (date >= input) {
          result.push(ann);
        }
      }
    }
    return result;
  };

  filterEndDate = arr => {
    const result = [];
    if (this.validateDateFormat(this.state.createdEnd)) {
      const input = new Date(this.state.createdEnd);
      for (let ann of arr) {
        let date = new Date(
          this.convertDateFormat(ann.date, 'date').split(' ')[0] + ' 00:00:00'
        );
        if (date <= input) {
          result.push(ann);
        }
      }
    }
    return result;
  };

  formatDate = dateString => {
    try {
      const dateArr = dateString.split('-');
      dateArr[0] = dateArr[0].substring(2);
      dateArr[1] = dateArr[1][0] === '0' ? dateArr[1][1] : dateArr[1];
      dateArr[2] = dateArr[2][0] === '0' ? dateArr[2][1] : dateArr[2];
      return dateArr[1] + '/' + dateArr[2] + '/' + dateArr[0];
    } catch (err) {
      console.error(err);
    }
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace('^', ' ');
      }
      return string;
    }
  };

  validateDateFormat = dateString => {
    const dateArr = dateString.split('/');
    const validFormat = dateArr.length === 3;
    let validMonth;
    let validDay;
    let validYear;

    if (validFormat) {
      validMonth = parseInt(dateArr[0]) <= 12 && parseInt(dateArr[0]) >= 1;
      validDay = parseInt(dateArr[1]) <= 31 && parseInt(dateArr[1]) >= 1;
      validYear = dateArr[2].length === 2;
    }
    const isValid = validFormat && validMonth && validDay && validYear;
    if (!isValid) toast.warn(messages.dateFormat + ' - ' + dateString);
    return isValid;
  };

  checkIfSerieOpen = (obj, openSeries) => {
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

  openAnnotation = async selected => {
    try {
      const {
        studyUID,
        seriesUID,
        aimID,
        patientName,
        name
      } = selected.original;
      const patientID = selected.original.subjectID;
      const projectID = selected.original.projectID
        ? selected.original.projectID
        : 'lite';
      const { openSeries } = this.props;
      // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
      //check if there is enough space in the grid
      let isGridFull = openSeries.length === maxPort;
      //check if the serie is already open
      if (
        this.checkIfSerieOpen(selected.original, this.props.openSeries).isOpen
      ) {
        const { index } = this.checkIfSerieOpen(
          selected.original,
          this.props.openSeries
        );
        this.props.dispatch(changeActivePort(index));
        this.props.dispatch(jumpToAim(seriesUID, aimID, index));
      } else {
        if (isGridFull) {
          this.props.dispatch(alertViewPortFull());
        } else {
          this.props.dispatch(addToGrid(selected.original, aimID));
          this.props.dispatch(getSingleSerie(selected.original, aimID));
          //if grid is NOT full check if patient data exists
          // -----> Delete after v1.0 <-----
          // if (!this.props.patients[patientID]) {
          //   // this.props.dispatch(getWholeData(null, null, selected.original));
          //   getWholeData(null, null, selected.original);
          // } else {
          //   this.props.dispatch(
          //     updatePatient(
          //       'annotation',
          //       true,
          //       patientID,
          //       studyUID,
          //       seriesUID,
          //       aimID
          //     )
          //   );
          // }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  defineColumns = () => {
    return [
      {
        id: 'checkbox',
        accessor: '',
        width: 30,
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[original.aimID]}
              onChange={() =>
                this.toggleRow(
                  original.aimID,
                  original.projectID,
                  original.seriesUID
                )
              }
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selectAll === 1}
              ref={input => {
                if (input) {
                  input.indeterminate = this.state.selectAll === 2;
                }
              }}
              onChange={() => this.toggleSelectAll()}
            />
          );
        },
        resizable: false
      },
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
        resizable: true
      },
      {
        Header: 'Open',
        sortable: false,
        resizable: false,
        style: { display: 'flex', justifyContent: 'center' },
        Cell: data => {
          return this.state.isAllAims ? (
            <FaEyeSlash />
          ) : (
            <Link className="open-link" to={'/display'}>
              <div
                data-tip
                data-for="open-annotations"
                onClick={() => {
                  if (
                    data.original.seriesUID === 'noseries' ||
                    !data.original.seriesUID
                  ) {
                    this.displaySeries(data.original);
                  } else {
                    this.openAnnotation(data);
                    this.props.onClose();
                  }
                }}
              >
                <FaRegEye className="menu-clickable" />
                <ReactTooltip
                  id="open-annotations"
                  place="left"
                  type="info"
                  delayShow={1000}
                >
                  <span className="filter-label">Open annotation</span>
                </ReactTooltip>{' '}
              </div>
            </Link>
          );
        }
      },
      {
        Header: 'Subject',
        accessor: 'patientName',
        sortable: true,
        resizable: true,
        Cell: original => {
          return (
            <div>{this.clearCarets(original.row.checkbox.patientName)}</div>
          );
        }
      },
      {
        accessor: 'comment',
        sortable: true,
        resizable: true,
        className: 'wrapped',
        style: { whiteSpace: 'normal' },
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div>Modality / Series /</div>
              <div>Slice / Series #</div>
            </div>
          );
        }
      },
      {
        Header: 'Template',
        accessor: 'template',
        resizable: true,
        sortable: true
      },
      {
        Header: 'User',
        accessor: 'userName',
        style: { whiteSpace: 'normal' },
        resizable: true,
        sortable: true
      },
      {
        Header: 'Study',
        sortable: true,
        width: 75,
        accessor: 'studyDate',
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ['date'] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = this.convertDateFormat(
            original.row.checkbox.studyDate,
            'studyDate'
          ).split(' ');
          return <div>{this.formatDate(studyDateArr[0])}</div>;
        }
      },
      {
        Header: 'Created',
        sortable: true,
        accessor: 'date',
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ['date'] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = this.convertDateFormat(
            original.row.checkbox.date,
            'date'
          ).split(' ');
          return <div>{this.formatDate(studyDateArr[0])}</div>;
        }
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div>Created</div>
              <div>Time</div>
            </div>
          );
        },
        sortable: true,
        accessor: 'date',
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ['time'] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = this.convertDateFormat(
            original.row.checkbox.date,
            'date'
          ).split(' ');
          return <div>{studyDateArr[1]}</div>;
        }
      }
    ];
  };

  handleUpload = () => {
    this.setState({ uploadClicked: true });
  };

  convertDateFormat = (str, attr) => {
    try {
      let result = '';
      const dateArr = [];
      dateArr.push(str.substring(0, 4));
      dateArr.push(str.substring(4, 6));
      dateArr.push(str.substring(6, 8));
      if (attr === 'date') {
        const timeArr = [];
        timeArr.push(str.substring(8, 10));
        timeArr.push(str.substring(10, 12));
        timeArr.push(str.substring(12));
        result = dateArr.join('-') + ' ' + timeArr.join(':');
      }
      if (attr === 'studyDate') {
        result = dateArr.join('-') + ' 00:00:00';
      }
      return result ? result : str;
    } catch (err) {
      console.error(err);
      return str;
    }
  };

  handleDownload = () => {
    const selectedArr = Object.values(this.state.selected);
    const notSelected = selectedArr.includes(false) || selectedArr.length === 0;
    if (notSelected) {
      return;
    } else {
      this.setState({ downloadClicked: true });
    }
  };

  handleSubmitUpload = () => {
    this.handleCancel();
    this.getAnnotationsData(this.state.projectID);
  };

  handleSubmitDownload = () => {
    this.setState({ selected: {}, selectAll: 0 });
    this.handleCancel();
  };

  fetchData = async atributes => {
    try {
      const { projectID, bookmark, annotations, total } = this.state;
      const { page, pageSize, oldPage, oldPageSize } = this.state;
      const pageNum = page + 1;
      if (
        total > annotations.length &&
        pageSize * pageNum > annotations.length
      ) {
        this.setState({ tableLoading: true, page, pageSize });
        const rows = await this.getAnnotationsData(
          projectID,
          bookmark,
          pageSize
        );
        this.setState({ tableLoading: false });
        const data = this.populateDisplayRows(rows, pageSize, page);
        this.setState({ data });
      } else {
        if (page !== oldPage || pageSize !== oldPageSize) {
          const data = this.populateDisplayRows(annotations, pageSize, page);
          this.setState({ data });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  getSeriesData = async selected => {
    this.props.dispatch(startLoading());
    const { projectID, patientID, studyUID } = selected;
    try {
      const { data: series } = await getSeries(projectID, patientID, studyUID);
      this.props.dispatch(loadCompleted());
      return series;
    } catch (err) {
      this.props.dispatch(annotationsLoadingError(err));
    }
  };

  excludeOpenSeries = allSeriesArr => {
    const result = [];
    //get all series number in an array
    const idArr = this.props.openSeries.reduce((all, item, index) => {
      all.push(item.seriesUID);
      return all;
    }, []);
    //if array doesnot include that serie number
    allSeriesArr.forEach(serie => {
      if (!idArr.includes(serie.seriesUID)) {
        //push that serie in the result arr
        result.push(serie);
      }
    });
    return result;
  };

  displaySeries = async selected => {
    if (this.props.openSeries.length === maxPort) {
      this.props.dispatch(alertViewPortFull());
    } else {
      const { subjectID: patientID, studyUID } = selected;
      let seriesArr;
      //check if the patient is there (create a patient exist flag)
      const patientExists = this.props.patients[patientID];
      //if there is patient iterate over the series object of the study (form an array of series)
      if (patientExists) {
        seriesArr = Object.values(
          this.props.patients[patientID].studies[studyUID].series
        );
        //if there is not a patient get series data of the study and (form an array of series)
      } else {
        seriesArr = await this.getSeriesData(selected);
      }
      //get extraction of the series (extract unopen series)
      if (seriesArr.length > 0) seriesArr = this.excludeOpenSeries(seriesArr);
      //check if there is enough room
      if (seriesArr.length + this.props.openSeries.length > maxPort) {
        //if there is not bring the modal
        await this.setState({
          isSerieSelectionOpen: true,
          selectedStudy: [seriesArr],
          studyName: selected.studyDescription
        });
      } else {
        //if there is enough room
        //add serie to the grid
        const promiseArr = [];
        for (let serie of seriesArr) {
          this.props.dispatch(addToGrid(serie));
          promiseArr.push(this.props.dispatch(getSingleSerie(serie)));
        }
        //getsingleSerie
        Promise.all(promiseArr)
          .then(() => { })
          .catch(err => console.error(err));

        //if patient doesnot exist get patient
        // -----> Delete after v1.0 <-----
        // if (!patientExists) {
        //   // this.props.dispatch(getWholeData(null, selected));
        //   getWholeData(null, selected);
        // } else {
        //   //check if study exist
        //   this.props.dispatch(
        //     updatePatient('study', true, patientID, studyUID)
        //   );
        // }
      }
    }
  };

  closeSelectionModal = () => {
    this.setState(state => ({
      isSerieSelectionOpen: !state.isSerieSelectionOpen
    }));
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const {
      seriesAlreadyOpen,
      projectID,
      defaultPageSize,
      pages,
      tableLoading,
      filteredData,
      pageSize,
      page,
      data
    } = this.state;
    const rowsToDisplay = filteredData.length > 0 ? filteredData : data;
    const text = seriesAlreadyOpen > 1 ? 'annotations' : 'annotation';
    return (
      <div className="annotations menu-display" id="annotation">
        <ToolBar
          className="pro-table"
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
          projects={this.state.projectList}
          onSelect={this.handleProjectSelect}
          onClear={this.handleClearFilter}
          onType={this.handleFilterInput}
          onFilter={this.filterTableData}
          onUpload={this.handleUpload}
          onDownload={this.handleDownload}
          onProjectDownload={this.downloadProjectAim}
          onKeyDown={this.handleKeyDown}
          pid={projectID}
          isAllAims={this.state.isAllAims}
        />
        {this.state.data.length > 0 && (
          <ReactTable
            NoDataComponent={() => null}
            className="pro-table"
            style={{ maxHeight: '40rem' }}
            manual
            data={rowsToDisplay}
            columns={this.defineColumns()}
            loading={tableLoading}
            pages={pages}
            page={page}
            pageSizeOptions={[10, 20, 50, 100]}
            pageSize={pageSize}
            defaultPageSize={defaultPageSize}
            onFetchData={() => {
              setTimeout(() => {
                this.fetchData();
              }, 10);
            }}
            // {this.fetchData}
            onPageChange={page => {
              const oldPage = this.state.page;
              this.setState({ page, oldPage, change: 'page' });
            }}
            showPageJump={false}
            onPageSizeChange={size => {
              const oldPageSize = this.state.pageSize;
              if (filteredData && filteredData.length > 0)
                this.setState({
                  pages: Math.ceil(filteredData.length / size),
                  pageSize: size,
                  oldPageSize
                });
              else {
                this.setState({
                  pages: Math.ceil(this.state.total / size),
                  pageSize: size,
                  oldPageSize
                });
              }
              this.setState({ change: 'pageSize' });
            }}
          />
        )}
        {this.state.deleteAllClicked && (
          <DeleteAlert
            message={messages.deleteSelected}
            onCancel={this.handleCancel}
            onDelete={this.deleteAllSelected}
            error={this.state.errorMessage}
          />
        )}
        {this.state.uploadClicked && (
          <UploadModal
            onCancel={this.handleCancel}
            onResolve={this.handleSubmitUpload}
            className="mng-upload"
            projectID={this.state.projectID}
            pid={this.props.pid}
            clearTreeData={this.props.clearTreeData}
            clearTreeExpand={this.props.clearTreeExpand}
          />
        )}
        {this.state.downloadClicked && (
          <DownloadModal
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmitDownload}
            updateStatus={() => console.log('update status')}
            selected={this.state.selected}
            className="mng-download"
            projectID={this.state.projectID}
          />
        )}
        {seriesAlreadyOpen > 0 && (
          <WarningModal
            onOK={this.closeWarningModal}
            title={messages.itemOpen.title}
            message={`${seriesAlreadyOpen} ${text} ${messages.itemOpen.openSeries}`}
          />
        )}
        {this.state.isSerieSelectionOpen && (
          <SelectSeriesModal
            seriesPassed={this.state.selectedStudy}
            onCancel={this.closeSelectionModal}
            studyName={this.state.studyName}
          />
        )}
      </div>
    );
  };
}

const mapsStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    uploadedPid: state.annotationsListReducer.uploadedPid,
    lastEventId: state.annotationsListReducer.lastEventId,
    refresh: state.annotationsListReducer.refresh,
    projectMap: state.annotationsListReducer.projectMap
  };
};

export default connect(mapsStateToProps)(Annotations);
