import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GrDrag } from "react-icons/gr";
import { toast } from "react-toastify";
import "./style.css";

export const Row = ({ row, activeId, notDraggable, sameStudy }) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
    isDragging
  } = useSortable({
    id: row.original.studyUID,
    disabled: notDraggable
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    background: activeId === row.original.studyUID ? '#343a40' : null,
  };

  const sameStudyStyle = sameStudy &&  row.original.studyUID ===  sameStudy? {background:'#495057'} : {background: null }

  const showWarning = () => {
    const message = "Can't drag-drop on a sorted table!";
    const setting = { 
      position: "top-right", 
      autoClose: 5000, 
      hideProgressBar: false, 
      closeOnClick: true,
      pauseOnHover: true, 
      draggable: true
    }
    toast.error(message, setting);
  }

  return (
    <tr ref={setNodeRef} style={style} {...row.getRowProps()}>
      {isDragging ? (
        <td colSpan={row.cells.length}>&nbsp;</td>
      ) : (
        row.cells.map((cell, i) => {
          if (i === 0) {
            return (
              <>
                {notDraggable ? 
                  <td onMouseDown={showWarning} style={sameStudyStyle}>
                    <GrDrag />
                  </td> :
                  <td {...attributes} {...listeners} style={sameStudyStyle}>
                      <GrDrag />
                  </td>}
                <td {...cell.getCellProps()} style={sameStudyStyle}>
                    {cell.render("Cell")}
                </td>
              </>  
            );
          }
          return (
            <td {...cell.getCellProps()} style={sameStudyStyle}>
              {cell.render("Cell")}
            </td>
          );
        })
      )}
    </tr>
  );
};
