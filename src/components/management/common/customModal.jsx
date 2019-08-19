import React from "react";
import ResizeAndDrag from "./resizeAndDrag";
import Header from "./managementHeader";
import Users from "../users";
import Projects from "./../projects/projects";
import WorkLists from "./../worklists/workLists";
import Annotations from "./../annotations/annotations";

const customModal = ({ selection, handleCloseModal, children }) => {
  const selectDisplay = () => {
    switch (selection) {
      case "Users":
        return <Users selection={selection} onClose={handleCloseModal} />;
      case "Projects":
        return <Projects selection={selection} onClose={handleCloseModal} />;
      case "Worklists":
        return <WorkLists selection={selection} onClose={handleCloseModal} />;
      case "Annotations":
        return <Annotations selection={selection} onClose={handleCloseModal} />;
      default:
        return <div />;
    }
  };

  return (
    <>
      <div className="modal-overlay-div" />
      <div className="modal-content-div">
        {/* <ResizeAndDrag> {selectDisplay()} </ResizeAndDrag> */}
        <ResizeAndDrag> {children} </ResizeAndDrag>
      </div>
    </>
  );
};

export default customModal;
