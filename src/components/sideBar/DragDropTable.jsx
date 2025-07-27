// import React, { useMemo, useState, useEffect } from "react";
// import {
//   closestCenter,
//   DndContext,
//   DragOverlay,
//   KeyboardSensor,
//   MouseSensor,
//   TouchSensor,
//   useSensor,
//   useSensors
// } from "@dnd-kit/core";
// import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy
// } from "@dnd-kit/sortable";
// import { useTable, useSortBy, useRowSelect } from "react-table";
// import { Row, DraggableRow } from "./Row";
// import "./style.css"

// let savedSortByMap;

// export function DragDropTable({ columns, data, setData, wid }) {
//   const [activeId, setActiveId] = useState();
//   const items = useMemo(() => data?.map(({ studyUID }) => studyUID), [data]);
//   savedSortByMap = sessionStorage.getItem("sortBy");
//   console.log(" -----> savedSortByMap", savedSortByMap);
//   savedSortByMap = savedSortByMap ? new Map(Object.entries(JSON.parse(savedSortByMap))) : new Map();
//   let savedSortByList = savedSortByMap.get(wid) || [];
//   console.log(' ---> savedSortByList', savedSortByList);

//   // Use the state and functions returned from useTable to build your UI
//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//     state: { sortBy }
//   } = useTable({
//     columns,
//     data,
//     initialState: { sortBy: savedSortByList }
//   },
//     useSortBy,  // this hook is required for sorting
//     useRowSelect,
//   );

//     // useEffect(() => {
//     //   if (sortBy.length > 0) savedSortByMap.set(wid, sortBy);
//     //   else savedSortByMap.delete(wid);
//     //   sessionStorage.setItem('sortBy', JSON.stringify(Object.fromEntries(savedSortByMap)));
//     // }, [sortBy]);

//     useEffect(() => {
//       const savedList = savedSortByMap.get(wid);
//       if (savedList && savedList.length) {
//         const orderMap = new Map(savedList.map((item, index) => [item.studyUID, index]));
//         const reorderedData = [...data].sort((a, b) => {
//           return (orderMap.get(a.studyUID) ?? Infinity) - (orderMap.get(b.studyUID) ?? Infinity);
//         });
//         setData(reorderedData);
//       }
//     }, [wid]);

//     useEffect(() => {
//       const currentSaved = savedSortByMap.get(wid);
//       // If there is a sort applied, save the current sorted data
//       if (sortBy.length > 0) {
//         const sortedMinimalList = rows.map(row => ({
//           subjectID: row.original.subjectID || row.original.patientID,
//           studyUID: row.original.studyUID,
//           projectID: row.original.projectID,
//           workListID: row.original.workListID,
//           studyDescription: row.original.studyDescription
//         }));
//         savedSortByMap.set(wid, sortedMinimalList);
//        } else if (currentSaved && currentSaved.length > 0) {
//         // Do nothing if empty but we have a saved sort (initial mount)
//         return;
//        } else {
//         // savedSortByMap.delete(wid);
//       }
//       console.log(" --- setting here", savedSortByMap);
//       sessionStorage.setItem('sortBy', JSON.stringify(Object.fromEntries(savedSortByMap)));
//     }, [sortBy, rows, wid]);

//   const sensors = useSensors(
//     useSensor(MouseSensor, {}),
//     useSensor(TouchSensor, {}),
//     useSensor(KeyboardSensor, {})
//   );

//   function handleDragStart(event) {
//     console.log(event.active);
//     setActiveId(event.active.id);
//   }

//   function handleDragEnd(event) {
//     const { active, over } = event;
//     if (active.id !== over.id) {
//       const newOrder = arrayMove(data, items.indexOf(active.id), items.indexOf(over.id));
//       setData(newOrder);
//     }
//     setActiveId(null);
//   }

//   function handleDragCancel() {
//     setActiveId(null);
//   }

//   const selectedRow = useMemo(() => {
//     if (!activeId) {
//       return null;
//     }
//     const row = rows.find(({ original }) => {
//         return original.studyUID === activeId
//     });
//     prepareRow(row);
//     return row;
//   }, [activeId, rows, prepareRow]);

//   // Render the UI for your table
//   return (
//     <DndContext
//       sensors={sensors}
//       onDragEnd={handleDragEnd}
//       onDragStart={handleDragStart}
//       onDragCancel={handleDragCancel}
//       collisionDetection={closestCenter}
//       modifiers={[restrictToVerticalAxis]}
//     >
//       <table {...getTableProps()}>
//         <thead>
//           {headerGroups.map((headerGroup, inx) => {
//             return (
//             <tr key={`header-row-${inx}`} {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column, i) => {
//                  return (i === 0 ?  
//                         <>
//                             <th key={`sort-i-${i}`} {...column.getHeaderProps()}></th>
//                             {column.sortable ? <th key={`i-${i}`} {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render("Header")}</th> 
//                             : <th key={`i-${i}`} {...column.getHeaderProps()}>{column.render("Header")}</th>}
//                         </>
//                      :     
//                       column.sortable ?
//                         (<th key={`i-${i}`} {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render("Header")}
//                             {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
//                         </th> )
//                         : <th key={`i-${i}`} {...column.getHeaderProps()}>{column.render("Header")}</th>      
//           )})}
//             </tr>
//           )})}
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           <SortableContext items={items} strategy={verticalListSortingStrategy}>
//             {rows.map((row, k) => {
//               prepareRow(row);
//               return <Row key={`${k}-${row.original.StudyUID}`} row={row} activeId={activeId} notDraggable={sortBy.length > 0}/>;
//             })}
//           </SortableContext>
//         </tbody>
//       </table>
//       <DragOverlay>
//         {activeId && (
//           <table style={{ width: "100%" }}>
//             <tbody>
//               <Row row={selectedRow} activeId={activeId} notDraggable={sortBy.length > 0}/>
//             </tbody>
//           </table>
//         )}
//       </DragOverlay>
//     </DndContext>
//   );
// }

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
import { Row } from "./Row";
import "./style.css";

export function DragDropTable({ columns, data, setData, wid }) {
  const [activeId, setActiveId] = useState();

  // ---- Load saved sort state and order from sessionStorage ----
  const savedSortStateMap = JSON.parse(sessionStorage.getItem("sortStateMap")) || {};
  const savedOrderMap = JSON.parse(sessionStorage.getItem("sortedListMap")) || {};
  const savedSortState = savedSortStateMap[wid] || [];

  // ---- Apply previous order before rendering ----
  useEffect(() => {
    const savedOrder = savedOrderMap[wid];
    if (savedOrder && savedOrder.length) {
      const orderMap = new Map(savedOrder.map((item, index) => [item.studyUID, index]));
      const reordered = [...data].sort(
        (a, b) => (orderMap.get(a.studyUID) ?? Infinity) - (orderMap.get(b.studyUID) ?? Infinity)
      );
      setData(reordered);
    }
  }, [wid]);

  const items = useMemo(() => data?.map(({ studyUID }) => studyUID), [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy }
  } = useTable(
    {
      columns,
      data,
      initialState: { sortBy: savedSortState } // restore icons
    },
    useSortBy,
    useRowSelect
  );

  // ---- Persist sort order and sort state whenever sort changes ----
  useEffect(() => {
    const sortedMinimalList = rows.map(row => ({
      subjectID: row.original.subjectID,
      studyUID: row.original.studyUID,
      projectID: row.original.projectID,
      workListID: row.original.workListID
    }));

    savedOrderMap[wid] = sortedMinimalList;
    savedSortStateMap[wid] = sortBy;

    sessionStorage.setItem("sortedListMap", JSON.stringify(savedOrderMap));
    sessionStorage.setItem("sortStateMap", JSON.stringify(savedSortStateMap));
  }, [rows, sortBy, wid]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const newOrder = arrayMove(data, items.indexOf(active.id), items.indexOf(over.id));
      setData(newOrder);

      // Save DnD order immediately
      const minimalList = newOrder.map(item => ({
        subjectID: item.subjectID,
        studyUID: item.studyUID,
        projectID: item.projectID,
        workListID: item.workListID
      }));
      savedOrderMap[wid] = minimalList;
      sessionStorage.setItem("sortedListMap", JSON.stringify(savedOrderMap));
    }
    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const selectedRow = useMemo(() => {
    if (!activeId) return null;
    const row = rows.find(({ original }) => original.studyUID === activeId);
    prepareRow(row);
    return row;
  }, [activeId, rows, prepareRow]);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
    >
      <table {...getTableProps()} className="drag-drop-table">
        <thead>
          {headerGroups.map((headerGroup, hgIndex) => (
            <tr key={`header-group-${hgIndex}`} {...headerGroup.getHeaderGroupProps()}>
              {/* First empty header cell for drag handle */}
              <th style={{ width: '40px' }}></th>
              {/* Render actual headers */}
              {headerGroup.headers.map((column, colIndex) => (
                <th
                  key={`header-${colIndex}`}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render('Header')}
                  {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
  
        <tbody {...getTableBodyProps()}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {rows.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <Row
                  key={`${rowIndex}-${row.original.studyUID}`}
                  row={row}
                  activeId={activeId}
                  notDraggable={sortBy.length > 0} // disable drag when sorted
                />
              );
            })}
          </SortableContext>
        </tbody>
      </table>
  
      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && (
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '40px', textAlign: 'center' }}>☰</td>          
                {selectedRow &&
                  selectedRow.cells.map((cell, i) => (
                    <td key={`overlay-cell-${i}`} style={{ padding: '8px', background: '#6c757d' }}>
                      {cell.render('Cell')}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        )}
      </DragOverlay>
    </DndContext>
  );
  
}

