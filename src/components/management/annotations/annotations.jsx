import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Table from "react-table";
import { toast } from "react-toastify";
import ToolBar from "./toolbar";
import { FaRegEye } from "react-icons/fa";
import {
  getSummaryAnnotations,
  deleteAnnotation
} from "../../../services/annotationServices";
import { getProjects } from "../../../services/projectServices";
import matchSorter from "match-sorter";
import { isLite } from "../../../config.json";
import DeleteAlert from "../common/alertDeletionModal";
import UploadModal from "../../searchView/uploadModal";
import DownloadModal from "../../searchView/annotationDownloadModal";
import { MAX_PORT } from "../../../constants";

const messages = {
  deleteSelected: "Delete selected annotations? This cannot be undone.",
  fillRequiredFields: "Please fill the required fields",
  dateFormat: "Date format should be M/d/yy."
};

class Annotations extends React.Component {
  state = {
    annotations: [],
    projectList: [],
    // singleDeleteData: {},
    // deleteSingleClicked: false,
    hasAddClicked: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    filteredData: null,
    uploadClicked: false,
    downloadClicked: false,
    projectID: ""
  };

  componentDidMount = async () => {
    if (!isLite) {
      const {
        data: {
          ResultSet: { Result: projectList }
        }
      } = await getProjects();
      this.getAnnotationsData(projectList[0].id);
      this.setState({ projectList, projectID: projectList[0].id });
    } else {
      this.getAnnotationsData();
    }
  };

  getAnnotationsData = async projectID => {
    const {
      data: {
        ResultSet: { Result: annotations }
      }
    } = await getSummaryAnnotations(projectID);
    if (isLite) {
      for (let ann of annotations) {
        ann.date = ann.date + "";
        ann.studyDate = ann.studyDate + "";

        let year1 = ann.date.substring(0, 4);
        let month1 = ann.date.substring(4, 6);
        let day1 = ann.date.substring(6, 8);
        let hour = ann.date.substring(8, 10);
        let min = ann.date.substring(10, 12);
        let sec = ann.date.substring(12);
        let dateFormat = year1 + "-" + month1 + "-" + day1;
        let timeFormat = hour + ":" + min + ":" + sec;
        let date = dateFormat + " " + timeFormat;

        let year2 = ann.studyDate.substring(0, 4);
        let month2 = ann.studyDate.substring(4, 6);
        let day2 = ann.studyDate.substring(6, 8);
        let studyDate = year2 + "-" + month2 + "-" + day2 + " " + "00:00:00";
        ann.date = date;
        ann.studyDate = studyDate;
      }
    }
    this.setState({ annotations });
  };

  handleProjectSelect = e => {
    this.setState({ projectID: e.target.value });
    if (!isLite) {
      this.getAnnotationsData(e.target.value);
      this.setState({ filteredData: null });
    }
  };

  handleFilterInput = e => {
    const { name, value } = e.target;
    this.setState({ name: value });
  };

  toggleRow = async (id, projectID) => {
    projectID = projectID ? projectID : "lite";
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[id]) {
      newSelected[id] = false;
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[id] = projectID;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.worklists.forEach(project => {
        newSelected[project.workListID] = project.username;
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
      name: "",
      id: "",
      user: "",
      description: "",
      error: "",
      deleteAllClicked: false,
      uploadClicked: false,
      downloadClicked: false
    });
  };

  deleteAllSelected = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    const promiseArr = [];
    for (let annotation in newSelected) {
      promiseArr.push(deleteAnnotation(annotation, newSelected[annotation]));
    }
    Promise.all(promiseArr)
      .then(() => {
        console.log(this.state.projectID);
        this.getAnnotationsData(this.state.projectID);
        this.setState({ selectAll: 0 });
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
      createdEnd: ""
    });
  };

  handleFilterInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
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
        let date = new Date(ann.date.split(" ")[0] + " 00:00:00");
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
        let date = new Date(ann.date.split(" ")[0] + " 00:00:00");
        if (date <= input) {
          result.push(ann);
        }
      }
    }
    return result;
  };

  formatDate = dateString => {
    const dateArr = dateString.split("-");
    dateArr[0] = dateArr[0].substring(2);
    dateArr[1] = dateArr[1][0] === "0" ? dateArr[1][1] : dateArr[1];
    dateArr[2] = dateArr[2][0] === "0" ? dateArr[2][1] : dateArr[2];
    return dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
  };

  clearCarets = string => {
    var i = 0,
      length = string.length;
    for (i; i < length; i++) {
      string = string.replace("^", " ");
    }
    return string;
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

  openAnnotation = selected => {
    const { studyUID, seriesUID, aimID } = selected.original;
    const patientID = selected.original.subjectID;
    const projectID = selected.original.projectID
      ? selected.original.projectID
      : "lite";
    // const { openSeries } = this.props;
    // // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
    // //check if there is enough space in the grid
    // let isGridFull = openSeries.length === MAX_PORT;
    // //check if the serie is already open
    // if (this.checkIfSerieOpen(seriesUID).isOpen) {
    //   const { index } = this.checkIfSerieOpen(seriesUID);
    //   this.props.dispatch(changeActivePort(index));
    //   this.props.dispatch(jumpToAim(seriesUID, aimID, index));
    // } else {
    //   if (isGridFull) {
    //     this.props.dispatch(alertViewPortFull());
    //   } else {
    //     this.props.dispatch(addToGrid(selected, aimID));
    //     this.props.dispatch(getSingleSerie(selected, aimID));
    //     //if grid is NOT full check if patient data exists
    //     if (!this.props.patients[patientID]) {
    //       this.props.dispatch(getWholeData(null, null, selected));
    //     } else {
    //       this.props.dispatch(
    //         updatePatient(
    //           "annotation",
    //           true,
    //           patientID,
    //           studyUID,
    //           seriesUID,
    //           aimID
    //         )
    //       );
    //     }
    //   }
    // }
    // this.props.dispatch(clearSelection());
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
                this.toggleRow(original.aimID, original.projectID)
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
        sortable: false,
        minResizeWidth: 20,
        width: 45
      },
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Open",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        width: 50,
        Cell: original => {
          return (
            <div onClick={() => this.openAnnotation(original)}>
              <FaRegEye className="menu-clickable" />
            </div>
          );
        }
      },
      {
        Header: "Subject",
        accessor: "patientName",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          return (
            <div>{this.clearCarets(original.row.checkbox.patientName)}</div>
          );
        }
      },
      {
        Header: "Modality / Series / Slice / Series #",
        accessor: "comment",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
        // Cell: original => <div>{original.row.checkbox.description || ""}</div>
      },
      {
        Header: "Template",
        accessor: "template",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        sortable: true
      },
      {
        Header: "User",
        accessor: "userName",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        sortable: true
      },
      {
        Header: "Study",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        accessor: "studyDate",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["date"] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = original.row.checkbox.studyDate.split(" ");
          return <div>{this.formatDate(studyDateArr[0])}</div>;
        }
      },
      {
        Header: "Created",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        accessor: "date",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["date"] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = original.row.checkbox.date.split(" ");
          return <div>{this.formatDate(studyDateArr[0])}</div>;
        }
      },
      {
        Header: "Created Time",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        accessor: "date",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["time"] }),
        filterAll: true,
        Cell: original => {
          const studyDateArr = original.row.checkbox.date.split(" ");
          return <div>{studyDateArr[1]}</div>;
        }
      }
    ];
  };

  handleUpload = () => {
    this.setState({ uploadClicked: true });
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
    this.getAnnotationsData();
    this.handleCancel();
  };

  handleSubmitDownload = () => {
    this.setState({ selected: {}, selectAll: 0 });
    this.handleCancel();
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    return (
      <div className="annotations menu-display" id="annotation">
        <ToolBar
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
          projects={this.state.projectList}
          onSelect={this.handleProjectSelect}
          onClear={this.handleClearFilter}
          onType={this.handleFilterInput}
          onFilter={this.filterTableData}
          onUpload={this.handleUpload}
          onDownload={this.handleDownload}
        />
        <Table
          className="pro-table"
          data={this.state.filteredData || this.state.annotations}
          columns={this.defineColumns()}
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
      </div>
    );
  };
}

const mapsStateToProps = state => {
  return { openSeries: state.annotationsListReducer.openSeries };
};

export default connect(mapsStateToProps)(Annotations);
