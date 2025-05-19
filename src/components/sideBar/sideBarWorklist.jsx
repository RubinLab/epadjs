import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import { FaRegEye } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import { GrTrash} from "react-icons/gr";
import { DragDropTable } from "./DragDropTable";
// Service imports
import {
  getStudiesOfWorklist,
  deleteStudyFromWorklist,
} from "../../services/worklistServices";
  
  const WorkList = (props) => {
    const [worklists, setWorklists] = useState([]);
    const [singleDeleteData, setSingleDeleteData] = useState({});
  
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

      // Table column definition
  const columns = React.useMemo(
    () => [
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
            id: "studyUID",
            width: 200,
            Header: "StudyUID",
            sortable: true,
            resizable: true,
            accessor: "studyUID",
        },
      // More columns like "completeness", "study description", etc.
    ],
    [props.match.params.wid]
  );

  return (
    <DragDropTable columns={columns} data={worklists} setData={setWorklists} />
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
  
  export default connect(mapStateToProps)(WorkList);