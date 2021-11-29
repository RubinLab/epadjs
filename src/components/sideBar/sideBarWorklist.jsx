import React from "react";
import Table from "react-table-v6";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { FaRegEye } from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import ReactTooltip from "react-tooltip";
import {
  GrDocumentMissing,
  GrDocumentVerified,
  GrDocumentPerformance,
  GrTrash,
  GrCalculator,
  GrManual
} from "react-icons/gr";
import { GoGraph, GoCheck } from "react-icons/go";
import {
  getStudiesOfWorklist,
  deleteStudyFromWorklist,
  updateWorklistProgressManually
} from "../../services/worklistServices";
import { getSeries } from "../../services/seriesServices";
import DeleteAlert from "../management/common/alertDeletionModal";
import SelectSeriesModal from "../annotationsList/selectSerieModal";
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
    "Delete selected studies from the worklist? This cannot be undone.",
  notAuthorizedProjects:
    "You do not have access to all of the projects of the worklist. Please contact to your admin about projects:"
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
    error: null,
    patients: [],
    projects: [],
    studyName: ""
  };

  componentDidMount = async () => {
    this.getWorkListData(true);
  };

  componentDidUpdate = prevProps => {
    if (prevProps.match.params.wid !== this.props.match.params.wid) {
      this.getWorkListData(true);
      this.setState({
        patients: [],
        projects: []
      });
    }

    if (prevProps.reports.length !== this.props.reports.length) {
      this.setState({
        patients: [],
        projects: []
      });
    }
  };

  filterProjects = worklists => {
    const filteredWorklists = [];
    const notAuthorized = [];
    const { projectMap } = this.props;
    worklists.forEach((el, i) => {
      if (!projectMap[el.projectID]) notAuthorized.push(el.projectID);
      else filteredWorklists.push(el);
    });
    return { notAuthorized, filteredWorklists };
  };

  getWorkListData = async showError => {
    const { data: worklists } = await getStudiesOfWorklist(
      sessionStorage.getItem("username"),
      this.props.match.params.wid
    );
    const { notAuthorized, filteredWorklists } = this.filterProjects(worklists);
    this.setState({ worklists: filteredWorklists });
    if (showError && Array.isArray(notAuthorized) && notAuthorized.length > 0) {
      const projectList = notAuthorized.reduce((all, item, i) => {
        return `${all} ${item}${notAuthorized.length - 1 === i ? "" : ", "}`;
      }, "");
      const message = `${messages.notAuthorizedProjects} ${projectList}`;
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
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
    const { projectID, subjectID, studyUID, studyDescription } = study;
    const { data: series } = await getSeries(projectID, subjectID, studyUID);
    this.setState(state => ({
      showSeries: !state.showSeries,
      series,
      studyName: studyDescription
    }));
  };

  handleCancelOpenSeries = () => {
    this.setState(state => ({
      showSeries: !state.showSeries,
      series: [],
      error: null
    }));
  };

  handleClickProgresButton = (
    workListID,
    projectID,
    subjectID,
    studyUID,
    status
  ) => {
    updateWorklistProgressManually(
      workListID,
      projectID,
      subjectID,
      studyUID,
      status
    )
      .then(() => this.getWorkListData())
      .catch(err => console.error(err));
  };

  checkPairExist = (subjectID, projectID) => {
    const indexOfSubject = this.state.patients.indexOf(subjectID);
    const indexOfProject = this.state.projects.indexOf(projectID);
    const matchPair =
      indexOfSubject === indexOfProject ||
      this.state.patients[indexOfProject] === subjectID;
    const pairExists = indexOfSubject > -1 && indexOfProject > -1 && matchPair;
    return {
      indexOfSubject,
      indexOfProject,
      pairExists
    };
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
        // Header: "%",
        width: 25,
        resizable: false,
        Cell: original => {
          const isAuto = original.row._original.progressType === "AUTO";
          const variant = isAuto ? "info" : "light";
          const text = isAuto ? <GrCalculator /> : <GrManual />;
          const tooltipText = isAuto
            ? "Progress by annotations"
            : "Progress manually";
          return (
            <div>
              <Badge
                data-tip
                data-for={`progressType-badge${original.index}`}
                variant={variant}
              >
                {text}
              </Badge>
              <ReactTooltip
                id={`progressType-badge${original.index}`}
                place="right"
                type="light"
                delayShow={1000}
              >
                <span>{tooltipText}</span>
              </ReactTooltip>
            </div>
          );
        }
      },
      {
        // Header: "%",
        width: 25,
        resizable: false,
        sortable: true,
        accessor: "completeness",
        sortMethod: (a, b) => a - b,
        Cell: original => {
          const { completeness } = original.row._original;
          let variant;
          let text;
          let tooltipText;
          if (completeness === 0) {
            variant = "danger";
            text = <GrDocumentMissing />;
            tooltipText = "Not started";
          } else if (completeness === 100) {
            variant = "success";
            text = <GrDocumentVerified />;
            tooltipText = "Completed";
          } else {
            variant = "warning";
            text = <GrDocumentPerformance />;
            tooltipText = "In progress";
          }
          return (
            <div>
              <Badge
                data-tip
                data-for={`progress-badge${original.index}`}
                variant={variant}
              >
                {text}
              </Badge>
              <ReactTooltip
                id={`progress-badge${original.index}`}
                place="right"
                type="light"
                delayShow={1000}
              >
                <span>{tooltipText}</span>
              </ReactTooltip>
            </div>
          );
        }
      },
      {
        id: "desc",
        Header: "Study Description",
        width: 240,
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
        id: "graph",
        Header: "Report",
        width: 45,
        sortable: false,
        resizable: false,
        Cell: original => {
          // console.log(original.row._original);
          const newPatients = [...this.state.patients];
          const newProjects = [...this.state.projects];
          const { subjectID, projectID } = original.row._original;
          const {
            indexOfSubject,
            indexOfProject,
            pairExists
          } = this.checkPairExist(subjectID, projectID);
          const variant = pairExists ? "success" : "primary";
          const icon = variant === "success" ? <GoCheck /> : <GoGraph />;
          const text = variant === "success" ? "" : "";
          return (
            <div>
              <Button
                data-tip
                data-for={`graph-badge${original.index}`}
                variant={variant}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() => {
                  if (variant === "success") {
                    newPatients.splice(indexOfSubject, 1);
                    newProjects.splice(indexOfProject, 1);
                  } else {
                    newPatients.push(subjectID);
                    newProjects.push(projectID);
                  }
                  this.setState({
                    patients: newPatients,
                    projects: newProjects
                  });
                  this.props.getWorklistPatient(newPatients, newProjects);
                }}
              >
                {icon}
              </Button>
              <ReactTooltip
                id={`graph-badge${original.index}`}
                place="right"
                type="light"
                delayShow={1000}
              >
                <span>{text}</span>
              </ReactTooltip>
            </div>
          );
        }
      },

      {
        id: "sb_name",
        Header: "Subject Name",
        width: 160,
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
        width: 200,
        accessor: "projectName",
        sortable: true,
        resizable: true,
        show: mode === "thick",
        Cell: original => {
          const { projectMap } = this.props;
          const { projectID } = original.row._original;
          if (!projectMap[projectID]) {
            return null;
          } else {
            let { projectName } = this.props.projectMap[
              original.row._original.projectID
            ];
            return <div>{projectName}</div>;
          }
        }
      },
      {
        id: "study_date",
        width: 90,
        Header: "Study Date",
        sortable: true,
        resizable: true,
        accessor: "studyDate"
      },
      {
        id: "due",
        width: 90,
        Header: "Due Date",
        sortable: true,
        resizable: true,
        accessor: "worklistDuedate"
      },
      {
        id: "studyUID",
        width: 200,
        Header: "StudyUID",
        sortable: true,
        resizable: true,
        accessor: "studyUID"
      },
      {
        width: 30,
        Cell: original => {
          const {
            workListID,
            projectID,
            subjectID,
            studyUID
          } = original.row._original;

          return (
            <div>
              <Button
                variant="success"
                data-tip
                data-for={`progress-verified-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  this.handleClickProgresButton(
                    workListID,
                    projectID,
                    subjectID,
                    studyUID,
                    3
                  )
                }
              >
                <GrDocumentVerified />
              </Button>
              <ReactTooltip
                id={`progress-verified-button${original.index}`}
                place="left"
                type="light"
                delayShow={1000}
              >
                <span>Done</span>
              </ReactTooltip>
            </div>
          );
        }
      },
      {
        width: 30,
        Cell: original => {
          const {
            workListID,
            projectID,
            subjectID,
            studyUID
          } = original.row._original;
          return (
            <div>
              <Button
                variant="warning"
                data-tip
                data-for={`progress-inprogress-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  this.handleClickProgresButton(
                    workListID,
                    projectID,
                    subjectID,
                    studyUID,
                    2
                  )
                }
              >
                <GrDocumentPerformance />
                <ReactTooltip
                  id={`progress-inprogress-button${original.index}`}
                  place="left"
                  type="light"
                  delayShow={1000}
                >
                  <span>In progress</span>
                </ReactTooltip>
              </Button>
            </div>
          );
        }
      },
      {
        width: 30,
        Cell: original => {
          const {
            workListID,
            projectID,
            subjectID,
            studyUID
          } = original.row._original;
          return (
            <div>
              <Button
                variant="danger"
                data-tip
                data-for={`progress-notStarted-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  this.handleClickProgresButton(
                    workListID,
                    projectID,
                    subjectID,
                    studyUID,
                    1
                  )
                }
              >
                <GrDocumentMissing />
                <ReactTooltip
                  id={`progress-notStarted-button${original.index}`}
                  place="left"
                  type="light"
                  delayShow={1000}
                >
                  <span>Not started</span>
                </ReactTooltip>
              </Button>
            </div>
          );
        }
      },
      {
        width: 30,
        Cell: original => {
          const {
            workListID,
            projectID,
            subjectID,
            studyUID,
            progressType
          } = original.row._original;
          return (
            <div>
              <Button
                disabled={progressType === "AUTO"}
                variant={progressType === "AUTO" ? "secondary" : "info"}
                data-tip
                data-for={`progress-auto-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  this.handleClickProgresButton(
                    workListID,
                    projectID,
                    subjectID,
                    studyUID,
                    0
                  )
                }
              >
                <GrTrash />
                <ReactTooltip
                  id={`progress-auto-button${original.index}`}
                  place="left"
                  type="light"
                  delayShow={1000}
                >
                  <span>Use auto calculation instead</span>
                </ReactTooltip>
              </Button>
            </div>
          );
        }
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
    const maxPort = parseInt(sessionStorage.getItem("maxPort"));
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
        this.props.openSeries.length === maxPort
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
          if (selectedSeries.length + this.props.openSeries.length > maxPort) {
            // alert user about the num of open series a the moment and told only maxPort is allowed
            const openPorts = this.props.openSeries.length;
            this.setState({
              error: `Already ${openPorts} viewers open. You can open ${maxPort} at a time`
            });
          } else {
            //else get data for each serie for display
            selectedSeries.forEach(serie => {
              this.props.dispatch(addToGrid(serie));
              this.props.dispatch(getSingleSerie(serie));
            });
            // -----> Delete after v1.0 <-----
            // for (let series of selectedSeries) {
            //   if (!this.props.patients[series.patientID]) {
            //     // await this.props.dispatch(getWholeData(series));
            //     getWholeData(series);
            //   } else {
            //     this.props.dispatch(
            //       updatePatient(
            //         "serie",
            //         true,
            //         series.patientID,
            //         series.studyUID,
            //         series.seriesUID
            //       )
            //     );
            //   }
            // }
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
          <SelectSeriesModal
            seriesPassed={[this.state.series]}
            onCancel={this.handleCancelOpenSeries}
            studyName={this.state.studyName}
          />
        )}
      </div>
    );
  };
}

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    projectMap: state.annotationsListReducer.projectMap
  };
};
export default connect(mapStateToProps)(WorkList);
