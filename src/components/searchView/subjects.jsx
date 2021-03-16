import React, { useEffect, useState, useCallback } from 'react';
import {
  useTable,
  useExpanded,
  useRowSelect,
  usePagination
} from 'react-table';
import { connect } from 'react-redux';
import Studies from './Studies';
import ReactTooltip from 'react-tooltip';
import PropagateLoader from 'react-spinners/PropagateLoader';
// import "react-table-v6/react-table.css";
import { getSubjects } from '../../services/subjectServices';
import { formatDate } from '../flexView/helperMethods';
import { clearCarets } from '../../Utils/aid.js';
import propTypes from 'react-table-v6/lib/propTypes';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);
const defaultPageSize = 200;

function Table({
  columns,
  data,
  fetchData,
  pageCount,
  loading,
  filterSubjects,
  getTreeData
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
    state: { expanded, pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: defaultPageSize }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount
    },
    useExpanded, // Use the useExpanded plugin hook
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        // Let's make a column for selection
        {
          id: 'selection',
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          )
        },
        ...columns
      ]);
    }
  );

  useEffect(() => {
    fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);

  const jumpToHeader = () => {
    // const header = document.getElementById('subjects-header-id');
    const header = document.getElementById('epad-logo');
    const bodyRect = document.body.getBoundingClientRect();
    var headerRect = header.getBoundingClientRect();
    const offsetTop = headerRect.top - bodyRect.top;
    const offsetLeft = headerRect.left - bodyRect.left;

    console.log('top, left -->', offsetTop, offsetLeft);
    // window.scrollTo(left, top);
  };

  return (
    <>
      {data.length > 0 && (
        <>
          <label>
            {' '}
            Search subject:
            <input
              type="text"
              onChange={e => filterSubjects(e, pageSize, pageIndex)}
            />
          </label>
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup, k) => (
                <tr
                  id="subjects-header-id"
                  key={`subjects-header-id ${k}`}
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column, z) => (
                    <th {...column.getHeaderProps()} key={`header-col-${z}`}>
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
                  <React.Fragment key={`row-fragment-${i}`}>
                    <tr {...row.getRowProps()} key={`subject-row ${i}`}>
                      {row.cells.map((cell, z) => {
                        return (
                          <td {...cell.getCellProps()} key={`row-col-${z}`}>
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                    {row.isExpanded && (
                      <Studies
                        pid={row.original.projectID}
                        subjectID={row.original.subjectID}
                        getTreeData={getTreeData}
                      />
                      // <div>here !!!</div>
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
  const [searchKey, setSearchKey] = useState('');
  let [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  // let [color, setColor] = useState('#ffffff');

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        width: 35,
        Cell: ({ row }) => {
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          return (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // We can even use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth * 2}rem`,
                  cursor: 'pointer',
                  fontSize: 10,
                  padding: '0',
                  textAlign: 'center',
                  userSelect: 'none',
                  color: '#fafafa',
                  padding: '7px 5px',
                  verticalAlign: 'middle',
                  width: `50px`
                }
              })}
            >
              {row.isExpanded ? <span>&#x25BC;</span> : <span>&#x25B6;</span>}
            </span>
          );
        },
        SubCell: () => null
      },
      {
        Header: (
          <div className="search-header__col--left">Description/Name</div>
        ),
        width: widthUnit * 13,
        id: 'searchView-desc',
        resizable: true,
        sortable: true,
        accessor: 'subjectName',
        Cell: ({ row }) => {
          const desc = clearCarets(row.original.subjectName);
          const id = 'desc-tool' + row.original.subjectID;
          return (
            <>
              <span data-tip data-for={id} style={{ whiteSpace: 'pre-wrap' }}>
                {desc}
              </span>
              <ReactTooltip id={id} place="right" type="info" delayShow={500}>
                <span>{desc}</span>
              </ReactTooltip>
            </>
          );
        },
        SubCell: cellProps => <>{cellProps.value} 🎉</>
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
                <span className="badge badge-secondary">
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
              <span className="badge badge-secondary">
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
        // minResizeWidth: widthUnit * 3,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Type</div>,
        width: widthUnit * 5,
        id: 'searchView-type',
        resizable: false,
        sortable: false,
        // minResizeWidth: widthUnit * 5,
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
        // minResizeWidth: widthUnit * 10,
        Cell: ({ row }) => <div />
      },
      {
        Header: <div className="search-header__col">Upload date</div>,
        width: widthUnit * 7,
        id: 'searchView-upldDate',
        resizable: false,
        sortable: true,
        accessor: 'insertDate',
        // minResizeWidth: widthUnit * 10,
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
        // minResizeWidth: widthUnit * 4,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Identifier</div>,
        width: widthUnit * 10,
        // minResizeWidth: widthUnit * 12,
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
    []
  );

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    if (searchKey) {
      filterSubjects(searchKey, pageSize, pageIndex);
    } else {
      const pageData = getDataFromStorage(pageSize, pageIndex);
      setData(pageData);
    }
  }, []);

  const preparePageData = (rawData, pageSize, pageIndex) => {
    setPageCount(Math.ceil(rawData.length / pageSize));
    const startIndex = pageSize * pageIndex;
    const endIndex = pageSize * (pageIndex + 1);
    console.log('pageSize * pageIndex');
    console.log(pageSize, pageIndex);

    console.log('startIndex, endIndex');
    console.log(startIndex, endIndex);
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
    const searchKey = e.target.value.trim().toLowerCase();
    setSearchKey(searchKey);
    setFilteredData(searchKey, pageSize, pageIndex);
  };

  const setFilteredData = (searchKey, pageSize, pageIndex) => {
    const filteredData = filterSubjectsInTreeeData(searchKey);
    console.log('filteredData', filteredData);
    const pageData = preparePageData(filteredData, pageSize, pageIndex);
    console.log('pageData', pageData);
    setData(pageData);
    setPageCount(Math.ceil(pageData.length / defaultPageSize));
  };

  const filterSubjectsInTreeeData = searchKey => {
    const subjectsArr = getDataFromStorage();
    const result = subjectsArr.reduce((all, item, i) => {
      const name = clearCarets(item.data.subjectName).toLowerCase();
      if (name.includes(searchKey)) all.push(item.data);
      return all;
    }, []);
    console.log('result', result);
    return result;
  };

  useEffect(() => {
    const { pid, getTreeData } = props;
    // const treeData = JSON.parse(localStorage.getItem('treeData'));
    const dataFromStorage = getDataFromStorage(defaultPageSize, 0);
    // check if there is data in treedata
    // if there is use it if not get it and post data back to app
    let data = [];
    if (pid && pid !== 'null') {
      if (dataFromStorage?.length > 0) {
        data = dataFromStorage;
        setData(data);
      } else {
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
  }, []);

  return (
    <>
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
        filterSubjects={filterSubjects}
        getTreeData={props.getTreeData}
      />
    </>
  );
}

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};

export default connect(mapStateToProps)(Subjects);
