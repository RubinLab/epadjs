import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

const projectAdd = ({ projectMap, onSave, onProjectClose }) => {
  const projectNames = Object.values(projectMap);
  const projectIDs = Object.keys(projectMap);
  let wrapperRef = useRef(null);

  const element = document.getElementsByClassName(
    "searchView-toolbar__icon project-icon"
  );

  const handleClickOutside = event => {
    const { id } = event.target;

    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      console.log("in event listener");
      onProjectClose();
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

  var rect = element[0].getBoundingClientRect();
  const projects = [];
  projectNames.forEach((el, i) => {
    projects.push(
      <div
        className="project__option"
        onClick={onSave}
        id={projectIDs[i]}
        key={`${projectIDs[i]} - ${i}`}
      >
        {el}
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

const mapStateToProps = state => {
  return {
    patients: state.annotationsListReducer.selectedPatients,
    studies: state.annotationsListReducer.selectedStudies,
  };
};
export default connect(mapStateToProps)(projectAdd);
