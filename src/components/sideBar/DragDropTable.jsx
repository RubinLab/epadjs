import React, { useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useTable, useSortBy, useRowSelect } from "react-table";
import { Row, DraggableRow } from "./Row";
import "./style.css"


export function DragDropTable({ columns, data, setData }) {
  const [activeId, setActiveId] = useState();
  const items = useMemo(() => data?.map(({ studyUID }) => studyUID), [data]);
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  },
    useSortBy,  // this hook is required for sorting
    useRowSelect,
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  function handleDragStart(event) {
    console.log(event.active);
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setData((data) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const selectedRow = useMemo(() => {
    if (!activeId) {
      return null;
    }
    const row = rows.find(({ original }) => {
        return original.studyUID === activeId
    });
    prepareRow(row);
    return row;
  }, [activeId, rows, prepareRow]);

  // Render the UI for your table
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
    >
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, inx) => {
            return (
            <tr key={`hdr-r-${inx}`} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, i) => {
                 return (i === 0 ?  
                        <>
                            <th {...column.getHeaderProps()}></th>
                            {column.sortable ? <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render("Header")}</th> 
                            : <th {...column.getHeaderProps()}>{column.render("Header")}</th>}
                        </>
                     :     
                      column.sortable ?
                        (<th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render("Header")}
                            {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                        </th> )
                        : <th {...column.getHeaderProps()}>{column.render("Header")}</th>      
          )})}
            </tr>
          )})}
        </thead>
        <tbody {...getTableBodyProps()}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {rows.map((row, k) => {
            //   console.log('-->', row);  
              prepareRow(row);
              return <Row key={`${k}-${row.original.StudyUID}`} row={row} activeId={activeId}/>;
            })}
          </SortableContext>
        </tbody>
      </table>
      <DragOverlay>
        {activeId && (
          <table style={{ width: "100%" }}>
            <tbody>
              <Row row={selectedRow} activeId={activeId}/>
            </tbody>
          </table>
        )}
      </DragOverlay>
    </DndContext>
  );
}
