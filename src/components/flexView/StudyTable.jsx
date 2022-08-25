import React, { useState } from "react";
import ReactTable from "react-table-v6";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import find from "lodash/find";
// import "./flexView.css";
import '../annotationSearch/annotationSearch.css';

import {
  clearCarets,
  formatTime,
  formatDate,
  reverseCarets
} from "./helperMethods";

const StudyTable = ({ data, order, displaySeries }) => {
  const [sortedCol, setSortedCol] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const defineColumns = () => {
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(columns[item]);
    }
    return tableColumns;
  };

  const filterString = (filter, row) => {
    try {
      const attrWithCarets = ["studyDescription-id", "patientName-id"];
      const { id, value } = filter;
      const valueLowercase = row[id].toLowerCase();
      const keyLowercaseControlled = attrWithCarets.includes(id)
        ? reverseCarets(value).toLowerCase()
        : value.toLowerCase();
      const keyLowercase = value.toLowerCase();
      return (
        valueLowercase.includes(keyLowercaseControlled) ||
        valueLowercase.includes(keyLowercase)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getTheadThProps = (table, row, col) => {
    const sortedCol = find(table.sorted, { id: col.id });
    const boxShadow = sortedCol
      ? `inset 0px ${sortedCol.desc ? -3 : 3}px 0px 0px orangered`
      : "";
    const background = sortedCol ? "#3a3f44" : "";
    // return {
    //   style: {
    //     boxShadow,
    //     background
    //   }
    // };
    return { className: 'select_row', style: { color: '#eaddb2' } };
  };

  const filterDateAndTime = (filter, row, type) => {
    try {
      const formattedKey =
        type === "date"
          ? filter.value.split("-").join("")
          : filter.value.split(":").join("");
      return row[filter.id].includes(formattedKey);
    } catch (err) {
      console.log(err);
    }
  };

  const filterArray = (filter, row) => {
    try {
      const keyLowercase = filter.value.toLowerCase();
      const keyUppercase = filter.value.toUpperCase();
      return (
        row[filter.id].includes(keyLowercase) ||
        row[filter.id].includes(keyUppercase)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const columns = [
    {
      Header: "Exam",
      accessor: "examTypes",
      id: "examTypes-id",
      resizable: true,
      sortable: false,
      show: true,
      filterMethod: (filter, row) => filterArray(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "examTypes-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return Array.isArray(row.original.examTypes) ? (
          <div>{row.original.examTypes.join(", ")}</div>
        ) : (
          <div>{row.original.examType}</div>
        );
      }
    },
    {
      Header: () => <span> Patient Name</span>,
      accessor: "patientName",
      id: "patientName-id",
      resizable: true,
      sortable: true,
      show: true,
      style: { color: 'white' },
      filterMethod: (filter, row) => filterString(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "patientName-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return <div>{clearCarets(row.original.patientName)}</div>;
      }
    },
    {
      Header: "PatientID",
      accessor: "patientID",
      id: "patientID-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "patientID-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: "Sex",
      accessor: "sex",
      id: "sex-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "sex-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: "Description",
      accessor: "studyDescription",
      id: "studyDescription-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor:
            sortedCol === "studyDescription-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        let desc = row.original.studyDescription
          ? row.original.studyDescription
          : "Unnamed Study";
        return <div>{clearCarets(desc)}</div>;
      }
    },
    {
      Header: "Insert Date",
      accessor: "insertDate",
      id: "insertDate-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, "date"),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "insertDate-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return <div>{formatDate(row.original.insertDate)}</div>;
      }
    },
    {
      Header: "Study Date",
      accessor: "studyDate",
      id: "studyDate-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, "date"),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "studyDate-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return <div>{formatDate(row.original.studyDate)}</div>;
      }
    },
    {
      Header: "Study Time",
      accessor: "studyTime",
      id: "studyTime-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, "time"),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "studyTime-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return <div>{formatTime(row.original.studyTime)}</div>;
      }
    },
    {
      Header: "Study UID",
      accessor: "studyUID",
      id: "studyUID-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "studyUID-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: "# of Aims",
      accessor: "numberOfAnnotations",
      id: "numberOfAnnotations-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => row[filter.id] >= filter.value,
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor:
            sortedCol === "numberOfAnnotations-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: "# Of Img",
      accessor: "numberOfImages",
      id: "numberOfImages-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => row[filter.id] >= filter.value,
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "numberOfImages-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: "# Of Series",
      accessor: "numberOfSeries",
      id: "numberOfSeries-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => row[filter.id] >= filter.value,
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "numberOfSeries-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: "Created Time",
      accessor: "createdTime",
      id: "createdTime-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, "date"),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "createdTime-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return <div>{formatTime(row.original.createdTime)}</div>;
      }
    },
    {
      Header: "Birth date",
      accessor: "birthdate",
      id: "birthdate-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, "date"),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "birthdate-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return <div>{formatDate(row.original.birthdate)}</div>;
      }
    },
    // {
    //   Header: "First Series Date Acquired",
    //   accessor: "firstSeriesDateAcquired",
    //   id: "firstSeriesDateAcquired-id",
    //   resizable: true,
    //   sortable: true,
    //   show: true,
    //   filterMethod: (filter, row) => filterDateAndTime(filter, row, "date"),
    //   getProps: (state, rowInfo) => ({
    //     style: {
    //       backgroundColor:
    //         sortedCol === "firstSeriesDateAcquired-id" ? "#3a3f44" : null,
    //     },
    //   }),
    //   Cell: (row) => {
    //     return <div>{formatDate(row.original.firstSeriesDateAcquired)}</div>;
    //   },
    // },
    // {
    //   Header: "First Series UID",
    //   accessor: "firstSeriesUID",
    //   id: "firstSeriesUID-id",
    //   resizable: true,
    //   sortable: true,
    //   show: true,
    //   filterMethod: (filter, row) => filterString(filter, row),
    //   getProps: (state, rowInfo) => ({
    //     style: {
    //       backgroundColor: sortedCol === "firstSeriesUID-id" ? "#3a3f44" : null,
    //     },
    //   }),
    // },
    // {
    //   Header: "Physician Name",
    //   accessor: "physicianName",
    //   id: "physicianName-id",
    //   resizable: true,
    //   sortable: true,
    //   show: true,
    //   filterMethod: (filter, row) => filterString(filter, row),
    //   getProps: (state, rowInfo) => ({
    //     style: {
    //       backgroundColor: sortedCol === "physicianName-id" ? "#3a3f44" : null,
    //     },
    //   }),
    // },
    {
      Header: "Project ID",
      accessor: "projectID",
      id: "projectID-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "projectID-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: "Referring Physician Name",
      accessor: "referringPhysicianName",
      id: "referringPhysicianName-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor:
            sortedCol === "referringPhysicianName-id" ? "#3a3f44" : null
        }
      })
    },
    {
      Header: `Study Accession Number`,
      accessor: "studyAccessionNumber",
      id: "studyAccessionNumber-id",
      resizable: true,
      sortable: true,
      show: true,
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor:
            sortedCol === "studyAccessionNumber-id" ? "#3a3f44" : null
        }
      }),
      filterMethod: (filter, row) => filterString(filter, row)
    },
    {
      Header: "Study ID",
      accessor: "studyID",
      id: "studyID-id",
      resizable: true,
      sortable: true,
      show: true,
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "studyID-id" ? "#3a3f44" : null
        }
      }),
      filterMethod: (filter, row) => filterString(filter, row)
    }
  ];

  const onSortedChange = (newSorted, column, shiftKey) => {
    setSortedCol(newSorted[0].id);
    setSortOrder(newSorted[0].desc);
  };

  return (
    <ReactTable
      data={data}
      filterable
      sortable={true}
      defaultFilterMethod={(filter, row) => filterString(filter, row)}
      NoDataComponent={() => null}
      className="table table-dark table-striped table-hover title-case"
      columns={defineColumns()}
      showPagination={false}
      pageSize={data.length}
      onSortedChange={newSorted => {
        onSortedChange(newSorted);
      }}
      getTheadThProps={getTheadThProps}
      getTdProps={(state, rowInfo, column) => ({
        onDoubleClick: e => {
          const { projectID, patientID, studyUID } = rowInfo.original;
          displaySeries(projectID, patientID, studyUID);
        }
      })}
    />
  );
};

export default StudyTable;
