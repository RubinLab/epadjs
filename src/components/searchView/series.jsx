import React, { useEffect, useState, useCallback } from 'react';
import {
  useTable,
  useExpanded,
  useRowSelect,
  usePagination
} from 'react-table';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import PropagateLoader from 'react-spinners/PropagateLoader';
// import "react-table-v6/react-table.css";
import { MAX_PORT, formatDates } from '../../constants';
import Annotations from './Annotations';
import { getSeries } from '../../services/seriesServices';
import {
  alertViewPortFull,
  getSingleSerie,
  changeActivePort,
  selectSerie,
  clearSelection,
  addToGrid,
  getWholeData,
  updatePatient
} from '../annotationsList/action';
import { clearCarets, styleEightDigitDate } from '../../Utils/aid.js';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;
    const [checked, setChecked] = useState(false);

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    const handleSelect = e => {
      const { selectRow, data } = rest;
      setChecked(e.target.checked);
      selectRow(data);
    };

    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          onChange={handleSelect}
          checked={checked}
        />
      </>
    );
  }
);

function Table({
  columns,
  data,
  selectRow,
  studyDescription,
  expandLevel,
  patientIndex,
  getTreeExpandAll,
  treeExpand,
  studyIndex
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    toggleAllRowsExpanded,
    state: { expanded }
  } = useTable(
    {
      columns,
      data
    },
    useExpanded, // Use the useExpanded plugin hook
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        // Let's make a column for selection
        {
          id: 'series-selection',
          Cell: ({ row }) => (
            <div style={{ paddingLeft: '24px' }}>
              <IndeterminateCheckbox
                {...row.getToggleRowSelectedProps()}
                data={row.original}
                selectRow={selectRow}
              />
            </div>
          )
        },
        ...columns
      ]);
    }
  );

  useEffect(() => {
    const obj = {
      patient: patientIndex,
      study: studyIndex,
      series: data.length
    };

    if (expandLevel === 3 ) {
      toggleAllRowsExpanded(true);
      getTreeExpandAll(obj, true, expandLevel);
    }
    if (expandLevel === 2) {
      toggleAllRowsExpanded(false);
      getTreeExpandAll(obj, false, expandLevel);
    }
  }, [expandLevel]);

  return (
    <>
      {data.length > 0 && (
        <>
          {rows.map((row, i) => {
            prepareRow(row);
            const rowExpanded =
              row.isExpanded || treeExpand[patientIndex][studyIndex][row.index] || expandLevel === 4;
            return (
              <>
                <tr
                  {...row.getRowProps()}
                  // style={{ position: 'relative', left: '60px', zIndex: '1' }}
                >
                  {row.cells.map(cell => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    );
                  })}
                </tr>
                {rowExpanded && (
                  <Annotations
                    parentSeries={row.original}
                    studyDescription={studyDescription}
                    expandLevel={expandLevel}
                  />
                )}
              </>
            );
          })}
        </>
      )}
    </>
  );
}

function Series(props) {
  const widthUnit = 20;
  const [data, setData] = useState([]);
  let [loading, setLoading] = useState(false);

  const dispatchSerieDisplay = selected => {
    const openSeries = Object.values(props.openSeries);
    const { patientID, studyUID } = selected;
    let isSerieOpen = false;

    //check if there is enough space in the grid
    let isGridFull = openSeries.length === MAX_PORT;
    //check if the serie is already open

    if (openSeries.length > 0) {
      for (let i = 0; i < openSeries.length; i++) {
        if (openSeries[i].seriesUID === selected.seriesUID) {
          isSerieOpen = true;
          props.dispatch(changeActivePort(i));
          break;
        }
        // }
      }
    }

    //serie is not already open;
    if (!isSerieOpen) {
      //if the grid is full show warning
      if (isGridFull) {
        // setState({ showGridFullWarning: true });
        props.dispatch(alertViewPortFull());
      } else {
        props.dispatch(addToGrid(selected));
        props
          .dispatch(getSingleSerie(selected))
          .then(() => {})
          .catch(err => console.error(err));
        //if grid is NOT full check if patient data exists
        if (!props.patients[selected.patientID]) {
          // props.dispatch(getWholeData(selected));
          getWholeData(selected);
        } else {
          props.dispatch(
            updatePatient(
              'serie',
              true,
              patientID,
              studyUID,
              selected.seriesUID
            )
          );
        }
        props.history.push('/display');
      }
    }
    props.dispatch(clearSelection());
  };

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'series-expander', // Make sure it has an ID
        width: 35,
        Cell: ({ row }) => {
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          return (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  cursor: 'pointer',
                  fontSize: 10,
                  textAlign: 'center',
                  userSelect: 'none',
                  color: '#fafafa',
                  padding: '7px 5px',
                  verticalAlign: 'middle'
                }
              })}
            >
              {row.isExpanded ? <span>&#x25BC;</span> : <span>&#x25B6;</span>}
            </span>
          );
        }
      },
      {
        // Header: (
        //   <div className="search-header__col--left">Description/Name</div>
        // ),
        width: widthUnit * 12,
        id: 'study-desc',
        // resizable: true,
        // sortable: true,
        Cell: ({ row }) => {
          let desc = row.original.seriesDescription || 'Unnamed Series';
          let id = 'desc' + row.original.seriesUID;
          return (
            <>
              <span
                data-tip
                data-for={id}
                className="searchView-row__desc"
                onDoubleClick={() => dispatchSerieDisplay(row.original)}
              >
                {desc}
              </span>
              <ReactTooltip
                id={id}
                place="top"
                type="info"
                delayShow={500}
                clickable={true}
              >
                <span>{desc}</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        width: widthUnit * 2,
        accessor: 'numberOfAnnotations'
      },
      {
        //subitem
        width: widthUnit * 3,
        id: 'series-subitem',
        Cell: () => <div />
      },
      {
        width: widthUnit * 3,
        accessor: 'numberOfImages'
      },
      {
        width: widthUnit * 5,
        id: 'series-examtype',
        Cell: ({ row }) => (
          <span className="searchView-table__cell">
            {row.original.examType}
          </span>
        )
      },
      {
        width: widthUnit * 7,
        // Header: "Study/Created Date",
        id: 'series-seriesDate',
        Cell: ({ row }) => (
          <div className="searchView-table__cell">
            {formatDates(row.original.seriesDate)}
          </div>
        )
      },
      {
        width: widthUnit * 7,
        // Header: "Uploaded",
        id: 'series-createdTime',
        Cell: ({ row }) => (
          <div className="searchView-table__cell">
            {formatDates(row.original.createdTime)}
          </div>
        )
      },
      {
        Header: 'Accession',
        width: widthUnit * 6,
        Cell: ({ row }) => (
          <div className="searchView-table__cell">
            {row.original.accessionNumber}
          </div>
        )
      },
      {
        // Header: "Identifier",
        width: widthUnit * 10,
        id: 'seriesUID',
        Cell: ({ row }) => (
          <>
            <div
              className="searchView-table__cell"
              data-tip
              data-for={row.original.seriesUID}
            >
              {row.original.seriesUID}
            </div>{' '}
            <ReactTooltip
              id={row.original.seriesUID}
              place="top"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.seriesUID}</span>
            </ReactTooltip>
          </>
        )
      }
    ],
    []
  );

  const getDataFromStorage = (projectID, subjectID, studyUID) => {
    const treeData = JSON.parse(localStorage.getItem('treeData'));
    const project = treeData[projectID];
    const patient = project && project[subjectID] ? project[subjectID] : null;
    const study =
      patient && patient.studies[studyUID] ? patient.studies[studyUID] : null;
    const seriesArray = study
      ? Object.values(study.series).map(el => el.data)
      : [];

    return seriesArray;
  };

  const selectRow = data => {
    props.dispatch(clearSelection('serie'));
    props.dispatch(selectSerie(data));
  };

  useEffect(() => {
    const { pid, subjectID, studyUID, getTreeData } = props;
    const dataFromStorage = getDataFromStorage(pid, subjectID, studyUID);
    let data = [];
    if (pid && pid !== 'null' && subjectID) {
      if (dataFromStorage?.length > 0) {
        data = dataFromStorage;
        setData(data);
      } else {
        setLoading(true);
        getSeries(pid, subjectID, studyUID)
          .then(res => {
            setLoading(false);
            getTreeData(pid, 'series', res.data);
            setData(res.data);
          })
          .catch(err => {
            console.error(err);
          });
      }
    }
  }, []);

  return (
    <>
      {loading && (
        <tr style={{ width: 'fit-content', margin: 'auto', marginTop: '10%' }}>
          <PropagateLoader color={'#7A8288'} loading={loading} margin={8} />
        </tr>
      )}
      <Table
        columns={columns}
        data={data}
        selectRow={selectRow}
        studyDescription={props.studyDescription}
        expandLevel={props.expandLevel}
        patientIndex={props.patientIndex}
        getTreeExpandAll={props.getTreeExpandAll}
        treeExpand={props.treeExpand}
        studyIndex={props.studyIndex}
      />
    </>
  );
}

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients
  };
};

export default withRouter(connect(mapStateToProps)(Series));
