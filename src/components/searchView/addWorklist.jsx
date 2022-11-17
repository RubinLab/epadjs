import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Dropdown from 'react-bootstrap/Dropdown';
import { BiDownload } from 'react-icons/bi';
import {
  getWorklistsOfCreator,
  addStudyToWorklist,
  addSubjectToWorklist,
  addAimsToWorklist
} from "../../services/worklistServices";

const AddToWorklist = (props) => {

  const [worklists, setWorklist] = useState([]);
  const [firstRun, setFirstRun] = useState(true);

  const addStudyToWorklist = workListID => {
    const studies = Object.values(props.selectedStudies);
    const promises = [];
    studies.forEach((el, index) => {
      const {
        projectID,
        patientID,
        studyUID,
        patientName,
        studyDescription,
      } = el;
      promises.push(
        addStudyToWorklist(workListID, projectID, patientID, studyUID, {
          studyDesc: studyDescription,
          subjectName: patientName,
        })
      );
    });
    Promise.all(promises)
      .then(() => {
        props.updateProgress();
      })
      .catch(err => console.log(err));
  };

  const addSubjectToWorklist = workListID => {
    const subjects = Object.values(props.selectedPatients);
    const promises = [];
    subjects.forEach((el, index) => {
      const { projectID, patientID, subjectName } = el;
      promises.push(
        addSubjectToWorklist(workListID, projectID, patientID, {
          subjectName,
        })
      );
    });
    Promise.all(promises)
      .then(() => {
        props.updateProgress();
      })
      .catch(err => console.log(err));
  };

  const addAnnotationsToWorklist = async (annotations, worklist) => {
    const aimIDs = Object.keys(annotations);
    try {
      await addAimsToWorklist(worklist, aimIDs);
      toast.success("Annotation(s) succesfully added to worklist.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });
      props.deselect();
    } catch (e) {
      toast.error("Error adding annotation(s) to worklist.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });
      console.error(e);
    }
  }

  const fillWorklists = async () => {
    const { data: worklists } = await getWorklistsOfCreator();
    setWorklist(worklists);
  }

  const onSelect = (workListID) => {
    const { selectedStudies, selectedPatients, selectedAnnotations } = props;
    if (Object.values(selectedStudies).length > 0) {
      addStudyToWorklist(workListID);
    } else if (Object.values(selectedPatients).length > 0) {
      addSubjectToWorklist(workListID);
    } else if (Object.values(selectedAnnotations).length > 0) {
      addAnnotationsToWorklist(selectedAnnotations, workListID);
    }
  };

  const WorklistMenu = React.forwardRef(({ children, style, className }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
      >
        {children}
      </div>
    )
  });

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <button type="button" className="btn btn-sm color-schema" ref={ref}
      onClick={e => {
        if (firstRun) {
          fillWorklists();
          setFirstRun(false);
        }
        onClick(e);
      }}>
      <BiDownload /><br />
      {children}
    </button>
  ));

  return (
    <Dropdown id="1" className="d-inline">
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        Add To Worklist
      </Dropdown.Toggle>

      <Dropdown.Menu as={WorklistMenu} className="dropdown-menu p-2 dropdown-menu-dark" style={{ backgroundColor: '#333', borderColor: 'white', minWidth: '15rem', fontSize: '11px' }} >
        {worklists?.map(({ name, workListID }, y) => {
          return (
            <Dropdown.Item key={y} id={workListID} onSelect={() => onSelect(workListID)}>{name}</Dropdown.Item>
          )
        })
        }
      </Dropdown.Menu>
    </Dropdown>
  );

}

const mapStateToProps = state => {
  return {
    selectedProjects: state.annotationsListReducer.selectedProjects,
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};
export default connect(mapStateToProps)(AddToWorklist);
