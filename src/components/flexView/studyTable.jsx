import React from 'react';
import ReactTable from 'react-table';
import {
  clearCarets,
  formatTime,
  formatDate,
  reverseCarets,
} from './helperMethods';

const studyTable = ({ data, order }) => {
  const defineColumns = () => {
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(columns[item]);
    }
    return tableColumns;
  };

  const filterString = (filter, row) => {
    try {
      const attrWithCarets = ['studyDescription', 'patientName'];
      const { id, value } = filter;
      const valueLowercase = row[id].toLowerCase();
      const keyLowercaseControlled = attrWithCarets.includes(id)
        ? reverseCarets(value).toLowerCase()
        : value.toLowerCase();

      const keyLowercase = value.toLowerCase();
      return (
        valueLowercase.startsWith(keyLowercaseControlled) ||
        valueLowercase.startsWith(keyLowercase)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const filterDateAndTime = (filter, row, type) => {
    try {
      const formattedKey =
        type === 'date'
          ? filter.value.split('-').join('')
          : filter.value.split(':').join('');
      return row[filter.id].startsWith(formattedKey);
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
      Header: 'Exam',
      accessor: 'examTypes',
      sortable: false,
      show: true,
      filterMethod: (filter, row) => filterArray(filter, row),
      Cell: row => {
        return Array.isArray(row.original.examTypes) ? (
          <div>{row.original.examTypes.join(', ')}</div>
        ) : (
          <div>{row.original.examType}</div>
        );
      },
    },
    {
      Header: 'Patient Name',
      accessor: 'patientName',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      Cell: row => {
        return <div>{clearCarets(row.original.patientName)}</div>;
      },
    },
    {
      Header: 'PatientID',
      accessor: 'patientID',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: 'Sex',
      accessor: 'sex',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: 'Description',
      accessor: 'studyDescription',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
      Cell: row => {
        let desc = row.original.studyDescription
          ? row.original.studyDescription
          : 'Unnamed Study';
        return <div>{clearCarets(desc)}</div>;
      },
    },
    {
      Header: 'Insert Date',
      accessor: 'insertDate',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, 'date'),
      Cell: row => {
        return <div>{formatDate(row.original.insertDate)}</div>;
      },
    },
    {
      Header: 'Study Date',
      accessor: 'studyDate',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, 'date'),
      Cell: row => {
        return <div>{formatDate(row.original.studyDate)}</div>;
      },
    },
    {
      Header: 'Study Time',
      accessor: 'studyTime',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, 'time'),
      Cell: row => {
        return <div>{formatTime(row.original.studyTime)}</div>;
      },
    },
    {
      Header: 'Study UID',
      accessor: 'studyUID',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: '# of Aims',
      accessor: 'numberOfAnnotations',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => row[filter.id] >= filter.value,
    },
    {
      Header: '# Of Img',
      accessor: 'numberOfImages',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => row[filter.id] >= filter.value,
    },
    {
      Header: '# Of Series',
      accessor: 'numberOfSeries',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => row[filter.id] >= filter.value,
    },
    {
      Header: 'created Time',
      accessor: 'createdTime',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, 'date'),
      Cell: row => {
        return <div>{formatTime(row.original.createdTime)}</div>;
      },
    },
    {
      Header: 'birth date',
      accessor: 'birthdate',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, 'date'),
      Cell: row => {
        return <div>{formatDate(row.original.birthdate)}</div>;
      },
    },
    {
      Header: 'First Series Date Acquired',
      accessor: 'firstSeriesDateAcquired',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterDateAndTime(filter, row, 'date'),
      Cell: row => {
        return <div>{formatDate(row.original.firstSeriesDateAcquired)}</div>;
      },
    },
    {
      Header: 'First Series UID',
      accessor: 'firstSeriesUID',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: 'Physician Name',
      accessor: 'physicianName',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: 'Project ID',
      accessor: 'projectID',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: 'Referring Physician Name',
      accessor: 'referringPhysicianName',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: 'Study Accession Number',
      accessor: 'studyAccessionNumber',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
    {
      Header: 'studyID',
      accessor: 'studyID',
      sortable: true,
      show: true,
      filterMethod: (filter, row) => filterString(filter, row),
    },
  ];

  const onSortedChange = () => {
    const { expanded } = this.state;
    for (let subject in expanded) {
      expanded[subject] = false;
    }
    this.setState({ expanded });
  };

  return (
    <ReactTable
      data={data}
      filterable
      defaultFilterMethod={(filter, row) => filterString(filter, row)}
      NoDataComponent={() => null}
      className="flexView-table"
      columns={defineColumns()}
      showPagination={false}
      pageSize={data.length}
      onSortedChange={() => {
        onSortedChange();
      }}
    />
  );
};

export default studyTable;
