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
  const [show, setShow] = useState(false);

  const setWrapperRef = node => {
    this.wrapperRef = node;
  };

  // componentDidMount = async () => {
  //   const { data: worklists } = await getWorklistsOfCreator();
  //   this.setState({ worklists });
  //   document.addEventListener("mousedown", this.handleClickOutside);
  //   document.addEventListener('keydown', this.handleClickOutside);
  // };



  // componentWillUnmount() {
  //   document.removeEventListener("mousedown", this.handleClickOutside);
  //   document.removeEventListener('keydown', this.handleClickOutside);
  // }

  // handleClickOutside = event => {
  //   if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
  //     this.props.onClose();
  //   }
  // };

  const addStudyToWorklist = e => {
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
        addStudyToWorklist(e.target.id, projectID, patientID, studyUID, {
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

  const addSubjectToWorklist = e => {
    const subjects = Object.values(props.selectedPatients);
    const promises = [];
    subjects.forEach((el, index) => {
      const { projectID, patientID, subjectName } = el;
      promises.push(
        addSubjectToWorklist(e.target.id, projectID, patientID, {
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
    console.log("Event", worklist);
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
    setShow(false);
  }

  const fillWorklists = async () => {
    const { data: worklists } = await getWorklistsOfCreator();
    setWorklist(worklists);
  }

  const onSelect = (e) => {
    const { selectedStudies, selectedPatients, selectedAnnotations } = props;
    if (Object.values(selectedStudies).length > 0) {
      addStudyToWorklist(e);
    } else if (Object.values(selectedPatients).length > 0) {
      addSubjectToWorklist(e);
    } else if (Object.values(selectedAnnotations).length > 0) {
      addAnnotationsToWorklist(selectedAnnotations, e.target.id);
    }
  };

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
    <Dropdown className="d-inline" >
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        Add To Worklist
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-menu p-2 dropdown-menu-dark" style={{ backgroundColor: '#333', borderColor: 'white' }} >
        {worklists?.map(({ name, workListID }, y) => {
          return (
            <div key={y} id={workListID} className="row" onClick={onSelect}>
              <label id={workListID} className="form-check-label title-case" style={{ paddingLeft: '0.3rem', cursor: 'pointer' }} htmlFor="flexCheckDefault">
                {name}
              </label>
            </div>
          )
        })
        }
      </Dropdown.Menu>
    </Dropdown>
  );

  // render() {
  //   const element = document.getElementsByClassName(this.props.className);

  //   var rect = element[0].getBoundingClientRect();
  //   const worklists = [];
  //   this.state.worklists.forEach((el, i) => {
  //     worklists.push(
  //       <div
  //         className="worklist__option"
  //         onClick={this.onSelect}
  //         id={el.workListID}
  //         key={`${el.workListID} - ${i}`}
  //       >
  //         {el.name}
  //       </div>
  //     );
  //   });

  //   return (
  //     <div ref={this.setWrapperRef}>
  //       <div
  //         className="worklist-popup"
  //         style={{ left: rect.right - 5, top: rect.bottom - 5 }}
  //       >
  //         {worklists}
  //       </div>
  //     </div>
  //   );
  // }
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
