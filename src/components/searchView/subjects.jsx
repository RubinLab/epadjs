import React, { useEffect, useState } from 'react';
import { useTable, useExpanded, useRowSelect } from 'react-table';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import PropagateLoader from 'react-spinners/PropagateLoader';
// import "react-table-v6/react-table.css";
import Studies from './studies';
import { getSubjects } from '../../services/subjectServices';
import { formatDate } from '../flexView/helperMethods';
import { clearCarets } from '../../Utils/aid.js';

const mode = sessionStorage.getItem('mode');

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
          // onChange={(e) => console.log(' clicked', e)}
        />
      </>
    );
  }
);

function Subjects(props) {
  const widthUnit = 20;
  const [data, setData] = useState([]);
  let [loading, setLoading] = useState(true);
  // let [color, setColor] = useState('#ffffff');

  useEffect(() => {
    setLoading(true);
    if (props.pid && props.pid !== 'null') {
      getSubjects(props.pid)
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.log('error in effect');
          console.error(err);
        });
    }
  }, []);

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        width: 35,
        Cell: ({ row }) => {
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          // console.log('row in expand', row);
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
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
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
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          // Header: ({ getToggleAllPageRowsSelectedProps }) => (
          //   <div>
          //     <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
          //   </div>
          // ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
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

  return (
    <>
      {loading && (
        <div style={{ width: 'fit-content', margin: 'auto', marginTop: '10%' }}>
          <PropagateLoader color={'#7A8288'} loading={loading} margin={8} />
        </div>
      )}
      {data.length > 0 && (
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
      )}
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
