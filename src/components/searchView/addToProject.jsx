import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Dropdown from 'react-bootstrap/Dropdown';
import { BiDownload } from 'react-icons/bi';
import { addAimsToProject } from "../../services/projectServices";
import { setShadow } from "cornerstone-tools/drawing";

const ProjectAdd = ({ projectMap, onSave, onClose, className, annotations, deselect }) => {
  const projectNames = Object.values(projectMap);
  const projectIDs = Object.keys(projectMap);
  // let wrapperRef = useRef(null);

  const [show, setShow] = useState(false);

  const element = document.getElementsByClassName(className);

  // const handleClickOutside = (event) => {
  //   if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
  //     onClose();
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("mousedown", handleClickOutside);
  //   document.addEventListener("keydown", handleClickOutside);
  //   return function cleanup() {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //     document.removeEventListener("keydown", handleClickOutside);
  //   };
  // });

  const addSelectionToProject = async (e) => {
    // If selected are not annotations, search is view is handling it (by props on Save)
    if (!annotations.length && onSave)
      onSave(e);
    else {
      const { id } = e.target;
      const aimIDs = Object.keys(annotations);
      try {
        await addAimsToProject(id, aimIDs);
        window.dispatch(new Event('refreshProjects'));
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
        toast.fail("Error moving annotation(s).", {
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
    setShow(false);
  }

  const CustomToggle2 = React.forwardRef(({ children, onClick }, ref2) => (
    <button type="button" className="btn btn-sm color-schema" ref={ref2}
      onClick={e => {
        onClick(e);
      }}>
      <BiDownload /><br />
      {children}
    </button>
  ));

  return (
    <Dropdown id="2" className="d-inline">
      <Dropdown.Toggle as={CustomToggle2} id="dropdown-custom-components2">
        Copy To Project
      </Dropdown.Toggle>

      <Dropdown.Menu id="2-2" className="dropdown-menu p-2 dropdown-menu-dark" style={{ backgroundColor: '#333', borderColor: 'white' }}>
        {projectNames?.map(({ projectName }, y) => {
          return (
            <div key={y} id={projectIDs[y]} className="row" onClick={addSelectionToProject}>
              <label id={projectIDs[y]} className="form-check-label title-case" style={{ paddingLeft: '0.3rem', cursor: 'pointer' }} htmlFor="flexCheckDefault" >
                {projectName}
              </label>
            </div>
          )
        })
        }
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <div ref={wrapperRef}>
      <div
        className="projects-popup"
        style={{ left: rect.right - 5, top: rect.bottom - 5 }}
      >
        {projects}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    patients: state.annotationsListReducer.selectedPatients,
    studies: state.annotationsListReducer.selectedStudies,
    projectMap: state.annotationsListReducer.projectMap,
    annotations: state.annotationsListReducer.selectedAnnotations
  };
};
export default connect(mapStateToProps)(ProjectAdd);

