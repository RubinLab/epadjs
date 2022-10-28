import React, { useEffect, useState, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import {
  useTable,
  usePagination,
  useRowSelect,
  useSortBy,
  useControlledState
} from 'react-table';
import { Link } from 'react-router-dom';
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
import { isSupportedModality } from "../../Utils/aid.js";
import { COMP_MODALITIES as compModality } from "../../constants.js";
const defaultPageSize = 200;

let maxPort;
let mode;

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
  handleSort,
  handleFilter,
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
    useSortBy,
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
      {mode !== 'teaching' && (<>{/* <table {...getTableProps()} style={{ width: '100%' }}>
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
                  // {...column.getHeaderProps(column.getSortByToggleProps(() => alert("togged")))}
                  // style={{ padding: '0.5rem' }} onClick={() => { handleSort(column) }}
                  style={{ padding: '0.5rem' }}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead> */}
        {/* <tbody {...getTableBodyProps()}> */}</>)}
      {rows.map((row, i) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()}>
            {row.cells.map(cell => {
              if (cell.column.id === 'select')
                return (
                  <td {...cell.getCellProps()} className='select_row'>
                    {cell.render('Cell')}
                  </td>
                );
              else
                return (
                  <td
                    {...cell.getCellProps()}
                  // style={{
                  //   margin: '0',
                  //   padding: '0.8rem 0.4rem',
                  //   borderBottom: '0.2px solid #6c757d'
                  // }}
                  >
                    {cell.render('Cell')}
                  </td>)
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
      {mode !== 'teaching' && (<>{/* </tbody>
      </table> */}</>)}
      {
        pageCount > 1 && (
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
        )
      }
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
  maxPort = parseInt(sessionStorage.getItem('maxPort'));
  mode = sessionStorage.getItem('mode');
  const [pageCount, setPageCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [data, setData] = useState([]);
  const [showSelectSeriesModal, setShowSelectSeriesModal] = useState(false);
  const [selected, setSelected] = useState({});
  const [listOfSelecteds, setListOfSelecteds] = useState([]);

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
  }, [props.pid, props.data]);

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
    const { subjectID: patientID, studyUID, aimID } = selected;
    let seriesArr = await getSeriesData(selected);
    setSelected(seriesArr);
    if (props.openSeries.length === maxPort) {
      setShowSelectSeriesModal(true);
      return;
    }
    //get extraction of the series (extract unopen series)
    if (seriesArr.length > 0) seriesArr = excludeOpenSeries(seriesArr);

    // filter the series according to displayable modalities
    seriesArr = seriesArr.filter(isSupportedModality);

    //check if there is enough room
    if (seriesArr.length + props.openSeries.length > 4) {
      //if there is not bring the modal
      setShowSelectSeriesModal(true);
      // TODO show toast
    } else {
      //if there is enough room
      //add serie to the grid
      const promiseArr = [];
      for (let i = 0; i < seriesArr.length; i++) {
        props.dispatch(addToGrid(seriesArr[i], aimID));
        promiseArr.push(props.dispatch(getSingleSerie(seriesArr[i], aimID)));
      }
      //getsingleSerie
      Promise.all(promiseArr)
        .then(() => { props.switchToDisplay(); })
        .catch(err => console.error(err));
    }
  };

  const { patientName } = props.filters;

  let columns = [];
  if (mode === 'teaching') {
    columns = React.useMemo(
      () => [
        {
          Header: 'Select',
          id: 'select',
          class: 'select_row',
          Cell: ({ row }) => {
            return (
              <input
                type="checkbox"
                className='form-check-input'
                checked={
                  props.selectedAnnotations[row.original.aimID] ? true : false
                }
                onChange={() => props.updateSelectedAims(row.original)}
              />
            );
          }
        },
        {
          Header: 'Patient Name',
          accessor: 'patientName',
          Cell: ({ row }) => {
            return <div onClick={() => {
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
            }} style={{ textDecoration: 'underline', cursor: 'pointer' }}>{clearCarets(row.original.patientName)}</div >;
          }
        },
        {
          Header: 'MRN',
          accessor: 'subjectID',
        },
        {
          Header: 'Acc No',
          accessor: 'accessionNumber',
        },
        {
          accessor: 'name',
        },
        {
          Header: 'Age',
          accessor: 'age',
        },
        {
          Header: 'Sex',
          accessor: 'sex',
        },
        {
          Header: 'Modality',
          accessor: 'modality',
          Cell: ({ row: { original: { modality } } }) => {
            if (compModality[modality]) return <div className={'modality-capital'}>{compModality[modality]}</div>;
            else return <div className={'modality-capital'}>{modality}</div>;
          }
        },
        {
          Header: 'Study Date',
          accessor: 'studyDate',
          Cell: ({ row }) => {
            if (!row.original.studyDate)
              return <div></div>;
            const studyDateArr = convertDateFormat(
              row.original.studyDate,
              'studyDate'
            ).split(' ');
            return <div>{formatDate(studyDateArr[0])}</div>;
          }
        },
        {
          Header: 'Anatomy',
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
          Header: 'Observation',
          accessor: 'observation',
          style: { 'whiteSpace': 'nowrap' },
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
          Header: 'Created',
          id: 'date',
          accessor: 'date',
          Cell: ({ row }) => {
            const studyDateArr = convertDateFormat(
              row.original.date,
              'date'
            ).split(' ');
            return <div>{formatDate(studyDateArr[0])}</div>;
          }
        },
        {
          Header: 'Template',
          accessor: 'templateType',
        },
        {
          Header: 'User',
          accessor: 'fullName',
          style: { whiteSpace: 'normal' },
        },
        {
          Header: 'Narrative',
          accessor: 'userComment'
        }
      ],
      [props.selectedAnnotations, data]
    );
  }
  else {
    columns = React.useMemo(
      () => [
        {
          Header: 'Select',
          id: 'study-desc',
          Cell: ({ row }) => {
            return (
              <input
                type="checkbox"
                checked={
                  props.selectedAnnotations[row.original.aimID] ? true : false
                }
                onClick={() => { props.updateSelectedAims(row.original) }}
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
          // Header: 'Patient Name',
          Header: ({ column }) => { return <div>Patient Name<input type="text" placeholder="search column" onInput={({ target }) => props.handleFilter(column.id, target)} value={patientName} /></div> },
          accessor: 'patientName',
          sortable: true,
          resizable: true,
          Cell: ({ row }) => {
            return <div>{clearCarets(row.original.patientName)}</div>;
          }
        },
        {
          Header: mode == 'teaching' ? 'MRN' : 'Patient Id',
          accessor: 'subjectID',
          sortable: true,
          resizable: true,
        },
        {
          Header: 'Acc No',
          accessor: 'accessionNumber',
          sortable: true,
          resizable: true,
          isTeaching: true
        },
        {
          Header: 'Annotation Name',
          accessor: 'name',
          sortable: true,
          resizable: true
        },
        {
          Header: 'Age',
          accessor: 'age',
          sortable: true,
          resizable: true,
          isTeaching: true,
        },
        {
          Header: 'Sex',
          accessor: 'sex',
          sortable: true,
          resizable: true,
          isTeaching: true,
        },
        {
          Header: 'Modality',
          sortable: true,
          resizable: true,
          accessor: 'modality',
        },
        {
          Header: 'Study Date',
          sortable: true,
          accessor: 'studyDate',
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ['date'] }),
          filterAll: true,
          Cell: ({ row }) => {
            if (!row.original.studyDate)
              return <div></div>;
            const studyDateArr = convertDateFormat(
              row.original.studyDate,
              'studyDate'
            ).split(' ');
            return <div>{formatDate(studyDateArr[0])}</div>;
          }
        },
        {
          Header: 'Anatomy',
          sortable: true,
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
          Header: 'Observation',
          sortable: true,
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
          Header: 'Created',
          sortable: true,
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
          Header: 'Template',
          accessor: 'template',
          resizable: true,
          sortable: true
        },
        // {
        //   accessor: 'comment',
        //   sortable: true,
        //   resizable: true,
        //   className: 'wrapped',
        //   style: { whiteSpace: 'normal' },
        //   Header: () => {
        //     if (mode !== 'teaching')
        //       return (
        //         <div className="mng-anns__header-flex">
        //           <div>Modality / Series /</div>
        //           <div>Slice / Series #</div>
        //         </div>
        //       );
        //     else return 'Modality'
        //   }
        // },
        {
          Header: 'User',
          accessor: 'fullName',
          style: { whiteSpace: 'normal' },
          resizable: true,
          sortable: true
        },
        // {
        //   Header: () => {
        //     return (
        //       <div className="mng-anns__header-flex">
        //         <div>Created</div>
        //         <div>Time</div>
        //       </div>
        //     );
        //   },
        //   sortable: false,
        //   id: 'time',
        //   filterMethod: (filter, rows) =>
        //     matchSorter(rows, filter.value, { keys: ['time'] }),
        //   filterAll: true,
        //   Cell: ({ row }) => {
        //     const studyDateArr = convertDateFormat(
        //       row.original.date,
        //       'date'
        //     ).split(' ');
        //     return <div>{studyDateArr[1]}</div>;
        //   }
        // },
        {
          Header: 'Comment',
          sortable: true,
          resizable: true,
          accessor: 'comment'
        }
      ],
      [props.selectedAnnotations, data]
    );
  }

  const fetchData = useCallback(
    ({ pageIndex }) => {
      // setCurrentPageIndex(pageIndex);
      // props.setPageIndex(pageIndex);
      if (props.data.length <= pageIndex * defaultPageSize) {
        props.getNewData(pageIndex);
      } else {
        preparePageData(props.data, defaultPageSize, pageIndex);
      }
    },
    [props.bookmark]
  );

  return (
    <>
      <Table
        columns={columns}
        data={data}
        selected={props.selected}
        pageCount={pageCount}
        noOfRows={props.noOfRows}
        fetchData={fetchData}
        updateSelectedAims={props.updateSelectedAims}
        controlledPageIndex={currentPageIndex}
        handlePageIndex={handlePageIndex}
        listOfSelecteds={listOfSelecteds}
        handleSort={props.handleSort}
        handleFilter={props.handleFilter}
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
