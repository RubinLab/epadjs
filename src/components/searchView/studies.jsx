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
import { getStudies } from '../../services/studyServices';
import Series from './Series';
import { formatDate } from '../flexView/helperMethods';
import { getSeries } from '../../services/seriesServices';
import { clearCarets, styleEightDigitDate } from '../../Utils/aid.js';
import { MAX_PORT, widthUnit, formatDates } from '../../constants';

import {
  getSingleSerie,
  selectStudy,
  clearSelection,
  startLoading,
  loadCompleted,
  annotationsLoadingError,
  addToGrid,
  getWholeData,
  alertViewPortFull,
  updatePatient
} from '../annotationsList/action';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;
    const [checked, setChecked] = useState(false);
    const [status, setStatus] = useState(false);

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
  getTreeData,
  selectRow,
  expandLevel,
  patientIndex,
  getTreeExpandAll,
  getTreeExpandSingle,
  treeExpand
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
          id: 'studies-selection',
          Cell: ({ row }) => (
            <div style={{ paddingLeft: '12px' }}>
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
    const obj = { patient: patientIndex, study: data.length };
    if (expandLevel === 2) {
      toggleAllRowsExpanded(true);
      getTreeExpandAll(obj, true, expandLevel);
    }
    if (expandLevel === 1) {
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
            const isExpandedFromToolbar = treeExpand[patientIndex]
              ? treeExpand[patientIndex][row.index]
              : false;
            const expandRow = row.isExpanded || isExpandedFromToolbar;
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
                {expandRow && (
                  <Series
                    pid={row.original.projectID}
                    subjectID={row.original.patientID}
                    studyUID={row.original.studyUID}
                    getTreeData={getTreeData}
                    studyDescription={row.original.studyDescription}
                    expandLevel={expandLevel}
                    patientIndex={row.index}
                    getTreeExpandAll={getTreeExpandAll}
                    treeExpand={treeExpand}
                    studyIndex={row.index}
                    getTreeExpandSingle={getTreeExpandSingle}

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

function Studies(props) {
  const widthUnit = 20;

  const [data, setData] = useState([]);
  let [loading, setLoading] = useState(false);

  const excludeOpenSeries = allSeriesArr => {
    const result = [];
    //get all series number in an array
    const idArr = props.openSeries.reduce((all, item, index) => {
      all.push(item.seriesUID);
      return all;
    }, []);
    //if array doesnot include that serie number
    allSeriesArr.forEach(serie => {
      if (!idArr.includes(serie.seriesUID)) {
        //push that serie in the result arr
        result.push(serie);
      }
    });
    return result;
  };

  const getSeriesData = async selected => {
    props.dispatch(startLoading());
    const { projectID, patientID, studyUID } = selected;
    try {
      const { data: series } = await getSeries(projectID, patientID, studyUID);
      props.dispatch(loadCompleted());
      return series;
    } catch (err) {
      props.dispatch(annotationsLoadingError(err));
    }
  };

  const displaySeries = async selected => {
    if (props.openSeries.length === MAX_PORT) {
      props.dispatch(alertViewPortFull());
    } else {
      const { patientID, studyUID } = selected;
      let seriesArr = [];
      //check if the patient is there (create a patient exist flag)
      const patientExists = props.patients[patientID];
      //if there is patient iterate over the series object of the study (form an array of series)
      if (patientExists) {
        seriesArr = Object.values(
          props.patients[patientID].studies[studyUID].series
        );
        //if there is not a patient get series data of the study and (form an array of series)
      } else {
        seriesArr = await getSeriesData(selected);
      }
      //get extraction of the series (extract unopen series)
      if (seriesArr.length > 0) seriesArr = excludeOpenSeries(seriesArr);
      //check if there is enough room
      if (seriesArr.length + props.openSeries.length > MAX_PORT) {
        //if there is not bring the modal
        await setState({
          isSerieSelectionOpen: true,
          selectedStudy: [seriesArr],
          studyName: selected.studyDescription
        });
      } else {
        //if there is enough room
        //add serie to the grid
        const promiseArr = [];
        for (let serie of seriesArr) {
          props.dispatch(addToGrid(serie));
          promiseArr.push(props.dispatch(getSingleSerie(serie)));
        }
        //getsingleSerie
        Promise.all(promiseArr)
          .then(() => {})
          .catch(err => console.error(err));

        //if patient doesnot exist get patient
        if (!patientExists) {
          // props.dispatch(getWholeData(null, selected));
          getWholeData(null, selected);
        } else {
          //check if study exist
          props.dispatch(updatePatient('study', true, patientID, studyUID));
        }
        props.history.push('/display');
      }
      props.dispatch(clearSelection());
    }
  };

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'studies-expander', // Make sure it has an ID
        width: 35,
        Cell: ({ row, toggleRowExpanded }) => {
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
              onClick={() => {
                const expandStatus = row.isExpanded ? false : true;
                const obj = {
                  patient: props.patientIndex,
                  study: { [row.index]: expandStatus ? {} : false }
                };
                toggleRowExpanded(row.id, expandStatus);
                props.getTreeExpandSingle(obj);
              }}
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
          let desc = clearCarets(row.original.studyDescription);
          desc = desc || 'Unnamed Study';
          const id = 'desc' + row.original.studyUID;
          return (
            <>
              <span
                data-tip
                data-for={id}
                className="searchView-row__desc"
                onDoubleClick={() => displaySeries(row.original)}
              >
                {desc}
              </span>
              <ReactTooltip
                id={id}
                place="right"
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
        width: widthUnit * 3,
        accessor: 'numberOfSeries'
      },
      {
        width: widthUnit * 3,
        accessor: 'numberOfImages' || ''
      },
      {
        //Header: "Type",
        width: widthUnit * 5,
        id: 'study-examtype',
        Cell: ({ row }) => (
          <span className="searchView-table__cell">
            {row.original.examTypes.join('/')}
          </span>
        )
      },
      {
        //Header: "Study/Created Date",
        width: widthUnit * 7,
        id: 'study-insert-time',
        Cell: ({ row }) => (
          <span className="searchView-table__cell">
            {styleEightDigitDate(row.original.insertDate)}
          </span>
        )
      },
      {
        //Header: "Uploaded",
        width: widthUnit * 7,
        id: 'study-created-time',
        Cell: ({ row }) => (
          <span className="searchView-table__cell">
            {styleEightDigitDate(row.original.createdTime)}
          </span>
        )
      },
      {
        //Header: "Accession",
        width: widthUnit * 6,
        id: 'studyAccessionNumber',
        Cell: ({ row }) => (
          <>
            <span
              className="searchView-table__cell"
              data-tip
              data-for={row.original.studyAccessionNumber}
            >
              {row.original.studyAccessionNumber}
            </span>
            <ReactTooltip
              id={row.original.studyAccessionNumber}
              place="right"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.studyAccessionNumber}</span>
            </ReactTooltip>
          </>
        )
      },
      {
        //Header: "Identifier",
        width: widthUnit * 10,
        id: 'studyUID',
        Cell: ({ row }) => (
          <>
            <span data-tip data-for={row.original.studyUID}>
              {row.original.studyUID}
            </span>{' '}
            <ReactTooltip
              id={row.original.studyUID}
              place="top"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.studyUID}</span>
            </ReactTooltip>
          </>
        )
      }
    ],
    []
  );

  const getDataFromStorage = (projectID, subjectID) => {
    const treeData = JSON.parse(localStorage.getItem('treeData'));
    const studiesArray =
      treeData[projectID] && treeData[projectID][subjectID]
        ? Object.values(treeData[projectID][subjectID].studies).map(
            el => el.data
          )
        : [];

    return studiesArray;
  };

  useEffect(() => {
    const { pid, subjectID, getTreeData } = props;
    const dataFromStorage = getDataFromStorage(pid, subjectID);
    let data = [];
    if (pid && pid !== 'null' && subjectID) {
      if (dataFromStorage?.length > 0) {
        data = dataFromStorage;
        setData(data);
      } else {
        setLoading(true);
        getStudies(pid, subjectID)
          .then(res => {
            setLoading(false);
            getTreeData(pid, 'studies', res.data);
            setData(res.data);
          })
          .catch(err => {
            console.error(err);
          });
      }
    }
  }, []);

  const selectRow = (data, checked) => {
    props.dispatch(clearSelection('study'));
    props.dispatch(selectStudy(data));
  };

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
        getTreeData={props.getTreeData}
        selectRow={selectRow}
        expandLevel={props.expandLevel}
        patientIndex={props.patientIndex}
        getTreeExpandAll={props.getTreeExpandAll}
        treeExpand={props.treeExpand}
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

export default withRouter(connect(mapStateToProps)(Studies));
