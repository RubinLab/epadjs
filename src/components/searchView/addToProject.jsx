import React from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaProjectDiagram } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { addAimsToProject } from "../../services/projectServices";

const ProjectAdd = ({ projectMap, onSave, className, annotations, deselect, parent, showAddTo }) => {
  const projectNames = Object.values(projectMap);
  const projectIDs = Object.keys(projectMap);

  const addSelectionToProject = async (projectId) => {
    // If selected are not annotations, search is view is handling it (by props on Save)
    if (!annotations.length && onSave)
      onSave(projectId);
    else {
      const aimIDs = Object.keys(annotations);
      try {
        await addAimsToProject(projectId, aimIDs);
        window.dispatchEvent(new Event('refreshProjects'));
        toast.success("Annotation(s) succesfully copied.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
        deselect();
      } catch (e) {
        toast.error("Error moving annotation(s).", {
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
  }

  const ProjectMenu = React.forwardRef(({ children, style, className }, ref) => {
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

  const CustomToggle3 = React.forwardRef(({ children, onClick }, ref) => (
    <button type="button" className="btn btn-sm color-schema" ref={ref}
      onClick={e => {
        e.preventDefault();
        onClick(e);
      }}>
      <FaProjectDiagram /><br />
      {children}
    </button>
  ));

  const CustomToggleList = React.forwardRef(({ children, onClick }, ref) => (
    <div
      className={
        showAddTo
          ? 'searchView-toolbar__icon project-icon'
          : 'hide-delete'
      }
      onClick={e => {
        e.preventDefault();
        onClick(e);
      }}
      ref={ref}
    >
      <div>
        <FaProjectDiagram
          style={{ fontSize: '1.2rem' }}
          data-tip
          data-for="project-icon"
        />
      </div>
      <ReactTooltip
        id="project-icon"
        place="bottom"
        type="info"
        delayShow={1500}
      >
        <span>Add to project</span>
      </ReactTooltip>
    </div>
  ));

  return (
    <Dropdown id="1" className="d-inline">
      <Dropdown.Toggle as={parent !== "patientList" ? CustomToggle3 : CustomToggleList}>
        Copy To Project
      </Dropdown.Toggle>

      <Dropdown.Menu as={ProjectMenu} className="dropdown-menu p-2 dropdown-menu-dark" style={{ maxHeight: '20rem', overflow: 'overlay', backgroundColor: '#333', borderColor: 'white', minWidth: '15rem', fontSize: '11px' }} >
        {projectNames?.map(({ projectName }, y) => {
          return (
            <Dropdown.Item key={y} eventKey={projectIDs[y]} onSelect={eventKey => addSelectionToProject(eventKey)}>{projectName}</Dropdown.Item>
          )
        })
        }
      </Dropdown.Menu>
    </Dropdown >
  );

}
const mapStateToProps = (state) => {
  return {
    patients: state.annotationsListReducer.selectedPatients,
    studies: state.annotationsListReducer.selectedStudies,
    projectMap: state.annotationsListReducer.projectMap,
    annotations: state.annotationsListReducer.selectedAnnotations
  };
};
export default connect(mapStateToProps)(ProjectAdd);

