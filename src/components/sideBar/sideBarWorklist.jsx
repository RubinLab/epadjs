import React from "react";
import Table from "react-table";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { FaRegTrashAlt, FaRegEye } from "react-icons/fa";
import {
  getStudiesOfWorklist,
  deleteStudyFromWorklist
} from "../../services/worklistServices";
import { getSeries } from "../../services/seriesServices";
import DeleteAlert from "../management/common/alertDeletionModal";
import SeriesPopup from "./seriesPopup";
import { MAX_PORT } from "../../constants";
import {
  addToGrid,
  getSingleSerie,
  getWholeData,
  alertViewPortFull,
  updatePatient,
  clearSelection,
  changeActivePort
} from "../annotationsList/action";
const mode = sessionStorage.getItem("mode");

const messages = {
  deleteSingle: "Remove study from the worklist? This cannot be undone.",
  deleteSelected:
    "Delete selected studies from the worklist? This cannot be undone."
};

class WorkList extends React.Component {
  state = {
    worklists: [],
    singleDeleteData: {},
    deleteSingleClicked: false,
    // commentClicked: false,
    clickedIndex: null,
    selectAll: 0,
    selected: {},
    showSeries: false,
    series: [],
    selectedSeries: {},
    error: null
  };

  componentDidMount = async () => {
    this.getWorkListData();
  };

  componentDidUpdate = prevProps => {
    if (prevProps.match.params.wid !== this.props.match.params.wid) {
      this.getWorkListData();
    }
  };

  getWorkListData = async () => {
    const { data: worklists } = await getStudiesOfWorklist(
      sessionStorage.getItem("username"),
      this.props.match.params.wid
    );
    // for (let worklist of worklists) {
    //   const { data: projectDetails } = await getProject(worklist.projectID);
    //   worklist.projectName = projectDetails.name;
    // }
    this.setState({ worklists });
  };

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      error: "",
      deleteSingleClicked: false
    });
  };

  deleteStudyfromWorklist = async () => {
    const {
      worklist,
      projectID,
      subjectID,
      studyUID
    } = this.state.singleDeleteData;
    const body = [{ projectID, subjectID, studyUID }];
    deleteStudyFromWorklist(worklist, body)
      .then(() => {
        this.setState({ deleteSingleClicked: false, singleDeleteData: {} });
        this.getWorkListData();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
      });
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string.trim();
    }
  };

  handleSingleDelete = (worklist, projectID, subjectID, studyUID) => {
    this.setState({
      deleteSingleClicked: true,
      singleDeleteData: { worklist, projectID, subjectID, studyUID }
    });
  };

  setWrapperRef = (node, id) => {
    this.wrapperRef = node;
  };

  toggleRow = async (worklist, project, subject, study) => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[study]) {
      delete newSelected[study];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[study] = { worklist, project, subject, study };
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.worklists.forEach(worklist => {
        const { workListID, projectID, subjectID, studyUID } = worklist;
        newSelected[worklist.studyUID] = {
          workListID,
          projectID,
          subjectID,
          studyUID
        };
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  handleOpenClick = async study => {
    const { projectID, subjectID, studyUID } = study;
    const { data: series } = await getSeries(projectID, subjectID, studyUID);
    this.setState(state => ({
      showSeries: !state.showSeries,
      series
    }));
  };

  handleCancelOpenSeries = () => {
    this.setState(state => ({
      showSeries: !state.showSeries,
      series: [],
      error: null
    }));
  };

  defineColumns = () => {
    return [
      {
        id: "open",
        Header: "Open",
        width: 50,
        resizable: true,
        Cell: row => {
          return (
            <div onClick={() => this.handleOpenClick(row.original)}>
              <FaRegEye className="menu-clickable" />
            </div>
          );
        }
      },
      {
        id: "desc",
        Header: "Study Description",
        sortable: true,
        resizable: true,
        Cell: original => {
          let studyDesc = this.clearCarets(
            original.row._original.studyDescription
          );
          studyDesc = studyDesc ? studyDesc : "Unnamed Study";
          return <div>{studyDesc}</div>;
        }
      },

      {
        id: "sb_name",
        Header: "Subject Name",
        sortable: true,
        resizable: true,

        Cell: original => {
          let subjectName = this.clearCarets(
            original.row._original.subjectName
          );
          subjectName = subjectName ? subjectName : "Unnamed Subject";
          return <div>{subjectName}</div>;
        }
      },
      {
        id: "pr_name",
        Header: "Project Name",
        accessor: "projectName",
        sortable: true,
        resizable: true,
        show: mode === "thick",
        Cell: original => {
          let projectName = this.clearCarets(
            original.row._original.projectName
          );
          projectName = projectName ? projectName : "Unnamed Subject";
          return <div>{original.row._original.projectName}</div>;
        }
      },
      {
        id: "due",
        Header: "Due Date",
        sortable: true,
        resizable: true,
        accessor: "worklistDuedate"
      },
      {
        id: "studyUID",
        Header: "StudyUID",
        sortable: true,
        resizable: true,
        accessor: "studyUID"
      },
      {
        id: "delete",
        Header: "",
        width: 45,
        resizable: true,
        Cell: original => (
          <div
            onClick={() =>
              this.handleSingleDelete(
                original.row._original.workListID,
                original.row._original.projectID,
                original.row._original.subjectID,
                original.row._original.studyUID
              )
            }
          >
            <FaRegTrashAlt className="menu-clickable" />
          </div>
        )
      }
    ];
  };

  selectSeries = series => {
    const { selectedSeries } = this.state;
    selectedSeries[series.seriesUID]
      ? delete selectedSeries[series.seriesUID]
      : (selectedSeries[series.seriesUID] = series);
    this.setState({ selectedSeries });
  };

  checkIfSerieOpen = selectedSerie => {
    let isOpen = false;
    let index;
    this.props.openSeries.forEach((serie, i) => {
      if (serie.seriesUID === selectedSerie) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  viewSelection = async () => {
    const notOpenSeries = [];
    const selectedSeries = Object.values(this.state.selectedSeries);
    if (selectedSeries.length > 0) {
      //check if enough room to display selection
      for (let serie of selectedSeries) {
        if (!this.checkIfSerieOpen(serie.seriesUID).isOpen) {
          notOpenSeries.push(serie);
        }
      }
      //if all ports are full
      if (
        notOpenSeries.length > 0 &&
        this.props.openSeries.length === MAX_PORT
      ) {
        this.props.dispatch(alertViewPortFull());
      } else {
        //if all series already open update active port
        if (notOpenSeries.length === 0) {
          let index = this.checkIfSerieOpen(selectedSeries[0].seriesUID).index;
          this.props.dispatch(changeActivePort(index));
          this.props.history.push("/display");
          this.props.dispatch(clearSelection());
        } else {
          if (selectedSeries.length + this.props.openSeries.length > MAX_PORT) {
            // alert user about the num of open series a the moment and told only max_port is allowed
            const openPorts = this.props.openSeries.length;
            this.setState({
              error: `Already ${openPorts} viewers open. You can open ${MAX_PORT} at a time`
            });
          } else {
            //else get data for each serie for display
            selectedSeries.forEach(serie => {
              this.props.dispatch(addToGrid(serie));
              this.props.dispatch(getSingleSerie(serie));
            });
            for (let series of selectedSeries) {
              if (!this.props.patients[series.patientID]) {
                await this.props.dispatch(getWholeData(series));
              } else {
                this.props.dispatch(
                  updatePatient(
                    "serie",
                    true,
                    series.patientID,
                    series.studyUID,
                    series.seriesUID
                  )
                );
              }
            }
            this.props.history.push("/display");
            this.props.dispatch(clearSelection());
          }
        }
      }
    }
  };

  render = () => {
    const selected = this.state.selectAll < 2;
    const openSeriesUIDs = this.props.openSeries.map(el => el.seriesUID);

    return (
      <div className="worklist-page">
        <Table
          className="__table"
          data={this.state.worklists}
          columns={this.defineColumns()}
          pageSize={this.state.worklists.length}
          showPagination={false}
          NoDataComponent={() => null}
        />
        {this.state.deleteSingleClicked && (
          <DeleteAlert
            message={messages.deleteSingle}
            onCancel={this.handleCancel}
            onDelete={this.deleteStudyfromWorklist}
            error={this.state.errorMessage}
          />
        )}
        {this.state.showSeries && (
          <SeriesPopup
            series={this.state.series}
            open={this.viewSelection}
            cancel={this.handleCancelOpenSeries}
            selectSeries={this.selectSeries}
            error={this.state.error}
            openSeries={openSeriesUIDs}
          />
        )}
      </div>
    );
  };
}

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients
  };
};
export default connect(mapStateToProps)(WorkList);
