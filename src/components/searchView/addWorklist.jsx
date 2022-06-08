import React from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import {
  getWorklistsOfCreator,
  addStudyToWorklist,
  addSubjectToWorklist,
  addAimsToWorklist
} from "../../services/worklistServices";

class WorklistAdd extends React.Component {

  state = { worklists: [] };

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  componentDidMount = async () => {
    const { data: worklists } = await getWorklistsOfCreator();
    this.setState({ worklists });
    document.addEventListener("mousedown", this.handleClickOutside);
    document.addEventListener('keydown', this.handleClickOutside);
  };



  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
    document.removeEventListener('keydown', this.handleClickOutside);
  }

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.onClose();
    }
  };

  addStudyToWorklist = e => {
    const studies = Object.values(this.props.selectedStudies);
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
        this.props.updateProgress();
      })
      .catch(err => console.log(err));
  };

  addSubjectToWorklist = e => {
    const subjects = Object.values(this.props.selectedPatients);
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
        this.props.updateProgress();
      })
      .catch(err => console.log(err));
  };

  addAnnotationsToWorklist = async (annotations, worklist) => {
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
    } catch (e) {
      toast.fail("Error adding annotation(s) to worklist.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });
      console.error(e);
    }
    this.props.onClose();
  }

  onSelect = e => {
    const { selectedStudies, selectedPatients, selectedAnnotations } = this.props;
    if (Object.values(selectedStudies).length > 0) {
      this.addStudyToWorklist(e);
      this.props.onClose();
    } else if (Object.values(selectedPatients).length > 0) {
      this.addSubjectToWorklist(e);
      this.props.onClose();
    } else if (Object.values(selectedAnnotations).length > 0) {
      this.addAnnotationsToWorklist(selectedAnnotations, e.target.id);
      this.props.onClose();
    }

  };

  render() {
    const element = document.getElementsByClassName(this.props.className);

    var rect = element[0].getBoundingClientRect();
    const worklists = [];
    this.state.worklists.forEach((el, i) => {
      worklists.push(
        <div
          className="worklist__option"
          onClick={this.onSelect}
          id={el.workListID}
          key={`${el.workListID} - ${i}`}
        >
          {el.name}
        </div>
      );
    });

    return (
      <div ref={this.setWrapperRef}>
        <div
          className="worklist-popup"
          style={{ left: rect.right - 5, top: rect.bottom - 5 }}
        >
          {worklists}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedProjects: state.annotationsListReducer.selectedProjects,
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};
export default connect(mapStateToProps)(WorklistAdd);
