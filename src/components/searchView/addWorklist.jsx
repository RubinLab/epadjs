import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Dropdown from 'react-bootstrap/Dropdown';
import ReactTooltip from 'react-tooltip';
import { FaClipboardList } from 'react-icons/fa';
import {
  getWorklistsOfCreator,
  addStudiesToWorklist,
  addSubjectsToWorklist,
  addAimsToWorklist
} from "../../services/worklistServices";
import { clearSelection } from "../annotationsList/action";
import { findSelectedCheckboxes, resetSelectAllCheckbox } from '../../Utils/aid.js';


const AddToWorklist = (props) => {
  const mode = sessionStorage.getItem('mode');
  const [worklists, setWorklist] = useState([]);
  const [firstRun, setFirstRun] = useState(true);
  const [selectedData, setSelectedData] = useState([]);

  const formStudyData = () => {
    const studies = Object.values(props.selectedStudies);
    const data = [];
    studies.forEach(el => {
      const {
        projectID,
        patientID,
        studyUID,
        patientName,
        studyDescription,
      } = el;
      data.push({
        projectID, patientID, studyUID, body: {
          studyDesc: studyDescription,
          subjectName: patientName
        }
      })
      setSelectedData(data);
    })
  };

  const formPatientData = () => {
    const patients = Object.values(props.selectedPatients);
    const data = [];
    patients.forEach(el => {
      const { projectID, patientID, subjectName } = el;
      data.push({ projectID, patientID, body: { subjectName } })
      setSelectedData(data);
    })
  };

  useEffect(() => {
    const studies = Object.values(props.selectedStudies);
    const subjects = Object.values(props.selectedPatients);
    if (studies.length > 0) {
      formStudyData();
    } else if (subjects.length > 0) {
      formPatientData();
    } else {
      setSelectedData({});
    }
  }, [props.selectedPatients, props.selectedStudies])

  const addAnnotationsToWorklist = async (annotations, worklist) => {
    const aimIDs = Array.isArray(annotations) ? annotations : Object.keys(annotations);
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
      resetSelectAllCheckbox(false);
      // props.deselect();
      props.dispatch(clearSelection());
      if (mode !== 'teaching' && props.refresh) props.refresh();
      else props.forceUpdatePage()
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
      resetSelectAllCheckbox(false);
    }
  }

  const addSelectedStudiesToWorklist = async (worklist) => {
    try {
      await addStudiesToWorklist(worklist, selectedData);
      toast.success("Studies succesfully added to worklist.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });
      // props.deselect();
      props.dispatch(clearSelection());
      if (mode !== 'teaching' && props.refresh) props.refresh();
      else props.forceUpdatePage();
    } catch (e) {
      toast.error("Error adding studies to worklist.", {
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

  const addSelectedSubjectsToWorklist = async (worklist) => {
    try {
      await addSubjectsToWorklist(worklist, selectedData);
      toast.success("Subjects succesfully added to worklist.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });
      // props.deselect();
      props.dispatch(clearSelection());
      if (mode !== 'teaching' && props.refresh) props.refresh();
      else props.forceUpdatePage()
    } catch (e) {
      toast.error("Error adding subjects to worklist.", {
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
    const storedAims = Object.keys(selectedAnnotations);
    const selectedAims = storedAims.length > 0 ? storedAims : findSelectedCheckboxes();
    if (Object.values(selectedStudies).length > 0) {
      addSelectedStudiesToWorklist(workListID, selectedData);
    } else if (Object.values(selectedPatients).length > 0) {
      addSelectedSubjectsToWorklist(workListID, selectedData);
    } else if (selectedAims.length > 0) {
      addAnnotationsToWorklist(selectedAims, workListID);
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


  const CustomToggleSearch = React.forwardRef(({ children, onClick }, ref) => (
    <button type="button" className="btn btn-sm color-schema" ref={ref}
      onClick={e => {
        if (firstRun) {
          fillWorklists();
          setFirstRun(false);
        }
        onClick(e);
      }}>
      <FaClipboardList /> <br />
      {children}
    </button>
  ));

  const CustomToggleList = React.forwardRef(({ children, onClick }, ref) => (
    <div
      className={props.showAddTo && props.project !== 'all' ? 'searchView-toolbar__icon worklist-icon' : 'hide-delete'}
      onClick={e => {
        if (firstRun) {
          fillWorklists();
          setFirstRun(false);
        }
        onClick(e);
      }}
      ref={ref}
    >
      <div>
        <FaClipboardList
          style={{ fontSize: '1.2rem' }}
          data-tip
          data-for="worklist-icon"
        />
      </div>
      <ReactTooltip
        id="worklist-icon"
        place="bottom"
        type="info"
        delayShow={1500}
      >
        <span>Add to worklist</span>
      </ReactTooltip>
    </div>
  ));

  return (
    <Dropdown id="1" className="d-inline">
      <Dropdown.Toggle as={props.parent !== "patientList" ? CustomToggleSearch : CustomToggleList} id="dropdown-custom-components">
        Add To Worklist
      </Dropdown.Toggle>

      <Dropdown.Menu as={WorklistMenu} className="dropdown-menu p-2 dropdown-menu-dark" style={{ maxHeight: '20rem', overflow: 'overlay', backgroundColor: '#333', borderColor: 'white', minWidth: '15rem', fontSize: '11px' }} >
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
