import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import ToolBar from "./toolbar";
import { FaRegEye, FaCommentsDollar } from "react-icons/fa";
import {
  getSummaryAnnotations,
  deleteAnnotation,
  getAllAnnotations,
} from "../../../services/annotationServices";
import { getProjects } from "../../../services/projectServices";
import matchSorter from "match-sorter";
import DeleteAlert from "../common/alertDeletionModal";
import UploadModal from "../../searchView/uploadModal";
import DownloadModal from "../../searchView/annotationDownloadModal";
import { MAX_PORT } from "../../../constants";
import {
  changeActivePort,
  jumpToAim,
  alertViewPortFull,
  addToGrid,
  getSingleSerie,
  getWholeData,
  updatePatient,
} from "../../annotationsList/action";
import WarningModal from "../../common/warningModal";
const mode = sessionStorage.getItem("mode");

const messages = {
  deleteSelected: "Delete selected annotations? This cannot be undone.",
  fillRequiredFields: "Please fill the required fields",
  dateFormat: "Date format should be M/d/yy.",
  title: "Item is open in display",
  itemOpen: {
    title: "Series is open in display",
    openSeries:
      "couldn't be deleted because the series is open. Please close it before deleting",
  },
};

class Annotations extends React.Component {
  state = {
    annotations: [],
    projectList: [],
    hasAddClicked: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    filteredData: null,
    uploadClicked: false,
    downloadClicked: false,
    projectID: "",
    allAims: [],
    seriesAlreadyOpen: false,
    selectedSeries: {},
  };

  componentDidMount = async () => {
    if (mode !== "lite") {
      const { data: projectList } = await getProjects();
      for (let i = 0; i < projectList.length; i++) {
        if (projectList[i].id === "all") {
          projectList.splice(i, 1);
          i = i - 1;
          continue;
        }
        if (projectList[i].id === "nonassigned") {
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
    }
  };

  componentDidUpdate = async prevProps => {
    try {
      const { projectID, refresh, lastEventId } = this.props;
      if (refresh && lastEventId !== prevProps.lastEventId) {
        await this.getAnnotationsData(projectID);
      }
    } catch (err) {
      console.log(err);
    }
  };

  getAnnotationsData = async projectID => {
    try {
      const { data: annotations } = projectID
        ? await getSummaryAnnotations(projectID)
        : await getAllAnnotations();
      this.setState({ annotations });
    } catch (err) {
      console.log(err);
    }
  };

  handleProjectSelect = e => {
    this.setState({ projectID: e.target.value });
    if (mode !== "lite") {
      e.target.value === "all_aims"
        ? this.getAnnotationsData()
        : this.getAnnotationsData(e.target.value);
      this.setState({ filteredData: null });
    }
  };

  handleFilterInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  toggleRow = async (id, projectID, seriesUID) => {
    projectID = projectID ? projectID : "lite";
    let newSelected = Object.assign({}, this.state.selected);
    let newSelectedSeries = Object.assign({}, this.state.selectedSeries);
    if (newSelected[id]) {
      delete newSelected[id];
      delete newSelectedSeries[id];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0,
        });
      }
    } else {
      newSelected[id] = projectID;
      newSelectedSeries[id] = seriesUID;
      await this.setState({
        selectAll: 2,
      });
    }
    this.setState({ selected: newSelected, selectedSeries: newSelectedSeries });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.annotations.forEach(annotation => {
        let projectID = annotation.projectID ? annotation.projectID : "lite";
        newSelected[annotation.aimID] = projectID;
      });
    }
    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0,
    });
  }

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      name: "",
      id: "",
      user: "",
      description: "",
      error: "",
      deleteAllClicked: false,
      uploadClicked: false,
      downloadClicked: false,
    });
  };

  closeWarningModal = () => {
    this.setState({ seriesAlreadyOpen: 0 });
  };

  deleteAllSelected = async () => {
    const notDeleted = [];
    let newSelected = Object.assign({}, this.state.selected);
    let newSelectedSeries = Object.assign({}, this.state.selectedSeries);

    const { selectedSeries } = this.state;
    const promiseArr = [];
    for (let annotation in newSelected) {
      const obj = {
        seriesUID: selectedSeries[annotation],
        projectID: newSelected[annotation],
      };
      if (!this.checkIfSerieOpen(obj, this.props.openSeries).isOpen) {
        const obj = { aimID: annotation, projectID: newSelected[annotation] };
        promiseArr.push(deleteAnnotation(obj));
      } else {
        notDeleted.push(annotation);
      }
    }

    Promise.all(promiseArr)
      .then(() => {
        this.getAnnotationsData(this.state.projectID);
        this.props.updateProgress();
        if (notDeleted.length === 0) {
          this.setState({ selectAll: 0, selected: {}, selectedSeries: {} });
        } else {
          this.setState({ seriesAlreadyOpen: notDeleted.length });
          for (let ann in newSelected) {
            if (!notDeleted.includes(ann)) {
              delete newSelected[ann];
              delete newSelectedSeries[ann];
            }
          }
          this.setState({
            selectAll: 2,
            selected: newSelected,
            selectedSeries: newSelectedSeries,
          });
        }
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getAnnotationsData();
      });
    this.handleCancel();
  };

  handleDeleteAll = () => {
    const selectedArr = Object.values(this.state.selected);
    const notSelected = selectedArr.includes(false) || selectedArr.length === 0;
    if (notSelected) {
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
      filteredData: null,
      name: "",
      subject: "",
      template: "",
      createdStart: "",
      createdEnd: "",
    });
  };

  handleKeyDown = e => {
    if (e.key === "Enter") {
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
      createdEnd,
    } = this.state;
    if (!(name || patientName || template || createdStart || createdEnd)) {
      return;
    } else {
      let filteredData = [].concat(this.state.annotations);
      filteredData = name
        ? this.filterText(filteredData, "name")
        : filteredData;
      filteredData = patientName
        ? this.filterText(filteredData, "patientName")
        : filteredData;
      filteredData = template
        ? this.filterText(filteredData, "template")
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
        const formattedDate = this.convertDateFormat(ann.date, "date");
        let date = new Date(formattedDate.split(" ")[0] + " 00:00:00");
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
          this.convertDateFormat(ann.date, "date").split(" ")[0] + " 00:00:00"
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
      const dateArr = dateString.split("-");
      dateArr[0] = dateArr[0].substring(2);
      dateArr[1] = dateArr[1][0] === "0" ? dateArr[1][1] : dateArr[1];
      dateArr[2] = dateArr[2][0] === "0" ? dateArr[2][1] : dateArr[2];
      return dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
    } catch (err) {
      console.log(err);
    }
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string;
    }
  };

  validateDateFormat = dateString => {
    const dateArr = dateString.split("/");
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
    if (!isValid) toast.warn(messages.dateFormat + " - " + dateString);
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

  openAnnotation = selected => {
    const { studyUID, seriesUID, aimID } = selected.original;
    const patientID = selected.original.subjectID;
    const projectID = selected.original.projectID
      ? selected.original.projectID
      : "lite";
    const { openSeries } = this.props;
    // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
    //check if there is enough space in the grid
    let isGridFull = openSeries.length === MAX_PORT;
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
        if (!this.props.patients[patientID]) {
          this.props.dispatch(getWholeData(null, null, selected.original));
        } else {
          this.props.dispatch(
            updatePatient(
              "annotation",
              true,
              patientID,
              studyUID,
              seriesUID,
              aimID
            )
          );
        }
      }
    }
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
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
        resizable: false,
      },
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
      },
      {
        Header: "Open",
        sortable: false,
        resizable: false,
        style: { display: "flex", justifyContent: "center" },
        Cell: original => {
          return (
            <Link className="open-link" to={"/display"}>
              <div onClick={() => this.openAnnotation(original)}>
                <FaRegEye className="menu-clickable" />
              </div>
            </Link>
          );
        },
      },
      {
        Header: "Subject",
        accessor: "patientName",
        sortable: true,
        resizable: true,
        Cell: original => {
          return (
            <div>{this.clearCarets(original.row.checkbox.patientName)}</div>
          );
        },
      },
      {
        accessor: "comment",
        sortable: true,
        resizable: true,
        className: "wrapped",
        style: { whiteSpace: "normal" },
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div>Modality / Series /</div>
              <div>Slice / Series #</div>
            </div>
          );
        },
      },
      {
        Header: "Template",
        accessor: "template",
        resizable: true,
        sortable: true,
      },
      {
        Header: "User",
        accessor: "userName",
        style: { whiteSpace: "normal" },
        resizable: true,
        sortable: true,
      },
      {
        Header: "Study",
        sortable: true,
        width: 75,
        accessor: "studyDate",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["date"] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = this.convertDateFormat(
            original.row.checkbox.studyDate,
            "studyDate"
          ).split(" ");
          return <div>{this.formatDate(studyDateArr[0])}</div>;
        },
      },
      {
        Header: "Created",
        sortable: true,
        accessor: "date",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["date"] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = this.convertDateFormat(
            original.row.checkbox.date,
            "date"
          ).split(" ");
          return <div>{this.formatDate(studyDateArr[0])}</div>;
        },
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
        accessor: "date",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["time"] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = this.convertDateFormat(
            original.row.checkbox.date,
            "date"
          ).split(" ");
          return <div>{studyDateArr[1]}</div>;
        },
      },
    ];
  };

  handleUpload = () => {
    this.setState({ uploadClicked: true });
  };

  convertDateFormat = (str, attr) => {
    try {
      let result = "";
      const dateArr = [];
      dateArr.push(str.substring(0, 4));
      dateArr.push(str.substring(4, 6));
      dateArr.push(str.substring(6, 8));
      if (attr === "date") {
        const timeArr = [];
        timeArr.push(str.substring(8, 10));
        timeArr.push(str.substring(10, 12));
        timeArr.push(str.substring(12));
        result = dateArr.join("-") + " " + timeArr.join(":");
      }
      if (attr === "studyDate") {
        result = dateArr.join("-") + " 00:00:00";
      }
      return result ? result : str;
    } catch (err) {
      console.log(err);
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
    this.getAnnotationsData(this.props.pid);

  };

  handleSubmitDownload = () => {
    this.setState({ selected: {}, selectAll: 0, selectedSeries: {} });
    this.handleCancel();
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const data = this.state.filteredData || this.state.annotations;
    const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    const { seriesAlreadyOpen, projectID } = this.state;
    const text = seriesAlreadyOpen > 1 ? "annotations" : "annotation";
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
          onKeyDown={this.handleKeyDown}
          pid={projectID}
        />
        <ReactTable
          NoDataComponent={() => null}
          className="pro-table"
          data={this.state.filteredData || this.state.annotations}
          columns={this.defineColumns()}
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={pageSize}
        />
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
            onSubmit={this.handleSubmitUpload}
            className="mng-upload"
            projectID={this.state.projectID}
            pid={this.props.pid}
            clearTreeData={this.props.clearTreeData}
          />
        )}
        {this.state.downloadClicked && (
          <DownloadModal
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmitDownload}
            updateStatus={() => console.log("update status")}
            selected={this.state.selected}
            className="mng-download"
          />
        )}
        {seriesAlreadyOpen > 0 && (
          <WarningModal
            onOK={this.closeWarningModal}
            title={messages.itemOpen.title}
            message={`${seriesAlreadyOpen} ${text} ${messages.itemOpen.openSeries}`}
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
  };
};

export default connect(mapsStateToProps)(Annotations);
