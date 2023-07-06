import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTable, useExpanded, usePagination } from 'react-table';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import PropagateLoader from 'react-spinners/PropagateLoader';
import Studies from './Studies';
import {
  selectPatient,
  clearSelection,
  selectStudy,
  selectSerie,
  selectAnnotation,
  savePatientFilter
} from '../annotationsList/action';
import { getSubjects } from '../../services/subjectServices';
import { formatDate } from '../flexView/helperMethods';
import { clearCarets } from '../../Utils/aid.js';
import './searchView.css';

const defaultPageSize = 200;

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function Table({
  columns,
  data,
  fetchData,
  pageCount,
  loading,
  getTreeData,
  expandLevel,
  getTreeExpandAll,
  getTreeExpandSingle,
  treeExpand,
  update
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    toggleAllRowsExpanded,
    state: { expanded, pageIndex, pageSize }
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
    useExpanded,
    usePagination
  );

  useEffect(() => {
    if (expandLevel === 1) {
      toggleAllRowsExpanded(true);
      getTreeExpandAll({ patient: data.length }, true, expandLevel);
    }
    if (expandLevel === 0) {
      toggleAllRowsExpanded(false);
      getTreeExpandAll({ patient: data.length }, false, expandLevel);
    }
  }, [expandLevel]);

  React.useEffect(() => {
    fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);

  const jumpToHeader = () => {
    // const header = document.getElementById('subjects-header-id');
    const header = document.getElementById('epad-logo');
    const bodyRect = document.body.getBoundingClientRect();
    var headerRect = header.getBoundingClientRect();
    const offsetTop = headerRect.top - bodyRect.top;
    const offsetLeft = headerRect.left - bodyRect.left;
  };

  return (
    <>
      {data.length > 0 && (
        <>
          <table {...getTableProps()} style={{ width: '100%' }}>
            <thead>
              {headerGroups.map((headerGroup, k) => (
                <tr
                  id="subjects-header-id"
                  key={`subjects-header-id ${k}`}
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column, z) => (
                    <th
                      {...column.getHeaderProps()}
                      key={`header-col-${z}`}
                      className="new-rt-header__cell"
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
                const expandRow = row.isExpanded || treeExpand[row.index];
                const style = { height: '2.5rem', background: '#1e2125' };
                // if (i%2 === 0) style.background = '#32353b';
                return (
                  <React.Fragment key={`row-fragment-${i}`}>
                    <tr
                      {...row.getRowProps()}
                      style={style}
                      key={`subject-row ${i}`}
                    >
                      {row.cells.map((cell, z) => {
                        return (
                          <td
                            {...cell.getCellProps({
                              className: cell.column.className
                            })}
                            key={`row-col-${z}`}
                          >
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                    {expandRow && (
                      <Studies
                        pid={row.original.projectID}
                        subjectID={row.original.subjectID}
                        getTreeData={getTreeData}
                        expandLevel={expandLevel}
                        patientIndex={row.index}
                        getTreeExpandAll={getTreeExpandAll}
                        treeExpand={treeExpand}
                        getTreeExpandSingle={getTreeExpandSingle}
                        update={update}
                      />
                    )}
                  </React.Fragment>
                );
              })}
              {pageCount > 1 && (
                <tr>
                  {loading ? (
                    // Use our custom loading state to show a loading indicator
                    <td colSpan="10000">Loading...</td>
                  ) : (
                    <td colSpan="10000">
                      Showing {defaultPageSize * pageIndex}-
                      {defaultPageSize * (pageIndex + 1)} of ~
                      {pageCount * pageSize} results
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
          {pageCount > 1 && (
            <div className="pagination">
              <button
                onClick={() => {
                  jumpToHeader();
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
                  jumpToHeader();
                  nextPage();
                }}
                disabled={!canNextPage}
              >
                {'>'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Subjects(props) {
  const widthUnit = 20;

  const [data, setData] = useState([]);
  const searchKey = useRef(null);
  let [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(false);
  const [selectedCount, setSelectedCount] = useState(false);
  const [prevUpdate, setPrevUpdate] = useState(0);

  useEffect(() => {
    const { selectedStudies, selectedSeries, selectedAnnotations } = props;
    const studies = Object.values(selectedStudies);
    const series = Object.values(selectedSeries);
    const annotations = Object.values(selectedAnnotations);

    if (studies.length) {
      setSelectedLevel('studies');
      setSelectedCount(studies.length);
    } else if (series.length) {
      setSelectedLevel('series');
      setSelectedCount(series.length);
    } else if (annotations.length) {
      setSelectedLevel('annotations');
      setSelectedCount(annotations.length);
    } else setSelectedLevel('');
  }, [props.selectedStudies, props.selectedSeries, props.selectedAnnotations]);

  const deselectChildLevels = patientID => {
    if (selectedLevel === 'studies') {
      const studies = Object.values(props.selectedStudies);
      const studiesToDeselect = studies.reduce((all, item, i) => {
        if (item.patientID === patientID) {
          all.push(item);
        }
        return all;
      }, []);
      studiesToDeselect.forEach(el => props.dispatch(selectStudy(el)));
    } else if (selectedLevel === 'series') {
      const series = Object.values(props.selectedSeries);
      const seriesToDeselect = series.reduce((all, item, i) => {
        if (item.patientID === patientID) all.push(item);
        return all;
      }, []);
      seriesToDeselect.forEach(el => props.dispatch(selectSerie(el)));
    } else if (selectedLevel === 'annotations') {
      const annotations = Object.values(props.selectedAnnotations);
      const annotationsToDeselect = annotations.reduce((all, item, i) => {
        if (item.patientID === patientID) all.push(item);
        return all;
      }, []);
      annotationsToDeselect.forEach(el =>
        props.dispatch(
          selectAnnotation(el, el.studyDescription, el.seriesDescription)
        )
      );
    }
  };

  const columns = React.useMemo(
    () => [
      {
        id: 'expander',
        width: 35,
        Cell: ({ row, toggleRowExpanded }) => {
          const style = { display: 'flex', width: 'fit-content' };
          return (
            <div style={style}>
              <div>
                <input
                  type="checkbox"
                  style={{ marginRight: '5px' }}
                  disabled={selectedLevel}
                  onClick={() => {
                    props.dispatch(clearSelection('patient'));
                    props.dispatch(selectPatient(row.original));
                  }}
                />
              </div>
              <span
                {...row.getToggleRowExpandedProps({
                  style: {
                    cursor: 'pointer',
                    fontSize: 10,
                    padding: '0',
                    textAlign: 'center',
                    userSelect: 'none',
                    color: '#fafafa',
                    verticalAlign: 'middle'
                  }
                })}
                onClick={() => {
                  const expandStatus = row.isExpanded ? false : true;
                  const obj = {
                    patient: { [row.index]: expandStatus ? {} : false }
                  };
                  toggleRowExpanded(row.id, expandStatus);
                  props.getTreeExpandSingle(obj);
                  if (selectedLevel) {
                    deselectChildLevels(row.original.subjectID);
                  }
                }}
              >
                {row.isExpanded || props.treeExpand[row.index] ? (
                  <span>&#x25BC;</span>
                ) : (
                  <span>&#x25B6;</span>
                )}
              </span>
            </div>
          );
        },
        SubCell: () => null
      },
      {
        Header: (
          <div className="search-header__col --left">Description/Name</div>
        ),
        width: widthUnit * 13,
        id: 'searchView-desc',
        resizable: true,
        sortable: true,
        accessor: 'subjectName',
        Cell: ({ row, rows }) => {
          const desc = clearCarets(row.original.subjectName);
          const id = 'desc-tool' + row.original.subjectID;
          return (
            <>
              <span
                className="searchView-table__cell"
                data-tip
                data-for={id}
                style={{
                  whiteSpace: 'pre-wrap'
                }}
              >
                {desc}
              </span>
              <ReactTooltip id={id} place="right" type="info" delayShow={500}>
                <span>{desc}</span>
              </ReactTooltip>
            </>
          );
        },
        SubCell: cellProps => <>{cellProps.value}</>
      },
      {
        Header: (
          <div className="search-header__col badge-flex">
            <span> # of </span>
            <span> aims </span>
          </div>
        ),
        width: widthUnit * 2,
        id: 'searchView-aims',
        resizable: false,
        sortable: false,
        Cell: ({ row }) => {
          return (
            <div className="searchView-table__cell">
              {row.original.numberOfAnnotations === 0 ? (
                ''
              ) : (
                <span 
                // className="badge badge-secondary"
                className="searchView-table__cell"
                >
                  {row.original.numberOfAnnotations}
                </span>
              )}
            </div>
          );
        }
      },
      {
        Header: (
          <div className="search-header__col badge-flex">
            <span># of </span>
            <span> sub </span>
          </div>
        ),
        width: widthUnit * 3,
        id: 'searchView-sub',
        resizable: false,
        sortable: false,
        Cell: ({ row }) => (
          <div className="searchView-table__cell">
            {row.original.numberOfStudies === 0 ? (
              ''
            ) : (
              <span 
                // className="badge badge-secondary"
                className="searchView-table__cell"
              >
                {row.original.numberOfStudies}
              </span>
            )}
          </div>
        )
      },
      {
        Header: (
          <div className="search-header__col badge-flex">
            <span> # of </span>
            <span> images </span>
          </div>
        ),
        width: widthUnit * 3,
        id: 'searchView-img',
        resizable: false,
        sortable: false,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Type</div>,
        width: widthUnit * 5,
        id: 'searchView-type',
        resizable: false,
        sortable: false,
        Cell: ({ row }) => (
          <div style={{ textAlign: 'center' }}>
            {row.original.examTypes.join('/')}
          </div>
        )
      },
      {
        Header: <div className="search-header__col">Creation date</div>,
        width: widthUnit * 7,
        id: 'searchView-crDate',
        resizable: false,
        sortable: false,
        Cell: ({ row }) => <div />
      },
      {
        Header: <div className="search-header__col">Upload date</div>,
        width: widthUnit * 7,
        id: 'searchView-upldDate',
        resizable: false,
        sortable: true,
        accessor: 'insertDate',
        Cell: ({ row }) => (
          <div style={{ textAlign: 'center' }}>
            {formatDate(row.original.insertDate)}
          </div>
        )
      },
      {
        Header: <div className="search-header__col">Accession</div>,
        width: widthUnit * 5,
        id: 'searchView-access',
        resizable: false,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Identifier</div>,
        width: widthUnit * 10,
        maxWidth: widthUnit * 10,
        id: 'searchView-UID',
        resizable: false,
        sortable: false,
        Cell: ({ row }) => {
          const id = 'id-tool' + row.original.subjectID;
          return (
            <>
              <div className="searchView-table__cell" data-tip data-for={id}>
                {row.original.subjectID}
              </div>
              <ReactTooltip
                id={id}
                place="top"
                type="info"
                delayShow={500}
                clickable={true}
              >
                <span>{row.original.subjectID}</span>
              </ReactTooltip>
            </>
          );
        }
      }
    ],
    [selectedLevel, selectedCount, props.update]
  );

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    if (searchKey.current.value) {
      filterSubjects(null, pageSize, pageIndex, searchKey);
    } else {
      const pageData = getDataFromStorage(pageSize, pageIndex);
      setData(pageData);
    }
  }, []);

  const preparePageData = (rawData, pageSize = 200, pageIndex = 0) => {
    setPageCount(Math.ceil(rawData.length / pageSize));
    const startIndex = pageSize * pageIndex;
    const endIndex = pageSize * (pageIndex + 1);
    const pageData = [];
    rawData.forEach((el, i) => {
      if (i >= startIndex && i < endIndex) {
        el.data ? pageData.push(el.data) : pageData.push(el);
      }
    });
    return pageData;
  };

  const getDataFromStorage = (pageSize, pageIndex) => {
    const treeData = JSON.parse(localStorage.getItem('treeData'));
    const subjectsArray = treeData[props.pid]
      ? Object.values(treeData[props.pid])
      : [];
    if (subjectsArray.length > 0) {
      if (pageSize && pageIndex >= 0)
        return preparePageData(subjectsArray, pageSize, pageIndex);
      else return subjectsArray;
    } else return [];
  };

  const filterSubjects = (e, pageSize, pageIndex) => {
    props.collapseSubjects();
    const searchTerm = searchKey.current.value.trim().toLowerCase();
    props.dispatch(savePatientFilter(searchTerm, pageSize, pageIndex));
    setFilteredData(searchTerm, pageSize, pageIndex);
    props.dispatch(clearSelection());

  };

  const setFilteredData = (searchTerm, pageSize, pageIndex) => {
    const filteredData = filterSubjectsInTreeeData(searchTerm);
    let pageData;
    if (filteredData) {
      pageData = preparePageData(filteredData, pageSize, pageIndex);
      setPageCount(Math.ceil(filteredData.length / defaultPageSize));
    } else {
      pageData = getDataFromStorage(defaultPageSize, 0);
    }
    setData(pageData);
  };

  const filterSubjectsInTreeeData = searchTerm => {
    if (searchTerm) {
      const subjectsArr = getDataFromStorage();
      const result = subjectsArr.reduce((all, item, i) => {
        const name =
          item.data && item.data.subjectName
            ? clearCarets(item.data.subjectName).toLowerCase()
            : '';
        if (name.includes(searchTerm)) all.push(item.data);
        return all;
      }, []);
      return result;
    }
  };

  const sortSubjectName = list => {
    let result = list.sort(function (a, b) {
      if (a.subjectName < b.subjectName) {
        return -1;
      }
      if (a.subjectName > b.subjectName) {
        return 1;
      }
      return 0;
    });
    return result;
  };

  const lastUpdate = useRef(0);

  useEffect(() => {
    if (prevUpdate !== props.update) {
      props.dispatch(savePatientFilter(''));
      setPrevUpdate(props.update);
      localStorage.setItem('treeData', JSON.stringify({}));
      const { pid, getTreeData } = props;
      if (pid !== null && pid !== 'null') {
        setLoading(true);
        getSubjects(pid)
          .then(res => {
            setLoading(false);
            const data = preparePageData(res.data, defaultPageSize, 0);
            getTreeData(pid, 'subject', res.data);
            setData(data);
          })
          .catch(err => {
            console.error(err);
          });
      }
    }
  }, [props.update]);

  useEffect(() => {
    const { pid, getTreeData } = props;
    // const treeData = JSON.parse(localStorage.getItem('treeData'));
    const dataFromStorage = getDataFromStorage(defaultPageSize, 0);
    // check if there is data in treedata
    // if there is use it if not get it and post data back to app
    let data = [];
    const { patientSearch, pageSize, pageIndex } = props.patientFilter;
    if (patientSearch) {
      setFilteredData(patientSearch, pageSize, pageIndex);
    } else if (pid && pid !== 'null') {
      if (dataFromStorage?.length > 0) {
        data = sortSubjectName(dataFromStorage);
        setData(data);
      } else {
        if (pid !== null && pid !== 'null') {
          setLoading(true);
          getSubjects(pid)
            .then(res => {
              setLoading(false);
              data = preparePageData(res.data, defaultPageSize, 0);
              getTreeData(pid, 'subject', res.data);
              setData(data);
            })
            .catch(err => {
              console.error(err);
            });
        }
      }
    }
  }, []);

  // useEffect(() => {
  //   setUpdate(update + 1);
  // }, [props.update]);

  return (
    <>
      <label style={{ color: 'white' }}>
        Find patient:
        <input
          type="text"
          style={{ margin: '1rem' }}
          onChange={filterSubjects}
          ref={searchKey}
          value={props.patientFilter.patientSearch}
        />
      </label>
      {loading && (
        <div style={{ width: 'fit-content', margin: 'auto', marginTop: '10%' }}>
          <PropagateLoader color={'#7A8288'} loading={loading} margin={8} />
        </div>
      )}
      <Table
        columns={columns}
        data={data}
        pageCount={pageCount}
        fetchData={fetchData}
        getTreeData={props.getTreeData}
        expandLevel={props.expandLevel}
        getTreeExpandAll={props.getTreeExpandAll}
        getTreeExpandSingle={props.getTreeExpandSingle}
        treeExpand={props.treeExpand}
        update={props.update}
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
    patientFilter: state.annotationsListReducer.patientFilter
  };
};

export default connect(mapStateToProps)(Subjects);
