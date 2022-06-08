import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { addAimsToProject } from "../../services/projectServices";

const ProjectAdd = ({ projectMap, onSave, onClose, className, annotations }) => {
  const projectNames = Object.values(projectMap);
  const projectIDs = Object.keys(projectMap);
  let wrapperRef = useRef(null);

  const element = document.getElementsByClassName(className);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleClickOutside);
    return function cleanup() {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside);
    };
  });

  const addSelectionToProject = async (e) => {
    // If selected are not annotations, search is view is handling it (by props on Save)
    if (!annotations.length && onSave)
      onSave(e);
    else {
      const { id } = e.target;
      const aimIDs = Object.keys(annotations);
      try {
        await addAimsToProject(id, aimIDs);
        toast.success("Annotation(s) succesfully moved.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
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
    onClose();
  }

  var rect = element[0].getBoundingClientRect();
  const projects = [];
  projectNames.forEach((el, i) => {
    projects.push(
      <div
        className="project__option"
        onClick={addSelectionToProject}
        id={projectIDs[i]}
        key={`${projectIDs[i]} - ${i}`}
      >
        {el.projectName}
      </div>
    );
  });

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

