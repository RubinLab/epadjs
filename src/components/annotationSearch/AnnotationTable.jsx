import React, { useEffect, useState, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { useTable, usePagination, useRowSelect } from 'react-table';
import { Link } from 'react-router-dom';
import { FaRegEye } from 'react-icons/fa';
import { clearCarets, convertDateFormat } from '../../Utils/aid.js';
import { MAX_PORT } from '../../constants';
import {
  changeActivePort,
  jumpToAim,
  alertViewPortFull,
  addToGrid,
  getSingleSerie,
  getWholeData,
  updatePatient,
  startLoading,
  loadCompleted,
  annotationsLoadingError
} from '../annotationsList/action';
import { getSeries } from '../../services/seriesServices';

const defaultPageSize = 200;

function Table({
  columns,
  data,
  selected,
  updateSelectedAims,
  pageCount,
  noOfRows,
  fetchData
}) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canNextPage,
    selectedFlatRows,
    canPreviousPage,
    nextPage,
    previousPage,
    setPageSize,
    toggleAllRowsExpanded,
    state: { selectedRowIds, expanded, pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: defaultPageSize
      },
      manualPagination: true,
      pageCount
    },
    usePagination,
    useRowSelect
  );

  React.useEffect(() => {
    fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);

  return (
    <>
      <table {...getTableProps()} style={{ width: '100%' }}>
        <thead
          style={{
            color: 'aliceblue',
            fontSize: '1.1rem',
            background: '#575C62'
          }}
        >
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} style={{ padding: '0.5rem' }}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        margin: '0',
                        padding: '0.8rem 0.4rem',
                        borderBottom: '0.2px solid #6c757d'
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {noOfRows / 200 > 1 && (
            <tr>
              <td colSpan="10000">
                Showing {defaultPageSize * pageIndex}-
                {defaultPageSize * (pageIndex + 1)} of ~{pageCount * pageSize}{' '}
                results
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {pageCount > 1 && (
        <div className="pagination">
          <button
            onClick={() => {
              previousPage();
            }}
            disabled={!canPreviousPage}
          >
            {'<'}
          </button>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[200].map((pageSize, i) => (
              <option key={`${pageSize}-${i}`} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              nextPage();
            }}
            disabled={!canNextPage}
          >
            {'>'}
          </button>
        </div>
      )}
    </>
  );
}

const formatDate = dateString => {
  try {
    const dateArr = dateString.split('-');
    dateArr[0] = dateArr[0].substring(2);
    dateArr[1] = dateArr[1][0] === '0' ? dateArr[1][1] : dateArr[1];
    dateArr[2] = dateArr[2][0] === '0' ? dateArr[2][1] : dateArr[2];
    return dateArr[1] + '/' + dateArr[2] + '/' + dateArr[0];
  } catch (err) {
    console.error(err);
  }
};

function AnnotationTable(props) {
  const [pageCount, setPageCount] = useState(0);
  const [prevPageIndex, setPrevPageIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [data, setData] = useState([]);

  // Render the UI for your table
  const preparePageData = (rawData, pageSize = 200, pageIndex = 0) => {
    let pageData = [];
    setPageCount(Math.ceil(props.noOfRows / pageSize));
    const startIndex = pageSize * pageIndex;
    const endIndex = pageSize * (pageIndex + 1);
    rawData.forEach((el, i) => {
      if (i >= startIndex && i < endIndex) {
        el.data ? pageData.push(el.data) : pageData.push(el);
      }
    });
    setData(pageData);
  };

  useEffect(() => {
    preparePageData(props.data, defaultPageSize, currentPageIndex);

  }, [props.noOfRows, props.data]);

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

  const checkIfSerieOpen = (obj, openSeries) => {
    let isOpen = false;
    let index;
    const { seriesUID, projectID } = obj;
    openSeries.forEach((serie, i) => {
      if (serie.seriesUID === seriesUID && projectID === serie.projectID) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  const openAnnotation = async selected => {
    try {
      const { studyUID, seriesUID, aimID, patientName, name } = selected;
      const patientID = selected.subjectID;
      const projectID = selected.projectID ? selected.projectID : 'lite';
      const { openSeries } = props;
      // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
      //check if there is enough space in the grid
      let isGridFull = openSeries.length === MAX_PORT;
      //check if the serie is already open
      if (checkIfSerieOpen(selected, props.openSeries).isOpen) {
        const { index } = checkIfSerieOpen(selected, props.openSeries);
        props.dispatch(changeActivePort(index));
        props.dispatch(jumpToAim(seriesUID, aimID, index));
      } else {
        if (isGridFull) {
          props.dispatch(alertViewPortFull());
        } else {
          props.dispatch(addToGrid(selected, aimID));
          props.dispatch(getSingleSerie(selected, aimID));
          //if grid is NOT full check if patient data exists
          if (!props.patients[patientID]) {
            // this.props.dispatch(getWholeData(null, null, selected.original));
            getWholeData(null, null, selected);
          } else {
            props.dispatch(
              updatePatient(
                'annotation',
                true,
                patientID,
                studyUID,
                seriesUID,
                aimID
              )
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displaySeries = async selected => {
    if (props.openSeries.length === MAX_PORT) {
      props.dispatch(alertViewPortFull());
    } else {
      const { subjectID: patientID, studyUID } = selected;
      let seriesArr;
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
        // await this.setState({
        //   isSerieSelectionOpen: true,
        //   selectedStudy: [seriesArr],
        //   studyName: selected.studyDescription
        // });
        // TODO show toast
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
          // this.props.dispatch(getWholeData(null, selected));
          getWholeData(null, selected);
        } else {
          //check if study exist
          props.dispatch(updatePatient('study', true, patientID, studyUID));
        }
      }
    }
  };

  const columns = React.useMemo(
    () => [
      {
        id: 'study-desc',
        Cell: ({ row }) => {
          return (
            <input
              type="checkbox"
              //   checked={selected && aimID ? selected[aimID] : false}
              onChange={() => props.updateSelectedAims(row.original)}
            />
          );
        }
      },
      {
        Header: 'Open',
        sortable: false,
        resizable: false,
        style: { display: 'flex', justifyContent: 'center' },
        Cell: ({ row }) => {
          return (
            <Link className="open-link" to={'/display'}>
              <div
                onClick={() => {
                  if (
                    row.original.seriesUID === 'noseries' ||
                    !row.original.seriesUID
                  ) {
                    displaySeries(row.original);
                  } else {
                    openAnnotation(row.original);
                  }
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '1rem'
                }}
              >
                <FaRegEye className="menu-clickable" />
              </div>
            </Link>
          );
        }
      },
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
        resizable: true
      },
      {
        Header: 'Subject',
        accessor: 'patientName',
        sortable: true,
        resizable: true,
        Cell: ({ row }) => {
          return <div>{clearCarets(row.original.patientName)}</div>;
        }
      },
      {
        accessor: 'comment',
        sortable: true,
        resizable: true,
        className: 'wrapped',
        style: { whiteSpace: 'normal' },
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div>Modality / Series /</div>
              <div>Slice / Series #</div>
            </div>
          );
        }
      },
      {
        Header: 'Template',
        accessor: 'template',
        resizable: true,
        sortable: true
      },
      {
        Header: 'User',
        accessor: 'userName',
        style: { whiteSpace: 'normal' },
        resizable: true,
        sortable: true
      },
      {
        Header: 'Study',
        sortable: true,
        width: 75,
        accessor: 'studyDate',
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ['date'] }),
        filterAll: true,
        Cell: ({ row }) => {
          const studyDateArr = convertDateFormat(
            row.original.studyDate,
            'studyDate'
          ).split(' ');
          return <div>{formatDate(studyDateArr[0])}</div>;
        }
      },
      {
        Header: 'Created',
        sortable: true,
        id: 'date',
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ['date'] }),
        filterAll: true,
        Cell: ({ row }) => {
          const studyDateArr = convertDateFormat(
            row.original.date,
            'date'
          ).split(' ');
          return <div>{formatDate(studyDateArr[0])}</div>;
        }
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div>Created</div>
              <div>Time</div>
            </div>
          );
        },
        sortable: true,
        id: 'time',
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ['time'] }),
        filterAll: true,
        Cell: ({ row }) => {
          const studyDateArr = convertDateFormat(
            row.original.date,
            'date'
          ).split(' ');
          return <div>{studyDateArr[1]}</div>;
        }
      }
    ],
    []
  );

  const fetchData = useCallback(
    ({ pageIndex }) => {
      if (pageIndex !== prevPageIndex) {
        setPrevPageIndex(pageIndex);
        setCurrentPageIndex(pageIndex);
        if (props.data.length <= pageIndex * defaultPageSize) {
          props.getNewData(props.bookmark);

        } else {
          preparePageData(props.data, defaultPageSize, pageIndex);
        }
      } else {
        setCurrentPageIndex(pageIndex);
      }
    },
    [props.bookmark]
  );

  return (
    <Table
      columns={columns}
      data={data}
      selected={props.selected}
      updateSelectedAims={props.updateSelectedAims}
      pageCount={pageCount}
      noOfRows={props.noOfRows}
      fetchData={fetchData}
    />
  );
}

const mapsStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    uploadedPid: state.annotationsListReducer.uploadedPid,
    lastEventId: state.annotationsListReducer.lastEventId,
    refresh: state.annotationsListReducer.refresh,
    projectMap: state.annotationsListReducer.projectMap
  };
};

export default connect(mapsStateToProps)(AnnotationTable);
