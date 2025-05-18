

import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useTable, useSortBy, useResizeColumns } from "react-table";
import { Button } from "react-bootstrap";
import { FaRegEye } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  GrDocumentMissing,
  GrDocumentVerified,
  GrDocumentPerformance,
  GrTrash,
  GrCalculator,
  GrManual,
  GrPowerReset
} from "react-icons/gr";
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
  alertViewPortFull,
  clearSelection,
  changeActivePort,
  selectPatient,
  setSeriesData
} from "../annotationsList/action";
import { isSupportedModality } from "../../Utils/aid.js";

const messages = {
  deleteSingle: "Remove study from the worklist? This cannot be undone.",
  deleteSelected:
    "Delete selected studies from the worklist? This cannot be undone.",
  notAuthorizedProjects:
    "You do not have access to all of the projects of the worklist. Please contact to your admin about projects:"
};

// const WorkList = ({ dispatch, projectMap, openSeries, seriesData }) => {
  const WorkList = (props) => {
  const [worklists, setWorklists] = useState([]);
  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(0);
  const [deleteSingleClicked, setDeleteSingleClicked] = useState(false);
  const [singleDeleteData, setSingleDeleteData] = useState({});
  const [showSeries, setShowSeries] = useState(false);
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);
  const [patientsProjectMap, setPatientsProjectMap] = useState({});
  const [studyName, setStudyName] = useState("");

  useEffect(() => {
    getWorkListData(true);
  }, []);

  const getWorkListData = async (showError) => {
    const { data: worklists } = await getStudiesOfWorklist(
      sessionStorage.getItem("username"),
      // Assuming your URL param is here
      "worklist_id_placeholder"
    );
    const { notAuthorized, filteredWorklists } = filterProjects(worklists);
    setWorklists(filteredWorklists);

    if (showError && Array.isArray(notAuthorized) && notAuthorized.length > 0) {
      const projectList = notAuthorized.reduce((all, item, i) => {
        return `${all} ${item}${notAuthorized.length - 1 === i ? "" : ", "}`;
      }, "");
      const message = `${messages.notAuthorizedProjects} ${projectList}`;
      // Assuming toast is imported
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

  // const getWorkListData = async (showError) => {
  //   const { data: worklists } = await getStudiesOfWorklist(
  //     sessionStorage.getItem("username"),
  //     props.match.params.wid
  //   );
  //   const { notAuthorized, filteredWorklists } = filterProjects(worklists);
  //   setState({ worklists: filteredWorklists });
  //   if (showError && Array.isArray(notAuthorized) && notAuthorized.length > 0) {
  //     const projectList = notAuthorized.reduce((all, item, i) => {
  //       return `${all} ${item}${notAuthorized.length - 1 === i ? "" : ", "}`;
  //     }, "");
  //     const message = `${messages.notAuthorizedProjects} ${projectList}`;
  //     toast.error(message, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //     });
  //   }
  // };

  const filterProjects = (worklists) => {
    const filteredWorklists = [];
    const notAuthorized = [];
    const projectsFilled = Object.keys(projectMap).length > 0;
    worklists.forEach((el) => {
      if (projectsFilled && !projectMap[el.projectID]) notAuthorized.push(el.projectID);
      else if (projectsFilled) filteredWorklists.push(el);
    });
    return { notAuthorized, filteredWorklists };
  };

  // const filterProjects = (worklists) => {
  //   const filteredWorklists = [];
  //   const notAuthorized = [];
  //   const { projectMap } = props;
  //   const projectsFilled = Object.keys(projectMap).length > 0;
  //   worklists.forEach((el, i) => {
  //     if (projectsFilled && !projectMap[el.projectID]) notAuthorized.push(el.projectID);
  //     else if (projectsFilled) filteredWorklists.push(el);
  //   });
  //   return { notAuthorized, filteredWorklists };
  // };

  const handleDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return; // Dropped outside the list

    const reorderedWorklists = Array.from(worklists);
    const [removed] = reorderedWorklists.splice(source.index, 1);
    reorderedWorklists.splice(destination.index, 0, removed);

    setWorklists(reorderedWorklists);
  };

  // const handleDragEnd = (result) => {
  //   const { destination, source } = result;

  //   if (!destination) return; // Dropped outside the list

  //   const reorderedWorklists = Array.from(this.state.worklists);
  //   const [removed] = reorderedWorklists.splice(source.index, 1);
  //   reorderedWorklists.splice(destination.index, 0, removed);

  //   this.setState({ worklists: reorderedWorklists });
  // };



  const handleCancel = () => {
    setDeleteSingleClicked(false);
    setError('');
    // this.setState({
    //   hasAddClicked: false,
    //   error: "",
    //   deleteSingleClicked: false,
    // });
  };

  const deleteStudyfromWorklist = async () => {
    const { worklist, projectID, subjectID, studyUID } = singleDeleteData;
    const body = [{ projectID, subjectID, studyUID }];
    deleteStudyFromWorklist(worklist, body)
      .then(() => {
        setSingleDeleteData({});
        setDeleteSingleClicked(false);
        // this.setState({ deleteSingleClicked: false, singleDeleteData: {} });
        getWorkListData();
      })
      .catch((err) => {
        // this.setState({ errorMessage: err.response.data.message });
        setError(err.response.data.message);
      });
  };

  const clearCarets = (string) => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string.trim();
    }
  };

  const handleSingleDelete = (worklist, projectID, subjectID, studyUID) => {
    setSingleDeleteData({ worklist, projectID, subjectID, studyUID });
    setDeleteSingleClicked(true);
    // this.setState({
    //   deleteSingleClicked: true,
    //   singleDeleteData: { worklist, projectID, subjectID, studyUID },
    // });
  };

  const handleOpenClick = async (study) => {
    const { seriesData } = props;
    const { projectID, subjectID, studyUID, studyDescription } = study;
    let series;
    const dataExists =
      seriesData[projectID] &&
      seriesData[projectID][subjectID] &&
      seriesData[projectID][subjectID][studyUID] &&
      seriesData[projectID][subjectID][studyUID].list;

    try {
      if (!dataExists) {
        ({ data: series } = await getSeries(projectID, subjectID, studyUID));
        props.dispatch(setSeriesData(projectID, subjectID, studyUID, series, true));
      } else series = seriesData[projectID][subjectID][studyUID].list;
      series = series.filter(isSupportedModality);
      const maxPort = parseInt(sessionStorage.getItem("maxPort"));

      const { openSeries } = props;
      if (series.length + openSeries.length <= maxPort) {
        setSeries(series);
        viewSelection();
      } else {
        setShowSeries(!showSeries);
        setSeries(series);
        setStudyName(studyDescription);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOpenSeries = () => {
    setShowSeries(!showSeries);
    setSeries([]);
    setError('');
    // this.setState((state) => ({
    //   showSeries: !state.showSeries,
    //   series: [],
    //   error: null,
    // }));
  };

  const handleClickProgresButton = (
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
      .then(() => {
        toast.success("Progress successfully updated.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        getWorkListData();
      })
      .catch((err) => console.error(err));
  };

  const checkPairExist = (subjectID, projectID) => {
    patientsProjectMap[`${subjectID}-${projectID}`]
      ? true
      : false;
  };

  const columns = React.useMemo(
    () =>
     [
      {
        id: "open",
        // Header: "",
        accessor:"open",
        width: 30,
        resizable: true,
        Cell: (original) => {
          return (
            <div >
              <Button 
                variant="dark"
                data-tip
                data-for={`display-${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() => handleOpenClick(original.original)}> 
                <FaRegEye className="menu-clickable" />
                <ReactTooltip
                  id={`display-${original.index}`}
                  place="right"
                  type="light"
                  delayShow={1000}
                >
                  <span>Display study</span>
                </ReactTooltip>
              </Button>
            </div>
          );
        },
      },
      {
        width: 30,
        accessor:"remove",
        Cell: (original) => {
          console.log(" --> ", original);
          const { workListID, projectID, subjectID, studyUID } =
            original.row;
          return (
            <div>
              <Button
                variant="dark"
                data-tip
                data-for={`delete-${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() => handleSingleDelete(workListID, projectID, subjectID, studyUID)}
              >
                <GrTrash />
                <ReactTooltip
                  id={`delete-${original.index}`}
                  place="left"
                  type="light"
                  delayShow={1000}
                >
                  <span>Remove study from worklist</span>
                </ReactTooltip>
              </Button>
            </div>
          );
        },
      },
      {
        // Header: "%",
        width: 25,
        resizable: false,
        accessor:"progress_by",
        // style={{ 'fontSize': '0.9rem', 'filter': 'invert(100%) sepia(0%) saturate(7472%) hue-rotate(280deg) brightness(83%) contrast(91%)' }}
        // style={{ 'fontSize': '0.9rem', 'filter': 'invert(100%) sepia(0%) saturate(7472%) hue-rotate(280deg) brightness(83%) contrast(91%)' }}
        Cell: (original) => {
          const isAuto = original.row.progressType === "AUTO";
          const variant = isAuto ? "light" : "info";
          const text = isAuto ? <GrCalculator /> : <GrManual />;
          const tooltipText = isAuto
            ? "Progress by annotations"
            : "Progress manually";
          return (
            <div>
              <Button
                data-tip
                data-for={`progressType-badge${original.index}`}
                style={{
                  padding: "0.03rem",
                  fontSize: "1.1rem",
                  cursor: "default",
                }}
                variant={variant}
              >
                {text}
              </Button>
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
        },
      },
      {
        // Header: "%",
        width: 25,
        resizable: false,
        sortable: true,
        accessor: "completeness",
        sortMethod: (a, b) => a - b,
        Cell: (original) => {
          const { completeness } = original.row;
          let variant;
          let text;
          let tooltipText;
          let filter;
          if (completeness === 0) {
            variant = "danger";
            text = <GrDocumentMissing />;
            // style={{ 'filter': 'invert(35%) sepia(85%) saturate(2139%) hue-rotate(330deg) brightness(85%) contrast(104%)' }}
            tooltipText = "Not started";
          } else if (completeness === 100) {
            variant = "success";
            text = <GrDocumentVerified />;
            // style={{ 'filter':  'invert(43%) sepia(37%) saturate(820%) hue-rotate(100deg) brightness(90%) contrast(92%)' }}
            tooltipText = "Completed";
            // filter = "invert(43%) sepia(37%) saturate(820%) hue-rotate(100deg) brightness(90%) contrast(92%)";
          } else {
            variant = "warning";
            text = <GrDocumentPerformance />;
            // style={{ 'filter': 'invert(77%) sepia(73%) saturate(1638%) hue-rotate(354deg) brightness(101%) contrast(101%)' }}
            tooltipText = "In progress";
          }
          return (
            <div>
              <Button
                data-tip
                data-for={`progress-badge${original.index}`}
                variant={variant}
                style={{
                  padding: "0.03rem",
                  fontSize: "1.1rem",
                  cursor: "default",
                }}
              >
                {text}
              </Button>
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
        },
      },
      {
        id: "desc",
        Header: "Study Description",
        accessor: "study_desc",
        width: 240,
        sortable: true,
        resizable: true,
        Cell: (original) => {
          let studyDesc = clearCarets(
            original.row.studyDescription
          );
          studyDesc = studyDesc ? studyDesc : "Unnamed Study";
          return <div>{studyDesc}</div>;
        },
      },
      {
        id: "graph",
        Header: "Report",
        accessor: "report",
        width: 55,
        sortable: false,
        resizable: false,
        Cell: (original) => {
          const { subjectID, projectID } = original.row;
          const pairExists = checkPairExist(subjectID, projectID);
          const newMap = { patientsProjectMap };
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={pairExists}
              onChange={() => {
                if (pairExists) delete newMap[`${subjectID}-${projectID}`];
                else newMap[`${subjectID}-${projectID}`] = true;
                setPatientsProjectMap(newMap);
                props.getWorklistPatient(newMap);
                props.dispatch(selectPatient(original.row));
              }}
              id={original.id}
            />
          );
        },
      },
      {
        id: "sb_name",
        Header: "Subject Name",
        accessor:"subject_name", 
        width: 160,
        sortable: true,
        resizable: true,

        Cell: (original) => {
          let subjectName = this.clearCarets(
            original.row.subjectName
          );
          subjectName = subjectName ? subjectName : "Unnamed Subject";
          return <div>{subjectName}</div>;
        },
      },
      // {
      //   id: "pr_name",
      //   Header: "Project Name",
      //   width: 200,
      //   accessor: "projectName",
      //   sortable: true,
      //   resizable: true,
      //   show: mode === "thick",
      //   Cell: (original) => {
      //     const { projectMap } = props;
      //     const { projectID } = original.row;
      //     if (!projectMap[projectID]) {
      //       return null;
      //     } else {
      //       let { projectName } =
      //         props.projectMap[original.row.projectID];
      //       return <div>{projectName}</div>;
      //     }
      //   },
      // },
      {
        id: "pr_name",
        Header: "Project Name",
        width: 200,
        accessor: "projectName", // Accessor points to your data field
        Cell: (original) => {
          const { projectMap } = props;
          const { projectID } = original.row;

          // Custom logic to render the project name
          if (!projectMap[projectID]) {
            return null;
          } else {
            let { projectName } = props.projectMap[original.row.projectID];
            return <div>{projectName}</div>;
          }
        },
      },
      {
        id: "study_date",
        width: 90,
        Header: "Study Date",
        sortable: true,
        resizable: true,
        accessor: "studyDate",
      },
      {
        id: "due",
        width: 90,
        Header: "Due Date",
        sortable: true,
        resizable: true,
        accessor: "worklistDuedate",
      },
      {
        id: "studyUID",
        width: 200,
        Header: "StudyUID",
        sortable: true,
        resizable: true,
        accessor: "studyUID",
      },
      {
        width: 30,
        accessor:'done_bt',
        Cell: (original) => {
          const { workListID, projectID, subjectID, studyUID } =
            original.row;
          return (
            <div>
              <Button
                variant="success"
                data-tip
                data-for={`progress-verified-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  handleClickProgresButton(
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
        },
      },
      {
        width: 30,
        accessor:'progress_bt',
        Cell: (original) => {
          const { workListID, projectID, subjectID, studyUID } =
            original.row;
          return (
            <div>
              <Button
                variant="warning"
                data-tip
                data-for={`progress-inprogress-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  handleClickProgresButton(
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
        },
      },
      {
        width: 30,
        accessor:'not_started_bt',
        Cell: (original) => {
          const { workListID, projectID, subjectID, studyUID } =
            original.row;
          return (
            <div>
              <Button
                variant="danger"
                data-tip
                data-for={`progress-notStarted-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  handleClickProgresButton(
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
        },
      },
      {
        width: 30,
        accessor:'auto_calc',
        Cell: (original) => {
          const { workListID, projectID, subjectID, studyUID, progressType } =
            original.row;
          return (
            <div>
              <Button
                disabled={progressType === "AUTO"}
                variant={progressType === "AUTO" ? "secondary" : "info"}
                data-tip
                data-for={`progress-auto-button${original.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() =>
                  handleClickProgresButton(
                    workListID,
                    projectID,
                    subjectID,
                    studyUID,
                    0
                  )
                }
              >
                <GrPowerReset />
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
        },
      },
    ]
  );

  const selectSeries = (series) => {
    const { selectedSeries } = this.state;
    selectedSeries[series.seriesUID]
      ? delete selectedSeries[series.seriesUID]
      : (selectedSeries[series.seriesUID] = series);
    this.setState({ selectedSeries });
  };

  const checkIfSerieOpen = (selectedSerie) => {
    let isOpen = false;
    let index;
    props.openSeries.forEach((serie, i) => {
      if (serie.seriesUID === selectedSerie) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  const getExistingSeriesData = (serie) => {
    const { projectID, patientID, studyUID } = serie;
    const { seriesData } = props;
    const dataExists =
        seriesData[projectID] &&
        seriesData[projectID][patientID] &&
        seriesData[projectID][patientID][studyUID] &&
        seriesData[projectID][patientID][studyUID].list;

    const existingData = dataExists
      ? seriesData[projectID][patientID][studyUID].list
      : null;
    return existingData;
  }

  const viewSelection = async () => {
    const { seriesData } = props;
    const maxPort = parseInt(sessionStorage.getItem("maxPort"));
    const notOpenSeries = [];
    const selectedSeries = Object.values(this.state.selectedSeries);
    if (selectedSeries.length > 0) {
      //check if enough room to display selection
      for (let serie of selectedSeries) {
        if (!checkIfSerieOpen(serie.seriesUID).isOpen) {
          notOpenSeries.push(serie);
        }
      }
      //if all ports are full
      if (
        notOpenSeries.length > 0 &&
        props.openSeries.length === maxPort
      ) {
        props.dispatch(alertViewPortFull());
      } else {
        //if all series already open update active port
        if (notOpenSeries.length === 0) {
          let index = checkIfSerieOpen(selectedSeries[0].seriesUID).index;
          props.dispatch(changeActivePort(index));
          props.history.push("/display");
          props.dispatch(clearSelection());
        } else {
          if (selectedSeries.length + props.openSeries.length > maxPort) {
            // alert user about the num of open series a the moment and told only maxPort is allowed
            const openPorts = props.openSeries.length;
            this.setState({
              error: `Already ${openPorts} viewers open. You can open ${maxPort} at a time`,
            });
          } else {
            //else get data for each serie for display
            selectedSeries.forEach((serie) => {
              const list = getExistingSeriesData(serie);
              props.dispatch(addToGrid(serie));
              props.dispatch(getSingleSerie(serie, null, null, list));
            });
            // -----> Delete after v1.0 <-----
            // for (let series of selectedSeries) {
            //   if (!props.patients[series.patientID]) {
            //     // await props.dispatch(getWholeData(series));
            //     getWholeData(series);
            //   } else {
            //     props.dispatch(
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
            props.history.push("/display");
            props.dispatch(clearSelection());
          }
        }
      }
    }
  };

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow
    } = useTable(
      {
        columns,
        data: worklists,
        initialState: {
          sortBy: [{ id: "studyDescription", desc: false }]
        }
      },
      useSortBy,
      useResizeColumns
    );

    return (
      <div className="worklist-page">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable" type="row">
            {(provided) => (
              <table
                className="__table"
                {...provided.droppableProps}
                ref={provided.innerRef} // Ensure this is applied to the table element
              >
                <thead>
                  <tr>
                    {/* Add your table headers here */}
                    {columns.map((column, index) => (
                      <th key={index}>{column.Header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {worklists.map((row, index) => {
                    const { studyUID } = row; // Use row data here
                    return (
                      <Draggable key={studyUID} draggableId={studyUID} index={index}>
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {columns.map((column, idx) => {
                              const cellData = row[column.accessor] || ''; // Get cell data from row
                              return (
                                <td key={idx}>
                                  {column.Cell
                                    ? column.Cell({ row, column, value: cellData }) // Call Cell directly if defined
                                    : cellData} 
                                </td>
                              );
                            })}
                          </tr>
                        )}
                      </Draggable>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
        {deleteSingleClicked && (
          <DeleteAlert
            message={messages.deleteSingle}
            onCancel={handleCancel}
            onDelete={deleteStudyfromWorklist}
            error={error}
          />
        )}
        {showSeries && (
          <SelectSeriesModal
            seriesPassed={[series]}
            onCancel={handleCancelOpenSeries}
            studyName={studyName}
          />
        )}
      </div>
    );
  
}

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    projectMap: state.annotationsListReducer.projectMap,
    seriesData: state.annotationsListReducer.seriesData,
  };
};
export default connect(mapStateToProps)(WorkList);


