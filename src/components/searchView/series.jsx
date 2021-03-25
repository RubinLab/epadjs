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

function Table({
  columns,
  data,
  studyDescription,
  expandLevel,
  patientIndex,
  getTreeExpandAll,
  getTreeExpandSingle,
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
    useExpanded // Use the useExpanded plugin hook
  );

  useEffect(() => {
    const obj = {
      patient: patientIndex,
      study: studyIndex,
      series: data.length
    };

    if (expandLevel === 3) {
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
            const isExpandedFromToolbar =
              treeExpand[patientIndex] && treeExpand[patientIndex][studyIndex]
                ? treeExpand[patientIndex][studyIndex][row.index]
                : false;
            const rowExpanded =
              row.isExpanded || isExpandedFromToolbar || expandLevel === 4;
            const style = { height: '2.5rem', background: '#30343b' };
            // style.background = i % 2 === 0 ? '#3a1a19' : '#281211';
            return (
              <>
                <tr {...row.getRowProps()} style={style}>
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
  const [loading, setLoading] = useState(false);
  const [warningSeen, setWarningSeen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(false);

  useEffect(() => {
    const { selectedPatients, selectedStudies, selectedAnnotations } = props;
    const patients = Object.values(selectedPatients);
    const studies = Object.values(selectedStudies);
    const annotations = Object.values(selectedAnnotations);

    if (patients.length) setSelectedLevel('patients');
    else if (studies.length) setSelectedLevel('studies');
    else if (annotations.length) setSelectedLevel('annotations');
    else setSelectedLevel('');
  }, [
    props.selectedStudies,
    props.selectedPatients,
    props.selectedAnnotations
  ]);

  const validateSeriesSelect = () => {
    if (selectedLevel && !warningSeen) {
      const message = `There are already selected ${selectedLevel}. Please deselect those if you want to select series!`;
      window.alert(message);
      setWarningSeen(true);
    }
  };

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
        Cell: ({ row, toggleRowExpanded }) => {
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          const style = {
            display: 'flex',
            width: 'fit-content',
            paddingLeft: '20px'
          };

          return (
            <div style={style} className="tree-combinedCell">
              <div onMousEnter={validateSeriesSelect}>
                <input
                  type="checkbox"
                  style={{ marginRight: '5px' }}
                  disabled={selectedLevel}
                  onClick={() => {
                    props.dispatch(clearSelection('serie'));
                    props.dispatch(selectSerie(row.original));
                  }}
                />
              </div>
              <span
                {...row.getToggleRowExpandedProps({
                  style: {
                    cursor: 'pointer',
                    fontSize: 10,
                    textAlign: 'center',
                    userSelect: 'none',
                    color: '#fafafa',
                    // paddingLeft: '14px',
                    // padding: '7px 5px',
                    verticalAlign: 'middle'
                  }
                })}
                onClick={() => {
                  const expandStatus = row.isExpanded ? false : true;
                  const obj = {
                    patient: props.patientIndex,
                    study: props.studyIndex,
                    series: { [row.index]: expandStatus ? {} : false }
                  };
                  toggleRowExpanded(row.id, expandStatus);
                  props.getTreeExpandSingle(obj);
                }}
              >
                {row.isExpanded ? <span>&#x25BC;</span> : <span>&#x25B6;</span>}
              </span>
            </div>
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
                style={{ paddingLeft: '20px' }}
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
        id: 'numberOfAnnotations',
        Cell: ({ row }) => (
          <div className="searchView-table__cell">
            {row.original.numberOfAnnotations === 0 ? (
              ''
            ) : (
              <span className="badge badge-secondary">
                {row.original.numberOfAnnotations}
              </span>
            )}
          </div>
        )
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
    [selectedLevel, warningSeen]
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
        studyDescription={props.studyDescription}
        expandLevel={props.expandLevel}
        patientIndex={props.patientIndex}
        getTreeExpandAll={props.getTreeExpandAll}
        treeExpand={props.treeExpand}
        studyIndex={props.studyIndex}
        getTreeExpandSingle={props.getTreeExpandSingle}
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
