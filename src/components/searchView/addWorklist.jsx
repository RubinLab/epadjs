import React from "react";
import { connect } from "react-redux";
import {
  getWorklistsOfCreator,
  addStudyToWorklist,
  addSubjectToWorklist
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
  };

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
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
        studyDescription
      } = el;
      promises.push(
        addStudyToWorklist(e.target.id, projectID, patientID, studyUID, {
          studyDesc: studyDescription,
          subjectName: patientName
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
      const { projectID, subjectID, subjectName } = el;
      promises.push(
        addSubjectToWorklist(e.target.id, projectID, subjectID, {
          subjectName
        })
      );
    });

    Promise.all(promises)
      .then(() => {
        this.props.updateProgress();
      })
      .catch(err => console.log(err));
  };

  onSelect = e => {
    if (Object.values(this.props.selectedStudies).length > 0) {
      this.addStudyToWorklist(e);
    } else if (Object.values(this.props.selectedPatients).length > 0) {
      this.addSubjectToWorklist(e);
    }
  };
  render() {
    const element = document.getElementsByClassName(
      "searchView-toolbar__icon worklist-icon"
    );

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
          style={{ left: rect.right - 10, top: rect.bottom + 10 }}
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
    selectedStudies: state.annotationsListReducer.selectedStudies
  };
};
export default connect(mapStateToProps)(WorklistAdd);
