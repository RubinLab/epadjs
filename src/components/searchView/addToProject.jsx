import React from "react";
import { connect } from "react-redux";
import _ from 'lodash';
import { toast } from "react-toastify";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaProjectDiagram } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { addAimsToProject } from "../../services/projectServices";
import { findSelectedCheckboxes, resetSelectAllCheckbox } from '../../Utils/aid.js';


// const ProjectAdd = ({ projectMap, onSave, className, annotations, deselect, parent, showAddTo, history }) => {
const ProjectAdd = (props) => {
  const { projectMap, onSave, className, annotations, deselect, parent, showAddTo, updateUrl, selectedSearchAnnotations, searchTableIndex } = props;
  const projectNames = Object.values(projectMap);
  const projectIDs = Object.keys(projectMap);

  const addSelectionToProject = async (projectId) => {
    // If selected are not annotations, search is view is handling it (by props on Save)
    const aimsPassed = annotations && annotations.length > 0;
    if (!aimsPassed && onSave) {
      onSave(projectId);
    } else {
      let aimsArr;
      const storeIds = Object.keys(annotations);
      if (storeIds.length > 0) { 
        aimsArr = Object.keys(annotations); 
      } else {
        const selectedIds = findSelectedCheckboxes();
        // clone the storedaims
        let storedAims = _.cloneDeep(selectedSearchAnnotations);
        // remove the current page
        if (storedAims[searchTableIndex]) delete storedAims[searchTableIndex];
        // get aim ids in an array
        storedAims = Object.values(storedAims);
        // merge aimdIds of the map
        aimsArr = storedAims.reduce((all, item) => {
          const arr = Object.keys(item);
          if (all) return [...all, ...arr];
          else return arr;
        }, []);
        // merge checkboxes for the current page on top of the map's
        if (selectedIds.length > 0) aimsArr = [...aimsArr, ...selectedIds];
      }
      try {
        await addAimsToProject(projectId, aimsArr);
        window.dispatchEvent(new CustomEvent('refreshProjects', { detail: projectId }));
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
            <Dropdown.Item key={y} eventKey={projectIDs[y]} onSelect={eventKey => { addSelectionToProject(eventKey); updateUrl(`/search/${eventKey}`) }}>{projectName}</Dropdown.Item>
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
    annotations: state.annotationsListReducer.selectedAnnotations,
    selectedSearchAnnotations: state.annotationsListReducer.selectedSearchAnnotations,
    searchTableIndex: state.annotationsListReducer.searchTableIndex,
  };
};
export default connect(mapStateToProps)(ProjectAdd);

