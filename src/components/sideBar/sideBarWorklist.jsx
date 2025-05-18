/*
import React, { useMemo, useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";

const sidebarWL = (props) => {
    const [worklists, setWorklists] = useState([]);

    useEffect(() => {

    }, [props.match.params.wid]);

    const getWorklistData = async () => {
        try {
            const { data: worklists } = await getStudiesOfWorklist(
                sessionStorage.getItem("username"),
                props.match.params.wid
                );
            return worklists;
        } catch (err) {
            console.error(err);
        }
    }

 
    const columns = useMemo([
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
                  onClick={() => this.handleOpenClick(original.original)}> 
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
                  onClick={() => this.handleSingleDelete(workListID, projectID, subjectID, studyUID)}
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
            let studyDesc = this.clearCarets(
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
            const pairExists = this.checkPairExist(subjectID, projectID);
            const newMap = { ...this.state.patientsProjectMap };
            return (
              <input
                type="checkbox"
                className="checkbox-cell"
                checked={pairExists}
                onChange={() => {
                  if (pairExists) delete newMap[`${subjectID}-${projectID}`];
                  else newMap[`${subjectID}-${projectID}`] = true;
                  this.setState({ patientsProjectMap: newMap });
                  this.props.getWorklistPatient(newMap);
                  this.props.dispatch(selectPatient(original.row));
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
        {
          id: "pr_name",
          Header: "Project Name",
          width: 200,
          accessor: "projectName", // Accessor points to your data field
          Cell: (original) => {
            const { projectMap } = this.props;
            const { projectID } = original.row;
  
            // Custom logic to render the project name
            if (!projectMap[projectID]) {
              return null;
            } else {
              let { projectName } = this.props.projectMap[original.row.projectID];
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
                    this.handleClickProgresButton(
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
      ],[wid]);

      return (worklists.map(el => <div>{el}</div>))
}

const mapStateToProps = (state) => {
    return {
      openSeries: state.annotationsListReducer.openSeries,
      patients: state.annotationsListReducer.patients,
      projectMap: state.annotationsListReducer.projectMap,
      seriesData: state.annotationsListReducer.seriesData,
    };
  };
  export default connect(mapStateToProps)(sidebarWL);
  */

import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useTable, useSortBy, useSortable,useResizeColumns } from "react-table";
import { Button } from "react-bootstrap";
import { FaRegEye } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import {DndContext, useDroppable, useDraggable} from '@dnd-kit/core';

import {
  GrDocumentMissing,
  GrDocumentVerified,
  GrDocumentPerformance,
  GrTrash,
  GrCalculator,
  GrManual,
  GrPowerReset,
  GrDrag
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
import "./style.css"

const messages = {
  deleteSingle: "Remove study from the worklist? This cannot be undone.",
  deleteSelected:
    "Delete selected studies from the worklist? This cannot be undone.",
  notAuthorizedProjects:
    "You do not have access to all of the projects of the worklist. Please contact to your admin about projects:"
};

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

  // Load worklist data on mount
  useEffect(() => {
    getWorkListData(true);
  }, [props.match.params.wid]);

  // Function to fetch worklist data
  const getWorkListData = async (showError) => {
    const { data: wls } = await getStudiesOfWorklist(
      sessionStorage.getItem("username"),
      props.match.params.wid // Replace with dynamic ID
    );
    const { notAuthorized, filteredWorklists } = filterProjects(wls);
    setWorklists(filteredWorklists); // Set worklists after fetching

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

  // Function to filter projects
  const filterProjects = (worklists) => {
    const filteredWorklists = [];
    const notAuthorized = [];
    const projectsFilled = Object.keys(props.projectMap).length > 0;
    worklists.forEach((el) => {
      if (projectsFilled && !props.projectMap[el.projectID]) notAuthorized.push(el.projectID);
      else if (projectsFilled) filteredWorklists.push(el);
    });
    return { notAuthorized, filteredWorklists };
  };

  // Handle row drag-and-drop
  const handleDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return; // Dropped outside the list

    const reorderedWorklists = Array.from(worklists);
    const [removed] = reorderedWorklists.splice(source.index, 1);
    reorderedWorklists.splice(destination.index, 0, removed);

    setWorklists(reorderedWorklists);
  };

  // Handle single deletion of a study
  const deleteStudyfromWorklist = async () => {
    const { worklist, projectID, subjectID, studyUID } = singleDeleteData;
    const body = [{ projectID, subjectID, studyUID }];
    deleteStudyFromWorklist(worklist, body)
      .then(() => {
        setSingleDeleteData({});
        setDeleteSingleClicked(false);
        getWorkListData();
      })
      .catch((err) => {
        setError(err.response.data.message);
      });
  };

  // Handle the cancel of delete confirmation
  const handleCancel = () => {
    setDeleteSingleClicked(false);
    setError(null);
  };

  const clearCarets = (string) => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string.trim();
    }
  };

  const checkPairExist = (subjectID, projectID) => {
    patientsProjectMap[`${subjectID}-${projectID}`]
      ? true
      : false;
  };

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      {
        id: "drag",
        // Header: "Drag",
        accessor: "drag", // Custom accessor just for the drag column
        Cell: ({ row }) => (
          <div
            id={`dragIndex${row.id}`}
            style={{
              cursor: "move",
              padding: "0.5rem",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              pointerEvents: "auto", // Allow pointer events only for the drag column
            }}
            {...row.getRowProps()} // Apply the row props here
            // {...row.getCellProps()}
          >
            <GrDrag />
          </div>
        ),
        width: 30,
        resizable: false,
      },
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
        // width: 240,
        sortable: true,
        resizable: true,
        Cell: ({ row }) => {
          console.log(row);
          let studyDesc = clearCarets(
            row.original.studyDescription
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
        Header: "Project Name",
        accessor: "projectName",
        Cell: ({ row }) => {
          const { projectID } = row.original;
          if (!props.projectMap[projectID]) return null;
          return <div>{props.projectMap[projectID]?.projectName}</div>;
        }
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
    ],
    [props.match.params.wid]
  );

  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setColumnOrder,
  } = useTable(
    {
      columns,
      data: worklists,
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
              {...getTableProps()}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        {...column.getResizerProps()}
                        style={{
                          width: column.getResizerProps()
                            ? column.getResizerProps().width
                            : "auto",
                          pointerEvents: column.id === "drag" ? "auto" : "none", // Disable pointer events for non-drag columns
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row, index) => {
                  prepareRow(row);
                  const { studyUID } = row.original;
                  return (
                    <Draggable
                      key={studyUID}
                      draggableId={studyUID}
                      index={index}
                    >
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...row.getRowProps()}
                          {...provided.draggableProps}
                          // {...provided.dragHandleProps} // Apply dragHandleProps to the drag column
                        >
                          {row.cells.map((cell) => {
                            if (cell.column.id === "drag") {
                              return (
                                <td
                                  key={cell.column.id}
                                  {...cell.getCellProps()}
                                  {...provided.dragHandleProps} // Apply drag handle props only to the drag column
                                >
                                  {cell.render("Cell")}
                                </td>
                              );
                            } else {
                              return (
                                <td key={cell.column.id} {...cell.getCellProps()}>
                                  {cell.render("Cell")}
                                </td>
                              );
                            }
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
          seriesPassed={series}
          onCancel={() => setShowSeries(false)}
          studyName={studyName}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    projectMap: state.annotationsListReducer.projectMap,
    seriesData: state.annotationsListReducer.seriesData
  };
};

export default connect(mapStateToProps)(WorkList);
