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

const nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

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

  const filterExam = (filter, row) => {
    try {
      const keyLowercase = filter.value.toLowerCase();
      const keyUppercase = filter.value.toUpperCase();
      const str = Array.isArray(row[filter.id]) ? row[filter.id].join() : row[filter.id];
      return (
        str.includes(keyLowercase) ||
        str.includes(keyUppercase)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const filterStringIncludes = (filter, row) => {
    try {
      const keyLowercase = filter.value.toLowerCase();
      const keyUppercase = filter.value.toUpperCase();
      return (
        row[filter.id].includes(keyLowercase) ||
        row[filter.id].includes(keyUppercase)
      );
    } catch (err) {
      console.error(err);
    }
  }

  const filterStartsWith = (filter, row) => {
    try {
      const keyLowercase = filter.value.toLowerCase();
      const keyUppercase = filter.value.toUpperCase();
      let data = row[filter.id];
      data = typeof data === 'number' ? '' + data : data;
      return (
        data.startsWith(keyLowercase) ||
        data.startsWith(keyUppercase)
      );
    } catch (err) {
      console.error(err);
    }
  }

  const filterMatch = (filter, row) => {
    try {
      const keyLowercase = filter.value.toLowerCase();
      const keyUppercase = filter.value.toUpperCase();
      return (row[filter.id] === keyLowercase || row[filter.id] === keyUppercase);
    } catch (err) {
      console.error(err);
    }
  }

  const filterDateAndTime = (filter, row) => {
    try {
      const val = filter.value.split('').reduce((all, item) => nums.includes(item)? all += item : all += '', '');
      return row[filter.id] ? row[filter.id].includes(val) || row[filter.id].includes(filter.value) : false; 
    } catch (err) {
      console.error(err);
    }
  }

  const columns = [
    {
      Header: "Exam",
      accessor: "examTypes",
      id: "examTypes-id",
      resizable: true,
      sortable: false,
      show: true,
      filterMethod: (filter, row) => filterExam(filter, row),
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
      filterMethod: (filter, row) => filterStringIncludes(filter, row),
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
      filterMethod: (filter, row) => filterStartsWith(filter, row),
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
      filterMethod: (filter, row) => filterMatch(filter, row),
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
      filterMethod: (filter, row) => filterStringIncludes(filter, row),
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
      filterMethod: (filter, row) => filterDateAndTime(filter, row),
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
      filterMethod: (filter, row) => filterDateAndTime(filter, row),
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
      filterMethod: (filter, row) => filterStringIncludes(filter, row),
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
      filterMethod: (filter, row) => filterStartsWith(filter, row),
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
      filterMethod: (filter, row) => filterStartsWith(filter, row),
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
      filterMethod: (filter, row) => filterStartsWith(filter, row),
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
      filterMethod: (filter, row) => filterDateAndTime(filter, row),
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
      filterMethod: (filter, row) => filterDateAndTime(filter, row),
      getProps: (state, rowInfo) => ({
        style: {
          backgroundColor: sortedCol === "birthdate-id" ? "#3a3f44" : null
        }
      }),
      Cell: row => {
        return <div>{formatDate(row.original.birthdate)}</div>;
      }
    },
    {
      Header: "Project ID",
      accessor: "projectID",
      id: "projectID-id",
      resizable: true,
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterStringIncludes(filter, row),
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
      filterMethod: (filter, row) => filterStringIncludes(filter, row),
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
      filterMethod: (filter, row) => filterStartsWith(filter, row),
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
      filterMethod: (filter, row) => filterStringIncludes(filter, row)
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
      defaultFilterMethod={(filter, row) => filterStartsWith(filter, row)}
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
