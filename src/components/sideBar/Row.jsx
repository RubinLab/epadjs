import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GrDrag } from "react-icons/gr";
import "./style.css";

export const Row = ({ row, activeId }) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
    isDragging
  } = useSortable({
    id: row.original.studyUID
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    background: activeId === row.original.studyUID ? '#343a40' : null
  };
  return (
    <tr ref={setNodeRef} style={style} {...row.getRowProps()}>
      {isDragging ? (
        <td colSpan={row.cells.length}>&nbsp;</td>
      ) : (
        row.cells.map((cell, i) => {
          if (i === 0) {
            return (
              <>
                <td {...attributes} {...listeners} >
                    <GrDrag />
                </td>
                <td {...cell.getCellProps()}>
                    {cell.render("Cell")}
                </td>
              </>  
            );
          }
          return (
            <td {...cell.getCellProps()}>
              {cell.render("Cell")}
            </td>
          );
        })
      )}
    </tr>
  );
};
