import React, { useEffect, useState, useCallback } from 'react';
import {
  useTable,
  useExpanded,
  useRowSelect,
  usePagination
} from 'react-table';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import PropagateLoader from 'react-spinners/PropagateLoader';
// import "react-table-v6/react-table.css";
import Studies from './studies';
import { getSubjects } from '../../services/subjectServices';
import { formatDate } from '../flexView/helperMethods';
import { clearCarets } from '../../Utils/aid.js';

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
        />
      </>
    );
  }
);
const defaultPageSize = 200;

function Table({ columns, data, fetchData, pageCount }) {
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

  return (
    <>
      {data.length > 0 && (
        <>
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()}>
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
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {'<'}
            </button>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[200].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              {'>'}
            </button>
          </div>
        </>
      )}
    </>
  );
}

function Subjects(props) {
  const widthUnit = 20;

  const [data, setData] = useState([]);
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
        }
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
              <div data-tip data-for={id} style={{ whiteSpace: 'pre-wrap' }}>
                {desc}
              </div>
              <ReactTooltip id={id} place="right" type="info" delayShow={500}>
                <span>{desc}</span>
              </ReactTooltip>
            </>
          );
        }
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
    const pageData = getDataFromStorage(pageSize, pageIndex);
    setData(pageData);
  }, []);

  const preparePageData = (rawData, pageSize, pageIndex) => {
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
      return preparePageData(subjectsArray, pageSize, pageIndex);
    } else return [];
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
