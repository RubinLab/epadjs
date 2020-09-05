import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactHtmlParser from 'react-html-parser';
import Draggable from 'react-draggable';
import { Rnd } from 'react-rnd';
import { renderTable, wordExport } from './recist';
import { drawWaterfall } from './waterfall';
import { FaTimes } from 'react-icons/fa';
import { getReport } from '../../services/annotationServices';
import ConfirmationModal from '../common/confirmationModal';
import { MAX_PORT } from '../../constants';

import { getWaterfallReport } from '../../services/reportServices';
import { checkIfSeriesOpen, clearCarets } from '../../Utils/aid';
import {
  changeActivePort,
  clearGrid,
  clearSelection,
  jumpToAim,
  addToGrid,
  getSingleSerie,
} from '../annotationsList/action';

const messages = {
  title: "Can't open all series",
  message: `Maximum ${MAX_PORT} series can be opened. Please close already opened series first.`,
};

const style = { width: 'auto', minWidth: 300, maxHeight: 800, height: 'auto' };
const Report = props => {
  const [node, setNode] = useState(null);
  const [data, setData] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);

  const filterSelectedPatients = () => {
    const patients = Object.values(props.selectedPatients);
    const obj = patients.reduce((all, item, index) => {
      const { projectID, patientID } = item;
      if (all[projectID]) all[projectID].push(patientID);
      else all[projectID] = [patientID];
      return all;
    }, {});
    return obj;
  };

  const constructPairs = object => {
    const result = [];
    for (let pr in object) {
      for (let patient of object[pr]) {
        result.push({ subjectID: patient, projectID: pr });
      }
    }
  };

  const getTableArguments = () => {
    const { report, index } = props;
    let projectID;
    let patientID;
    if (report !== 'Waterfall') {
      ({ projectID, patientID } = props.patient);
    }
    const template = report === 'RECIST' ? null : props.template;
    const id = 'recisttbl'+index;
    let filter = '';
    let loadFilter = '';
    let numofHeaderCols = null;
    let hideCols;
    let selectedProject;
    if (report === 'RECIST') {
      filter = 'report=RECIST';
      numofHeaderCols = 3;
      hideCols = [1];
    } else if (report === 'ADLA') {
      filter = 'report=Longitudinal&shapes=line';
      loadFilter = 'shapes=line&metric=standard deviation';
      numofHeaderCols = 2;
      hideCols = [];
    } else if (report === 'Longitudinal') {
      filter = 'report=Longitudinal';
      if (report != 'Longitudinal') loadFilter = 'metric=' + report;
      if (template != null) filter += '&templatecode=' + template;
      numofHeaderCols = 2;
      hideCols = [];
    } else {
      selectedProject = props.selectedProject;
    }

    return {
      id,
      projectID,
      patientID,
      filter,
      loadFilter,
      numofHeaderCols,
      hideCols,
      report,
      selectedProject,
    };
  };

  const onClose = e => {
    const index = parseInt(e.target.dataset.index);
    props.onClose(index);
  };

  const waterfallSelect = name => {
    props.waterfallSelect(name);
  };

  const getReportTable = async (data, refreshFilter) => {
    try {
      const {
        id,
        projectID,
        patientID,
        loadFilter,
        numofHeaderCols,
        hideCols,
        report,
        selectedProject,
      } = getTableArguments();
      let reportTable;
      if (Object.keys(data).length > 0) {
        if (props.report !== 'Waterfall') {
          console.log(report);
          console.log(
            ' id,patientID,projectID, report,  numofHeaderCols, hideCols, loadFilter'
          );
          console.log(
            id,
            patientID,
            projectID,
            report,
            numofHeaderCols,
            hideCols,
            loadFilter
          );
          console.log(data);
          reportTable = await renderTable(
            id,
            patientID,
            projectID,
            report,
            data,
            numofHeaderCols,
            hideCols,
            loadFilter,
            props.index,
            // onClose, //js code doesn't know anything about this
            refreshFilter
          );
        }
        if (props.report === 'Waterfall')
          reportTable = await drawWaterfall(data, waterfallSelect);
        reportTable = ReactHtmlParser(reportTable);
        setNode(reportTable);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectMetric = async e => {
    const { selectedProject } = getTableArguments();
    const metric = e.target.value;
    props.handleMetric(metric);
    const validMetric =
      metric === 'ADLA' || metric === 'RECIST' || metric === 'intensitystddev';
    const type = 'BASELINE';
    let result;
    let reportTable;
    if (validMetric) {
      if (selectedProject) {
        result = await getWaterfallReport(
          selectedProject,
          null,
          null,
          type,
          metric
        );
      } else {
        const filteredObj = filterSelectedPatients();
        const projects = Object.keys(filteredObj);
        if (projects.length === 1) {
          const pid = projects[0];
          const subjectUIDs = Object.values(filteredObj);
          result = await getWaterfallReport(
            pid,
            subjectUIDs[0],
            null,
            type,
            metric
          );
        } else {
          const pairs = constructPairs(filteredObj);
          result = await getWaterfallReport(null, null, pairs, type, metric);
        }
      }
      getReportTable(result.data);
    } else {
      getReportTable({ series: [] });
    }
    // getReportTable(result.data, metric);
  };

  useEffect(() => {
    const {
      projectID,
      patientID,
      filter,
      selectedProject,
    } = getTableArguments();
    let result;
    async function fetchData() {
      try {
        if (props.report !== 'Waterfall') {
          result = await getReport(projectID, patientID, filter);
          getReportTable(result.data);
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleFilterSelect = e => {
    getReportTable(data, true);
  };

  const stopProp = e => {
    console.log('here');
    e.stopPropagation();
  };

  const downloadReport = () => {
    let { index } = props;
    let { subjectName } = props.patient;
    subjectName = clearCarets(subjectName);
    wordExport(subjectName, 'recisttbl'+index);
  };

  useEffect(() => {
    const { id } = getTableArguments();
    const shapesFilter = document.getElementById(id+'shapesFilter');
    const templateFilter = document.getElementById(id+'templateFilter');
    const filter = document.getElementById(id+'filter');

    if (shapesFilter) {
      shapesFilter.addEventListener('change', handleFilterSelect);
      shapesFilter.addEventListener('mousedown', stopProp);
    }
    if (templateFilter) {
      templateFilter.addEventListener('change', handleFilterSelect);
      templateFilter.addEventListener('mousedown', stopProp);
    }
    if (filter) {
      filter.addEventListener('change', handleFilterSelect);
      filter.addEventListener('mousedown', stopProp);
    }

    return () => {
      if (shapesFilter) {
        shapesFilter.removeEventListener('change', handleFilterSelect);
        shapesFilter.removeEventListener('mousedown', stopProp);
      }
      if (templateFilter) {
        templateFilter.removeEventListener('change', handleFilterSelect);
        templateFilter.removeEventListener('mousedown', stopProp);
      }
      if (filter) {
        filter.removeEventListener('change', handleFilterSelect);
        filter.removeEventListener('mousedown', stopProp);
      }
    };
  }, [onClose, handleFilterSelect, stopProp]);

  const captureClick = e => {
    const { nodeName, id } = e.target;
    if (nodeName === 'A' && id.startsWith('a')) {
      const row = parseInt(id[1]);
      const col = parseInt(id[2]) - 1;
      setSelectedRow(row);
      setSelectedCol(col);
      handleLesionClick(row, col);
    }
  };

  const openAims = (seriesToOpen, projectID, patientID) => {
    const array =
      projectID && patientID
        ? seriesToOpen.map(el => ({ ...el, projectID, patientID }))
        : seriesToOpen;

    array.forEach(series => {
      props.dispatch(addToGrid(series, series.aimID || series.aimUID));
      props.dispatch(getSingleSerie(series, series.aimID || series.aimUID));
    });
    props.history.push('/display');
  };

  const handleLesionClick = (row, col) => {
    // check if the col is 0 (one aim only)
    const { openSeries } = props;
    const notOpenSeries = [];
    const { projectID, patientID, subjectName } = props.patient;
    if (col !== -1) {
      const { seriesUID, aimUID, studyUID } = data.tUIDs[row][col];
      // if not zero check if it is already open
      const { isOpen, index } = checkIfSeriesOpen(
        openSeries,
        seriesUID,
        'seriesUID'
      );
      // if open jump to the displate change active port
      if (isOpen) {
        props.dispatch(changeActivePort(index));
        props.dispatch(jumpToAim(seriesUID, aimUID, index));
        props.history.push('/display');
      } else {
        // if not open check if the grid is full
        // if so give confirmation (clear display view and cancel buttons)
        if (openSeries.length === MAX_PORT) {
          setShowConfirmModal(true);
        } else {
          //if not open the series
          openAims([data.tUIDs[row][col]], projectID, patientID);
        }
      }
      // if the column is 0 (all aims for the lesion)
    } else {
      // check if open series has any of the selected series
      // if so copy the input array and delete the item from the copied input array
      data.tUIDs[row].forEach((el, index) => {
        if (!checkIfSeriesOpen(openSeries, el.seriesUID, 'seriesUID').isOpen) {
          notOpenSeries.push(el);
        }
      });
      // check if already open series and array in hand if have more than 6 series
      if (notOpenSeries.length + openSeries.length > MAX_PORT) {
        // if so give confirmation (clear display view and cancel buttons)
        setShowConfirmModal(true);
      } else {
        openAims(notOpenSeries, projectID, patientID);
      }
    }
  };

  const clearGridAndOpenAllSeries = () => {
    const { projectID, patientID } = props.patient;
    props.dispatch(clearGrid());
    const seriesToOpen =
      selectedCol >= 0
        ? [data.tUIDs[selectedRow][selectedCol]]
        : data.tUIDs[selectedRow];
    openAims(seriesToOpen, projectID, patientID);
    setShowConfirmModal(false);
  };

  const header =
    props.report !== 'Waterfall'
      ? `${props.report} - ${clearCarets(props.patient.subjectName)}`
      : '';

  console.log('before return index', props.index);
  return (
    <>
      {/* <Draggable> */}
      <Rnd
        default={{
          x: 0,
          y: 0,
          // width: 605,
          // height: 200,
        }}
        // minWidth={300}
        // minHeight={190}
        // bounds="window"
        enableUserSelectHack={false}
      >
        <div
          id="report"
          style={props.report === 'Waterfall' ? style : {}}
          onClick={captureClick}
        >
          <div data-index={props.index}>
            <div className="report-header">
              <div className="report-header__title">{header}</div>
              <div className="report-header__btngrp">
                <button onClick={downloadReport}>Export</button>
                <button data-index={props.index} onClick={onClose}>
                  {'x'}
                </button>
              </div>
            </div>
          </div>
          {props.report === 'Waterfall' && (
            <>
              <div className="waterfall-header">
                <select id="filter" onChange={selectMetric}>
                  <option>Choose to filter</option>
                  <option>RECIST</option>
                  <option>ADLA</option>
                  <option>intensitystddev</option>
                </select>
                <button
                  className="w3-btn w3-round-large recistWhitetext"
                  id="closeBtn"
                >
                  <FaTimes />
                </button>
              </div>
              <div
                id="waterfallContainer"
                style={{ width: '100%', minWidth: '300px' }}
                title="WATERFALL"
              ></div>
            </>
          )}

          {node}
        </div>
      </Rnd>
      {/* </Draggable> */}
      {showConfirmModal && (
        <ConfirmationModal
          title={messages.title}
          button={'Close Other Series'}
          message={messages.message}
          onSubmit={clearGridAndOpenAllSeries}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
};

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedProject: state.annotationsListReducer.selectedProject,
    openSeries: state.annotationsListReducer.openSeries,
  };
};

export default withRouter(connect(mapStateToProps)(Report));
