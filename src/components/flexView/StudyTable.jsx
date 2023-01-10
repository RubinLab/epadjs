import React, { useState } from "react";
import ReactTable from "react-table-v6";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai';
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
    return {
      style: {
        boxShadow,
        background
      }
    };
    // return { className: 'select_row', style: { color: '#eaddb2' } };
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

  const returnHeader = (header, id) => {
    const headerParts = [];
    headerParts.push(<span>{header}</span>)
    if (sortedCol === id) {
      if (sortOrder)
        headerParts.push(<AiOutlineSortDescending style={{ fontSize: '1.5em' }} />)
      else   
        headerParts.push(<AiOutlineSortAscending style={{ fontSize: '1.5em' }} />)
    } 
    return <>{headerParts}</>
  }

  const columns = [
    {
      // Header: "Exam",
      Header: () => returnHeader('Exam', 'examTypes-id'),
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
      // Header: () => <span>Patient Name</span>,
      Header: () => returnHeader('Patient Name', 'patientName-id'),
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
      // Header: "PatientID",
      Header: () => returnHeader('PatientID', 'patientID-id'),
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
      // Header: "Sex",
      Header: () => returnHeader('Sex', 'sex-id'),
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
      // Header: "Description",
      Header: () => returnHeader('Description', 'studyDescription-id'),
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
    // {
    //   Header: "Insert Date",
    //   accessor: "insertDate",
    //   id: "insertDate-id",
    //   resizable: true,
    //   sortable: true,
    //   show: true,
    //   filterMethod: (filter, row) => filterDateAndTime(filter, row),
    //   getProps: (state, rowInfo) => ({
    //     style: {
    //       backgroundColor: sortedCol === "insertDate-id" ? "#3a3f44" : null
    //     }
    //   }),
    //   Cell: row => {
    //     return <div>{formatDate(row.original.insertDate)}</div>;
    //   }
    // },
    {
      // Header: "Study Date",
      Header: () => returnHeader('Study Date', 'studyDate-id'),
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
      // Header: "Study Time",
      Header: () => returnHeader('Study Time', 'studyTime-id'),
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
      // Header: "Study UID",
      Header: () => returnHeader('Study UID', 'studyUID-id'),
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
      // Header: "# of Aims",
      Header: () => returnHeader('# of Aims', 'numberOfAnnotations-id'),
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
      // Header: "# Of Img",
      Header: () => returnHeader('# of Img', 'numberOfImages-id'),
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
      // Header: "# Of Series",
      Header: () => returnHeader('# of Series', 'numberOfSeries-id'),
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
      // Header: "Created Time",
      Header: () => returnHeader('Created Time', 'createdTime-id'),
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
    },
    {
      // Header: "Birth date",
      Header: () => returnHeader('Birth date', 'birthdate-id'),
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
      // Header: "Project ID",
      Header: () => returnHeader('Project ID', 'projectID-id'),
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
      // Header: "Referring Physician Name",
      Header: () => returnHeader('Referring Physician Name', 'referringPhysicianName-id'),
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
      // Header: `Study Accession Number`,
      Header: () => returnHeader('Study Accession Number', 'studyAccessionNumber-id'),
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
      // Header: "Study ID",
      Header: () => returnHeader('Study ID', 'studyID-id'),
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
