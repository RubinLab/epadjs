import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import { FaRegEye } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import { GrDocumentMissing,
    GrDocumentVerified,
    GrDocumentPerformance,
    GrTrash,
    GrCalculator,
    GrManual,
    GrPowerReset } from "react-icons/gr";
import { DragDropTable } from "./DragDropTable";
// Service imports
import {
  getStudiesOfWorklist,
  deleteStudyFromWorklist,
} from "../../services/worklistServices";
import { getSeries } from "../../services/seriesServices";

// Component imports
import DeleteAlert from "../management/common/alertDeletionModal";
import SelectSeriesModal from "../annotationsList/selectSerieModal";
import { addToGrid, getSingleSerie, alertViewPortFull, clearSelection, changeActivePort, selectPatient, setSeriesData } from "../annotationsList/action";

// CSS import
import "./style.css";
  
  const WorkList = (props) => {
    const [worklists, setWorklists] = useState([]);
    const [singleDeleteData, setSingleDeleteData] = useState({});
    const [selected, setSelected] = useState({});
    const [selectAll, setSelectAll] = useState(0);
    const [deleteSingleClicked, setDeleteSingleClicked] = useState(false);
    const [showSeries, setShowSeries] = useState(false);
    const [series, setSeries] = useState([]);
    const [error, setError] = useState(null);
    const [patientsProjectMap, setPatientsProjectMap] = useState({});
    const [studyName, setStudyName] = useState("");

  
    useEffect(() => {
      getWorkListData(true);
    }, [props.match.params.wid]);
  
    // Fetch the worklist data
    const getWorkListData = async (showError) => {
      const { data: wls } = await getStudiesOfWorklist(sessionStorage.getItem("username"), props.match.params.wid);
      const { notAuthorized, filteredWorklists } = filterProjects(wls);
      setWorklists(filteredWorklists);
  
      if (showError && Array.isArray(notAuthorized) && notAuthorized.length > 0) {
        const projectList = notAuthorized.reduce((all, item, i) => `${all} ${item}${notAuthorized.length - 1 === i ? "" : ", "}`, "");
        const message = `${messages.notAuthorizedProjects} ${projectList}`;
        toast.error(message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true });
      }
    };
  
    // Filter worklist projects
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
  
    // Delete study from worklist
    const deleteStudyfromWorklist = async () => {
      const { worklist, projectID, subjectID, studyUID } = singleDeleteData;
      const body = [{ projectID, subjectID, studyUID }];
      deleteStudyFromWorklist(worklist, body)
        .then(() => {
          setSingleDeleteData({});
          setDeleteSingleClicked(false);
          getWorkListData();
        })
        .catch((err) => setError(err.response.data.message));
    };


  // Handle single deletion of a study
//   const deleteStudyfromWorklist = async () => {
//     const { worklist, projectID, subjectID, studyUID } = singleDeleteData;
//     const body = [{ projectID, subjectID, studyUID }];
//     deleteStudyFromWorklist(worklist, body)
//       .then(() => {
//         setSingleDeleteData({});
//         setDeleteSingleClicked(false);
//         getWorkListData();
//       })
//       .catch((err) => {
//         setError(err.response.data.message);
//       });
//   };

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

  const handleSingleDelete = (worklist, projectID, subjectID, studyUID) => {
    setSingleDeleteData({ worklist, projectID, subjectID, studyUID });
    setDeleteSingleClicked(true);
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

  // Define columns for the table
  const columns = React.useMemo(
    () =>
     [
      {
        id: "open",
        accessor: "open",
        width: 30,
        resizable: true,
        Cell: ({ row }) => {
          return (
            <div>
              <Button
                variant="dark"
                data-tip
                data-for={`display-${row.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() => handleOpenClick(row.original)}
              >
                <FaRegEye className="menu-clickable" />
                <ReactTooltip id={`display-${row.index}`} place="right" type="light" delayShow={1000}>
                  <span>Display study</span>
                </ReactTooltip>
              </Button>
            </div>
          );
        },
      },
      {
        width: 30,
        accessor: "remove",
        Cell: ({ row }) => {
          const { workListID, projectID, subjectID, studyUID } = row.original;
          return (
            <div>
              <Button
                variant="dark"
                data-tip
                data-for={`delete-${row.index}`}
                style={{ padding: "0.1rem 0.2rem", fontSize: "1.1rem" }}
                onClick={() => handleSingleDelete(workListID, projectID, subjectID, studyUID)}
              >
                <GrTrash />
                <ReactTooltip id={`delete-${row.index}`} place="left" type="light" delayShow={1000}>
                  <span>Remove study from worklist</span>
                </ReactTooltip>
              </Button>
            </div>
          )},
        },
      {
        // Header: "%",
        width: 25,
        resizable: false,
        sortable: true,
        accessor: "completeness",
        sortMethod: (a, b) => a - b,
        Cell: ({ row }) => {
          const { completeness } = row.original;
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
                data-for={`progress-badge${row.original.index}`}
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
                id={`progress-badge${row.original.index}`}
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
        Cell: ({ row }) => {
          console.log("--> original", row)  
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
        Cell: ({ row }) => {
          const { subjectID, projectID } = row.original;
          const pairExists = checkPairExist(subjectID, projectID);
          const newMap = { patientsProjectMap };
          console.log('--> Report', row.original)
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
                props.dispatch(selectPatient(row.original));
              }}
              id={row.original.id}
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
        Cell: ({ row }) => {
          let subjectName = clearCarets(
            row.original.subjectName
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
        Cell: ({ row }) => {
          const { projectMap } = props;
          const { projectID } = row.original;

          // Custom logic to render the project name
          if (!projectMap[projectID]) {
            return null;
          } else {
            let { projectName } = props.projectMap[row.original.projectID];
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
        Cell: ({ row }) => {
          const { workListID, projectID, subjectID, studyUID } =
            row.original;
          return (
            <div>
              <Button
                variant="success"
                data-tip
                data-for={`progress-verified-button${row.original.index}`}
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
                id={`progress-verified-button${row.original.index}`}
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
        Cell: ({ row }) => {
          const { workListID, projectID, subjectID, studyUID } =
          row.original;
          return (
            <div>
              <Button
                variant="warning"
                data-tip
                data-for={`progress-inprogress-button${row.original.index}`}
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
                  id={`progress-inprogress-button${row.original.index}`}
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
        Cell: ({ row }) => {
          const { workListID, projectID, subjectID, studyUID } =
          row.original;
          return (
            <div>
              <Button
                variant="danger"
                data-tip
                data-for={`progress-notStarted-button${row.original.index}`}
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
                  id={`progress-notStarted-button${row.original.index}`}
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
        Cell: ({ row }) => {
          const { workListID, projectID, subjectID, studyUID, progressType } =
          row.original;
          return (
            <div>
              <Button
                disabled={progressType === "AUTO"}
                variant={progressType === "AUTO" ? "secondary" : "info"}
                data-tip
                data-for={`progress-auto-button${row.original.index}`}
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
                  id={`progress-auto-button${row.original.index}`}
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


  return (
        <div className="worklist-page">
            <DragDropTable columns={columns} data={worklists} setData={setWorklists} />

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
    )
}  

const mapStateToProps = (state) => {
    return {
      openSeries: state.annotationsListReducer.openSeries,
      patients: state.annotationsListReducer.patients,
      projectMap: state.annotationsListReducer.projectMap,
      seriesData: state.annotationsListReducer.seriesData,
    };
  };
  
  export default connect(mapStateToProps)(WorkList)
