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
import { getAnnotations } from '../../services/annotationServices';
import { formatDates } from '../../constants';

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

function Table({ columns, data }) {
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
          id: 'series-selection',
          Cell: ({ row }) => (
            <div style={{ paddingLeft: '36px' }}>
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
      {data.length > 0 && (
        <>
          {rows.map((row, i) => {
            prepareRow(row);
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
              </>
            );
          })}
        </>
      )}
    </>
  );
}

function Annotations(props) {
  const widthUnit = 20;
  const [data, setData] = useState([]);
  let [loading, setLoading] = useState(false);
  const username = sessionStorage.getItem("username");

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'series-expander', // Make sure it has an ID
        width: 35,
        Cell: row => <div />
      },
      {
        width: widthUnit * 10,
        id: 'study-desc',
        // resizable: true,
        // sortable: true,
        className: 'searchView-row__desc',
        Cell: ({ row }) => {
          const { name, aimID, userName } = row.original;
          let desc = name || 'Unnamed annotation';
          desc = username === userName ? desc : `${desc} (${userName})`;
          let id = 'aimName-tool' + aimID;
          return (
            <>
              <div data-tip data-for={id} style={{ whiteSpace: 'pre-wrap' }}>
                {desc}
              </div>
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
        //no of aims
        width: widthUnit * 2,
        id: 'empty-col-aims',
        Cell: row => <div />
      },
      {
        //no of sub item
        width: widthUnit * 3,
        id: 'empty-col-subItem',
        Cell: row => <div />
      },
      {
        //no of sub images
        width: widthUnit * 3,
        id: 'empty-col-img',
        Cell: row => <div />
      },
      {
        Header: 'Type',
        width: widthUnit * 5,
        Cell: ({ row }) => (
          <div className="searchView-table__cell">{row.original.template}</div>
        )
      },
      {
        Header: 'Created Date',
        width: widthUnit * 7,
        id: 'annotations-table-aimDate',
        Cell: ({ row }) => {
          return (
            <div className="searchView-table__cell">
              {formatDates(row.original.date)}
            </div>
          );
        }
      },
      {
        //upload date
        width: widthUnit * 7,
        id: 'empty-col-uploadDate',
        Cell: row => <div />
      },
      {
        //accession
        width: widthUnit * 6,
        id: 'empty-col-accession',
        Cell: row => <div />
      },
      {
        Header: 'Identifier',
        width: widthUnit * 10,
        Cell: ({ row }) => {
          let id = 'aimid-tool' + row.original.aimID;
          return (
            <>
              <div data-tip data-for={id}>
                {row.original.aimID}
              </div>
              <ReactTooltip
                id={id}
                place="top"
                type="info"
                delayShow={500}
                clickable={true}
              >
                <span>{row.original.aimID}</span>
              </ReactTooltip>
            </>
          );
        }
      }
    ],
    []
  );

  useEffect(() => {
    const { series } = props;

    const projectId = series.projectID;
    const subjectId = series.patientID;
    const studyId = series.studyUID;
    const seriesId = series.seriesUID;

    setLoading(true);
    getAnnotations({ projectId, subjectId, studyId, seriesId })
      .then(res => {
        setLoading(false);
        setData(res.data.rows);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <>
      {loading && (
        <tr style={{ width: 'fit-content', margin: 'auto', marginTop: '10%' }}>
          <PropagateLoader color={'#7A8288'} loading={loading} margin={8} />
        </tr>
      )}
      <Table columns={columns} data={data} />
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

export default connect(mapStateToProps)(Annotations);
