import React, { useEffect, useState, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import {
  useTable,
  usePagination,
  useRowSelect,
  // useSortBy,
  useControlledState
} from 'react-table';
import _ from 'lodash';
import { FaRegEye } from 'react-icons/fa';
import { clearCarets, convertDateFormat } from '../../Utils/aid.js';
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
import { formatDate } from '../flexView/helperMethods';
import { getSeries } from '../../services/seriesServices';
import SelectSerieModal from '../annotationsList/selectSerieModal';

const defaultPageSize = 200;
const maxPort = parseInt(sessionStorage.getItem('maxPort'));

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;
    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);
    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          checked={rest.selected}
          onClick={() => rest.updateSelectedAims(rest.data)}
        />
      </>
    );
  }
);

function Table({
  columns,
  data,
  selected,
  updateSelectedAims,
  pageCount,
  noOfRows,
  fetchData,
  controlledPageIndex,
  handlePageIndex,
  listOfSelecteds,
  updateSort
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
        pageSize: defaultPageSize
      },
      autoResetPage: false,
      manualPagination: true,
      pageCount,
      useControlledState: state => {
        return React.useMemo(
          () => ({
            ...state,
            pageIndex: controlledPageIndex
          }),
          [state, controlledPageIndex]
        );
      }
    },
    // useSortBy,
    usePagination,
    useRowSelect
    // hooks => {
    //   hooks.visibleColumns.push(columns => [
    //     // Let's make a column for selection
    //     {
    //       id: 'selection',
    //       Cell: ({ row }) => (
    //         <div>
    //           <IndeterminateCheckbox
    //             {...row.getToggleRowSelectedProps()}
    //             data={row.original}
    //             updateSelectedAims={updateSelectedAims}
    //             selected={listOfSelecteds.includes(row.original.aimID)}
    //             // onChange={() => updateSelectedAims(row.original)}
    //           />
    //         </div>
    //       )
    //     },
    //     ...columns
    //   ]);
    // }
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
                <th
                  // {...column.getHeaderProps(column.getSortByToggleProps())}
                  style={{ padding: '0.5rem' }}
                >
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
          {noOfRows / defaultPageSize > 1 && (
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
              handlePageIndex('prev');
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
            {[defaultPageSize].map((pageSize, i) => (
              <option key={`${pageSize}-${i}`} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              handlePageIndex('next');
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

// const formatDate = dateString => {
//   try {
//     const dateArr = dateString.split('-');
//     dateArr[0] = dateArr[0].substring(2);
//     dateArr[1] = dateArr[1][0] === '0' ? dateArr[1][1] : dateArr[1];
//     dateArr[2] = dateArr[2][0] === '0' ? dateArr[2][1] : dateArr[2];
//     return dateArr[1] + '/' + dateArr[2] + '/' + dateArr[0];
//   } catch (err) {
//     console.error(err);
//   }
// };

function AnnotationTable(props) {
  const [pageCount, setPageCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [data, setData] = useState([]);
  const [showSelectSeriesModal, setShowSelectSeriesModal] = useState(false);
  const [selected, setSelected] = useState({});
  const [listOfSelecteds, setListOfSelecteds] = useState([]);
  const [prevSortKeys, setPrevSortKeys] = useState({});

  const handlePageIndex = act => {
    let newIndex = act === 'prev' ? currentPageIndex - 1 : currentPageIndex + 1;
    setCurrentPageIndex(newIndex);
    props.setPageIndex(newIndex);
  };

  // Render the UI for your table
  const preparePageData = (
    rawData,
    pageSize = defaultPageSize,
    pageIndex = 0
  ) => {
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
    const selectedList = Object.keys(props.selectedAnnotations);
    setListOfSelecteds(selectedList);
  }, [props.selectedAnnotations]);

  useEffect(() => {
    preparePageData(props.data);
    setCurrentPageIndex(0);
  }, [props.pid, props.data, props.sortKeys]);

  useEffect(() => {
    if (props.data.length <= defaultPageSize * currentPageIndex) {
      preparePageData(props.data, defaultPageSize, 0);
      setCurrentPageIndex(0);
    }
  }, [props.noOfRows, props.data]);

  const getSeriesData = async selected => {
    props.dispatch(startLoading());
    const { projectID, studyUID } = selected;
    let { patientID, subjectID } = selected;
    patientID = patientID ? patientID : subjectID;
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
      setSelected(selected);
      // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
      //check if there is enough space in the grid
      let isGridFull = openSeries.length === maxPort;
      //check if the serie is already open
      if (checkIfSerieOpen(selected, props.openSeries).isOpen) {
        const { index } = checkIfSerieOpen(selected, props.openSeries);
        props.dispatch(changeActivePort(index));
        props.dispatch(jumpToAim(seriesUID, aimID, index));
        props.switchToDisplay();
      } else {
        if (isGridFull) {
          setShowSelectSeriesModal(true);
        } else {
          props.dispatch(addToGrid(selected, aimID));
          props.dispatch(getSingleSerie(selected, aimID));
          //if grid is NOT full check if patient data exists
          // -----> Delete after v1.0 <-----
          // if (!props.patients[patientID]) {
          //   // this.props.dispatch(getWholeData(null, null, selected.original));
          //   getWholeData(null, null, selected);
          // } else {
          //   props.dispatch(
          //     updatePatient(
          //       'annotation',
          //       true,
          //       patientID,
          //       studyUID,
          //       seriesUID,
          //       aimID
          //     )
          //   );
          // }
          props.switchToDisplay();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displaySeries = async selected => {
    setSelected(selected);
    if (props.openSeries.length === maxPort) {
      setShowSelectSeriesModal(true);
    } else {
      const { subjectID: patientID, studyUID } = selected;
      let seriesArr = await getSeriesData(selected);
      //get extraction of the series (extract unopen series)
      if (seriesArr.length > 0) seriesArr = excludeOpenSeries(seriesArr);
      //check if there is enough room
      if (seriesArr.length + props.openSeries.length > maxPort) {
        //if there is not bring the modal
        setShowSelectSeriesModal(true);
        setSelected(seriesArr);
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
        // -----> Delete after v1.0 <-----
        // if (!patientExists) {
        //   // this.props.dispatch(getWholeData(null, selected));
        //   getWholeData(null, selected);
        // } else {
        //   //check if study exist
        //   props.dispatch(updatePatient('study', true, patientID, studyUID));
        // }
      }
    }
  };

  const updateSort = col => {
    const newSortKeys = { ...props.sortKeys };
    setPrevSortKeys({ ...props.sortKeys });
    if (props.sortKeys[col]) {
      newSortKeys[col] = 0;
    } else {
      newSortKeys[col] = 1;
    }
    props.setSortKeys(newSortKeys);
  };

  const columns = React.useMemo(
    () => [
      {
        id: 'study-desc',
        Cell: ({ row }) => {
          return (
            <input
              type="checkbox"
              checked={
                props.selectedAnnotations[row.original.aimID] ? true : false
              }
              onChange={() => props.updateSelectedAims(row.original)}
            />
          );
        }
      },
      {
        Header: 'Open',
        // sortable: false,
        resizable: false,
        style: { display: 'flex', justifyContent: 'center' },
        Cell: ({ row }) => {
          return (
            // <Link className="open-link" to={'/display'}>
            <div
              onClick={() => {
                if (
                  row.original.seriesUID === 'noseries' ||
                  !row.original.seriesUID
                ) {
                  // study aim opening
                  displaySeries(row.original);
                } else {
                  // series opening
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
            // </Link>
          );
        }
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              {/* <div onClick={() => props.sortTable('lesion_name')}>Name</div> */}
              <div onClick={() => updateSort('lesion_name')}>Name</div>
            </div>
          );
        },
        accessor: 'name',
        // sortable: true,
        resizable: true
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div onClick={() => updateSort('patient')}>Subject</div>
              {/* <div onClick={() => props.sortTable('patient')}>Subject</div> */}
            </div>
          );
        },
        accessor: 'patientName',
        // sortable: true,
        resizable: true,
        Cell: ({ row }) => {
          return <div>{clearCarets(row.original.patientName)}</div>;
        }
      },
      {
        accessor: 'comment',
        // sortable: true,
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
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              {/* <div onClick={() => props.sortTable('template')}>Template</div> */}
              <div onClick={() => updateSort('template')}>Template</div>
            </div>
          );
        },
        accessor: 'template',
        resizable: true
        // sortable: true
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div onClick={() => updateSort('user')}>User</div>
            </div>
          );
        },
        accessor: 'userName',
        style: { whiteSpace: 'normal' },
        resizable: true
        // sortable: true
      },
      {
        Header: 'Study',
        // sortable: true,
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
        // sortable: true,
        id: 'date',
        accessor: 'date',
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
        // sortable: false,
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
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div onClick={() => updateSort('modality')}>Modality</div>
            </div>
          );
        },
        // sortable: true,
        resizable: true,
        accessor: 'modality'
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div onClick={() => updateSort('anatomy')}>Anatomy</div>
            </div>
          );
        },
        // sortable: true,
        resizable: true,
        accessor: 'anatomy',
        Cell: ({ row }) => {
          return (
            <div>
              {Array.isArray(row.original.anatomy)
                ? row.original.anatomy.join(', ')
                : row.original.anatomy}
            </div>
          );
        }
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div onClick={() => updateSort('observation')}>Observation</div>
            </div>
          );
        },
        // sortable: true,
        resizable: true,
        accessor: 'observation',
        Cell: ({ row }) => {
          return (
            <div>
              {Array.isArray(row.original.observation)
                ? row.original.observation.join(', ')
                : row.original.observation}
            </div>
          );
        }
      },
      {
        Header: () => {
          return (
            <div className="mng-anns__header-flex">
              <div onClick={() => updateSort('comment')}>Comment</div>
            </div>
          );
        },
        // sortable: true,
        resizable: true,
        accessor: 'userComment'
      }
    ],
    [props.selectedAnnotations, data, props.sortKeys]
  );

  const fetchData = useCallback(
    ({ pageIndex }) => {
      // setCurrentPageIndex(pageIndex);
      // props.setPageIndex(pageIndex);
      const sortChanged = !_.isEqual(prevSortKeys, props.sortKeys);
      if (props.data.length <= pageIndex * defaultPageSize || sortChanged) {
        props.getNewData(pageIndex);
      } else {
        preparePageData(props.data, defaultPageSize, pageIndex);
      }
    },
    [props.bookmark, props.sortKeys]
  );

  return (
    <>
      <Table
        columns={columns}
        data={data}
        selected={props.selected}
        // updateSelectedAims={props.updateSelectedAims}
        pageCount={pageCount}
        noOfRows={props.noOfRows}
        fetchData={fetchData}
        updateSelectedAims={props.updateSelectedAims}
        controlledPageIndex={currentPageIndex}
        handlePageIndex={handlePageIndex}
        listOfSelecteds={listOfSelecteds}
        updateSort={updateSort}
      />
      {showSelectSeriesModal && (
        <SelectSerieModal
          seriesPassed={Array.isArray(selected) ? [selected] : [[selected]]}
          onCancel={() => {
            setShowSelectSeriesModal(false);
            setSelected({});
          }}
          // studyName={serie.studyDescription}
        />
      )}
    </>
  );
}

const mapsStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    uploadedPid: state.annotationsListReducer.uploadedPid,
    lastEventId: state.annotationsListReducer.lastEventId,
    refresh: state.annotationsListReducer.refresh,
    projectMap: state.annotationsListReducer.projectMap,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};

export default connect(mapsStateToProps)(AnnotationTable);
