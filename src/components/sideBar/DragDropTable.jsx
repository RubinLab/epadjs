import React, { useMemo, useState, useEffect } from "react";
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

let savedSortByMap;

export function DragDropTable({ columns, data, setData, wid }) {
  const [activeId, setActiveId] = useState();
  const items = useMemo(() => data?.map(({ studyUID }) => studyUID), [data]);
  savedSortByMap = sessionStorage.getItem("sortBy");
  savedSortByMap = savedSortByMap ? new Map(Object.entries(JSON.parse(savedSortByMap))) : new Map();
  let savedSortByList = savedSortByMap.get(wid) || [];

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy }
  } = useTable({
    columns,
    data,
    initialState: { sortBy: savedSortByList }
  },
    useSortBy,  // this hook is required for sorting
    useRowSelect,
  );

    useEffect(() => {
      if (sortBy.length > 0) {
        savedSortByMap.set(wid, sortBy);
        sessionStorage.setItem("sortBy", JSON.stringify(Object.fromEntries(savedSortByMap)));
      }
    }, [sortBy]);

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
            <tr key={`header-row-${headerGroup.id || inx}`} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, i) => {
                 return (i === 0 ?  
                        <>
                            <th key={`sort-i-${i}`} {...column.getHeaderProps()}></th>
                            {column.sortable ? <th key={`i-${i}`} {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render("Header")}</th> 
                            : <th key={`i-${i}`} {...column.getHeaderProps()}>{column.render("Header")}</th>}
                        </>
                     :     
                      column.sortable ?
                        (<th key={`i-${i}`} {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render("Header")}
                            {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                        </th> )
                        : <th key={`i-${i}`} {...column.getHeaderProps()}>{column.render("Header")}</th>      
          )})}
            </tr>
          )})}
        </thead>
        <tbody {...getTableBodyProps()}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {rows.map((row, k) => {
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
