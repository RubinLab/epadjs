import React, { useEffect, useState, useCallback } from 'react';
import { useTable, useExpanded } from 'react-table';
import { connect } from 'react-redux';
import { toast } from "react-toastify";
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import PropagateLoader from 'react-spinners/PropagateLoader';
import { getAnnotations } from '../../services/annotationServices';
import { formatDate } from '../flexView/helperMethods';
import {
  alertViewPortFull,
  getSingleSerie,
  clearSelection,
  selectAnnotation,
  changeActivePort,
  addToGrid,
  getWholeData,
  updatePatient,
  jumpToAim
} from '../annotationsList/action';

const MAX_PORT = sessionStorage.getItem("MAX_PORT");

function Table({ columns, data }) {
  const {
    rows,
    prepareRow,
    state: { expanded }
  } = useTable(
    {
      columns,
      data
    },
    useExpanded
  );

  return (
    <>
      {data.length > 0 && (
        <>
          {rows.map((row, i) => {
            prepareRow(row);
            const style = { height: '2.2rem', background: '#3a3f43 ' };
            return (
              <>
                <tr {...row.getRowProps()} key={`anns${i}`}>
                  {row.cells.map((cell, k) => {
                    return (
                      <td
                        style={style}
                        {...cell.getCellProps({
                          className: cell.column.className
                        })}
                        key={`anns-d${k}`}
                      >
                        {cell.render('Cell')}
                      </td>
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
  const username = sessionStorage.getItem('username');
  const [warningSeen, setWarningSeen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(false);

  useEffect(() => {
    const { selectedPatients, selectedStudies, selectedSeries } = props;
    const patients = Object.values(selectedPatients);
    const studies = Object.values(selectedStudies);
    const series = Object.values(selectedSeries);

    if (patients.length) setSelectedLevel('patients');
    else if (studies.length) setSelectedLevel('studies');
    else if (series.length) setSelectedLevel('series');
    else setSelectedLevel('');
  }, [props.selectedStudies, props.selectedPatients, props.selectedSeries]);

  const checkIfSerieOpen = selectedSerie => {
    let isOpen = false;
    let index;
    props.openSeries.forEach((serie, i) => {
      if (serie.seriesUID === selectedSerie) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  const displayAnnotations = selected => {
    const { projectID, studyUID, seriesUID, aimID } = selected;
    const patientID = selected.subjectID;
    const { openSeries } = props;
    // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
    //check if there is enough space in the grid
    let isGridFull = openSeries.length === MAX_PORT;
    //check if the serie is already open
    if (checkIfSerieOpen(seriesUID).isOpen) {
      const { index } = checkIfSerieOpen(seriesUID);
      props.dispatch(changeActivePort(index));
      props.dispatch(jumpToAim(seriesUID, aimID, index));
    } else {
      if (isGridFull) {
        props.dispatch(alertViewPortFull());
      } else {
        props.dispatch(addToGrid(selected, aimID));
        props
          .dispatch(getSingleSerie(selected, aimID))
          .then(() => { })
          .catch(err => console.error(err));
        //if grid is NOT full check if patient data exists
        if (!props.patients[patientID]) {
          // props.dispatch(getWholeData(null, null, selected));
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
    props.dispatch(clearSelection());
    props.history.push('/display');
  };

  const selectRow = (e, data) => {
    props.dispatch(clearSelection('annotation'));
    const { seriesDescripion } = props.series;
    const { studyDescription } = props;
    props.dispatch(selectAnnotation(data, studyDescription, seriesDescripion));
  };

  const validateAnnotationSelect = () => {
    if (selectedLevel && !warningSeen) {
      const message = `There are already selected ${selectedLevel}. Please deselect those if you want to select an annotation!`;
      toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }); setWarningSeen(true);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        id: 'series-expander',
        Cell: ({ row }) => (
          <div style={{ paddingLeft: '30px' }}>
            <div onMouseEnter={validateAnnotationSelect}>
              <input
                type="checkbox"
                onClick={e => selectRow(e, row.original)}
                disabled={selectedLevel}
                style={{ marginRight: '5px' }}
              />
            </div>
          </div>
        )
      },
      {
        width: widthUnit * 10,
        id: 'study-desc',
        Cell: ({ row }) => {
          const { name, aimID, userName } = row.original;
          let desc = name || 'Unnamed annotation';
          desc = username === userName ? desc : `${desc} (${userName})`;
          let id = 'aimName-tool' + aimID;
          return (
            <>
              <div
                data-tip
                data-for={id}
                className="searchView-row__desc"
                onDoubleClick={() => displayAnnotations(row.original)}
                style={{ paddingLeft: '30px' }}
              >
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
              {formatDate(row.original.date)}
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
        className: 'searchView-table__cell',
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
    [selectedLevel, warningSeen]
  );

  useEffect(() => {
    const { parentSeries } = props;
    const projectId = parentSeries.projectID;
    const subjectId = parentSeries.patientID;
    const studyId = parentSeries.studyUID;
    const seriesId = parentSeries.seriesUID;

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
      <Table columns={columns} data={data} selectRow={selectRow} />
    </>
  );
}

const mapStateToProps = state => {
  return {
    series: state.searchViewReducer.series,
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    activePort: state.annotationsListReducer.activePort,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries
  };
};

export default withRouter(connect(mapStateToProps)(Annotations));
