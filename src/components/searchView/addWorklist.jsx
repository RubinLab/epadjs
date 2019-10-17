import React from "react";
import { connect } from "react-redux";
import {
  getWorklistsOfCreator,
  addStudyToWorklist,
  addSubjectToWorklist
} from "../../services/worklistServices";

class WorklistAdd extends React.Component {
  state = { worklists: [] };
  //   handleDrag(e, ui) {
  //     const { x, y } = this.state.deltaPosition;
  //     this.setState({
  //       deltaPosition: {
  //         x: x + ui.deltaX,
  //         y: y + ui.deltaY
  //       }
  //     });
  //   }

  //   onStart() {
  //     this.setState({ activeDrags: ++this.state.activeDrags });
  //   }

  //   onStop() {
  //     this.setState({ activeDrags: --this.state.activeDrags });
  //   }

  //   // For controlled component
  //   adjustXPos(e) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     const { x, y } = this.state.controlledPosition;
  //     this.setState({ controlledPosition: { x: x - 10, y } });
  //   }

  //   adjustYPos(e) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     const { controlledPosition } = this.state;
  //     const { x, y } = controlledPosition;
  //     this.setState({ controlledPosition: { x, y: y - 10 } });
  //   }

  //   onControlledDrag(e, position) {
  //     const { x, y } = position;
  //     this.setState({ controlledPosition: { x, y } });
  //   }

  //   onControlledDragStop(e, position) {
  //     this.onControlledDrag(e, position);
  //     this.onStop();
  //   }

  //   setWrapperRef = node => {
  //     this.wrapperRef = node;
  //   };

  componentDidMount = async () => {
    const { data: worklists } = await getWorklistsOfCreator();
    console.log(worklists);
    this.setState({ worklists });
    document.addEventListener("mousedown", this.handleClickOutside);
  };

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  //   handleClickOutside = event => {
  //     if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
  //       this.props.onClose();
  //     }
  //   };

  addStudyToWorklist = e => {
    const { projectID, patientID, studyUID } = Object.values(
      this.props.selectedStudies
    )[0];
    addStudyToWorklist(e.target.id, "sf", patientID, studyUID)
      .then(() => {
        console.log("yeap");
      })
      .catch(err => console.log(err));
  };

  addSubjectToWorklist = e => {
    const { projectID, subjectID } = Object.values(
      this.props.selectedPatients
    )[0];
    console.log("target id =====");
    console.log(e.target.id);
    addSubjectToWorklist(e.target.id, "sf", subjectID)
      .then(() => {
        console.log("yeap");
      })
      .catch(err => console.log(err));
  };

  onSelect = e => {
    // get project, subject, serie, study no from the store
    if (Object.values(this.props.selectedStudies).length > 0) {
      this.addStudyToWorklist(e);
    } else if (Object.values(this.props.selectedPatients).length > 0) {
      this.addSubjectToWorklist(e);
    }

    // console.log("HEYOOOO !!!");
    // console.log(e.target.id);
    // console.log(Object.values(this.props.selectedStudies));
    // const { projectID, patientID, studyUID } = Object.values(
    //   this.props.selectedStudies
    // )[0];
    // console.log(projectID, patientID, studyUID);
    // addStudyToWorklist(e.target.id, "sf", patientID, studyUID)
    //   .then(() => {
    //     console.log("yeap");
    //   })
    //   .catch(err => console.log(err));
  };
  render() {
    // const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    // const { deltaPosition, controlledPosition } = this.state;

    // const element = document.getElementsByClassName(
    //   "searchView-toolbar__icon new-icon"
    // );

    // var rect = element[0].getBoundingClientRect();
    const worklists = [];
    this.state.worklists.forEach((el, i) => {
      console.log(el);
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
          className="new-popup"
          //   style={{ left: rect.right - 10, top: rect.bottom + 10 }}
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
