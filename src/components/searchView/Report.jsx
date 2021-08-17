import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactHtmlParser from 'react-html-parser';
import { Rnd } from 'react-rnd';
import useResizeAware from 'react-resize-aware';
import { renderTable, wordExport } from './recist';
import ConfirmationModal from '../common/confirmationModal';
import WaterfallReact from './WaterfallReact';
import { getWaterfallReport, getReport } from '../../services/reportServices';
import { checkIfSeriesOpen, clearCarets } from '../../Utils/aid';
import { CSVLink } from "react-csv";
import {
  changeActivePort,
  clearGrid,
  jumpToAim,
  addToGrid,
  getSingleSerie,
  updateImageId
} from '../annotationsList/action';

const MAX_PORT = sessionStorage.getItem("MAX_PORT");

const messages = {
  title: 'Can not open all series',
  message: `Maximum ${MAX_PORT} series can be opened. Please close already opened series first.`
};

const style = {
  width: 'auto',
  minWidth: 300,
  maxHeight: 800,
  height: 'auto'
};
const Report = props => {
  const [resizeListener, sizes] = useResizeAware();
  const [node, setNode] = useState(null);
  const [data, setData] = useState({});
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);
  const [isNonTarget, setIsNonTarget] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState({});
  const [selectedSeries, setSelectedSeries] = useState([]);

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
      patientID = patientID ? patientID : props.patient.subjectID;
    }
    const template = report === 'RECIST' ? null : props.template;
    const id = 'recisttbl' + index;
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
    } else if (report) {
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
      selectedProject
    };
  };

  const onClose = e => {
    const index = parseInt(e.target.dataset.index);
    props.onClose(index);
  };

  const waterfallClickOn = name => {
    props.waterfallClickOn(name);
  };

  const getReportTable = async (dataPassed, refreshFilter) => {
    try {
      const {
        id,
        projectID,
        patientID,
        loadFilter,
        numofHeaderCols,
        hideCols,
        report
      } = getTableArguments();
      let reportTable;
      if (Object.keys(dataPassed).length > 0) {
        if (props.report !== 'Waterfall') {
          reportTable = await renderTable(
            id,
            patientID,
            projectID,
            report,
            dataPassed,
            numofHeaderCols,
            hideCols,
            loadFilter,
            props.index,
            refreshFilter
          );
        }
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
      metric === 'ADLA' || metric === 'RECIST' || metric === 'intensitystddev' || metric === 'ser_original_shape_voxelvolume' || metric === 'ser_original_shape_maximum2ddiameterslice' || metric === 'ser_original_firstorder_maximum' || metric === 'ser_original_firstorder_median' || metric === 'adc_original_firstorder_maximum' || metric === 'adc_original_firstorder_median' || metric === 've_original_firstorder_maximum' || metric === 've_original_firstorder_median'  || metric === 'Export (beta)';
    const type = 'BASELINE';
    let result;
    if (validMetric) {
      if (selectedProject) {
        result = await getWaterfallReport(
          selectedProject,
          null,
          null,
          type,
          metric,
          metric === 'Export (beta)' ?
            [
              { field: 'recist', header: 'SLD' },
              { field: 'mean', header: 'Average HU' },
            ]
            :
            undefined
        );
      } else {
        const projects = Object.keys(filteredPatients);
        if (projects.length === 1) {
          const pid = projects[0];
          const subjectUIDs = Object.values(filteredPatients);
          result = await getWaterfallReport(
            pid,
            subjectUIDs[0],
            null,
            type,
            metric,
            metric === 'Export (beta)' ?
              [
                { field: 'recist', header: 'SLD' },
                { field: 'mean', header: 'Average HU' },
              ]
              :
              undefined
          );
        } else {
          const pairs = constructPairs(filteredPatients);
          result = await getWaterfallReport(null, null, pairs, type, metric,
            metric === 'Export (beta)' ?
              [
                { field: 'recist', header: 'SLD' },
                { field: 'mean', header: 'Average HU' },
              ]
              :
              undefined
          );
        }
      }
      setData(result.data);
    } else {
      setData({ series: [] });
    }
  };

  useEffect(() => {
    const {
      projectID,
      patientID,
      filter,
      selectedProject
    } = getTableArguments();
    let result;
    async function fetchData() {
      try {
        if (props.report !== 'Waterfall') {
          result = await getReport(projectID, patientID, filter);
          const userList = Object.keys(result.data);
          setUsers(userList);
          setUser(userList[0]);
          getReportTable(result.data[userList[0]]);
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const patients = Object.values(props.selectedPatients);
    const obj = patients.reduce((all, item, index) => {
      const { projectID, patientID } = item;
      if (all[projectID]) all[projectID].push(patientID);
      else all[projectID] = [patientID];
      return all;
    }, {});
    setFilteredPatients(obj);
  }, []);

  const handleFilterSelect = e => {
    getReportTable(data[user], true);
  };

  const stopProp = e => {
    e.stopPropagation();
  };

  const downloadReport = () => {
    let { index } = props;
    let { subjectName } = props.patient;
    subjectName = clearCarets(subjectName);
    wordExport(subjectName, 'recisttbl' + index);
  };

  useEffect(() => { }, [sizes.width, sizes.height]);

  const updateImageIDs = async () => {
    const { openSeries } = props;
    const indexMap = {};
    selectedSeries.forEach(el => {
      const { isOpen, index } = checkIfSeriesOpen(
        openSeries,
        el.seriesUID,
        'seriesUID'
      );
      if (isOpen) indexMap[el.seriesUID] = index;
    });

    if (Object.values(indexMap).length === selectedSeries.length) {
      let count = 0;
      openSeries.forEach((el, i) => {
        if (
          (indexMap[el.seriesUID] || indexMap[el.seriesUID] === 0) &&
          el.imageAnnotations
        ) {
          count += 1;
        }
      });
      if (count === selectedSeries.length) {
        for (let aim of selectedSeries) {
          const { seriesUID, aimUID } = aim;
          props.dispatch(jumpToAim(seriesUID, aimUID, indexMap[seriesUID]));
        }
        window.dispatchEvent(new Event('aimsOpenedFromReport'));
      }
    }
  };

  useEffect(() => {
    updateImageIDs();
  }, [Object.keys(props.aimsList).length]);

  useEffect(() => {
    const { id } = getTableArguments();
    const shapesFilter = document.getElementById(id + 'shapesFilter');
    const templateFilter = document.getElementById(id + 'templateFilter');
    const filter = document.getElementById(id + 'filter');

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
    setIsNonTarget(id.startsWith('nc'));
    if (nodeName === 'A' && (id.startsWith('a') || id.startsWith('nc'))) {
      const row = id.startsWith('a') ? parseInt(id[1]) : parseInt(id[2]);
      const col = id.startsWith('a')
        ? parseInt(id[2]) - 1
        : parseInt(id[3]) - 1;
      setSelectedRow(row);
      setSelectedCol(col);
      const nontarget = id.startsWith('nc');
      handleLesionClick(row, col, nontarget);
    }
  };

  const openAims = (seriesToOpen, projectID, patientID) => {
    try {
      setSelectedSeries(seriesToOpen);
      const array =
        projectID && patientID
          ? seriesToOpen.map(el => ({ ...el, projectID, patientID }))
          : seriesToOpen;
      for (let series of array) {
        props.dispatch(addToGrid(series, series.aimID || series.aimUID));
        props.dispatch(getSingleSerie(series, series.aimID || series.aimUID));
      }
      props.history.push('/display');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLesionClick = (row, col, nontarget) => {
    try {
      const uidData = nontarget ? data[user].ntUIDs : data[user].tUIDs;
      const { openSeries } = props;
      const notOpenSeries = [];
      const { projectID, patientID, subjectName } = props.patient;
      // check if the col is 0 (one aim only)
      if (col !== -1) {
        const { seriesUID, aimUID, studyUID } = uidData[row][col];
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
            openAims([uidData[row][col]], projectID, patientID);
          }
        }
        // if the column is 0 (all aims for the lesion)
      } else {
        // check if open series has any of the selected series
        // if so copy the input array and delete the item from the copied input array
        uidData[row].forEach((el, index) => {
          if (
            !checkIfSeriesOpen(openSeries, el.seriesUID, 'seriesUID').isOpen
          ) {
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
    } catch (err) {
      console.error(err);
    }
  };

  const clearGridAndOpenAllSeries = () => {
    const uidData = isNonTarget ? data[user].ntUIDs : data[user].tUIDs;
    const { projectID, patientID } = props.patient;
    props.dispatch(clearGrid());
    const seriesToOpen =
      selectedCol >= 0
        ? [uidData[selectedRow][selectedCol]]
        : uidData[selectedRow];
    openAims(seriesToOpen, projectID, patientID);
    setShowConfirmModal(false);
  };

  const header =
    props.report !== 'Waterfall'
      ? `${props.report} - ${clearCarets(props.patient.subjectName)}`
      : '';

  return (
    <>
      <Rnd
        default={{
          x: 50,
          y: 50
        }}
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
                {props.report !== 'Waterfall' && (
                  <button
                    className="report-header__btn --exp"
                    onClick={downloadReport}
                  >
                    Export
                  </button>
                )}
                <button
                  className="report-header__btn"
                  data-index={props.index}
                  onClick={() => props.onMinimize(props.index, header)}
                >
                  {String.fromCharCode('0xFF3F')}
                </button>
                <button
                  className="report-header__btn --close"
                  data-index={props.index}
                  onClick={onClose}
                >
                  {String.fromCharCode('0x2A09')}
                </button>
              </div>
            </div>
          </div>
          {props.report !== 'Waterfall' && (
            <div style={{ marginLeft: '0.5rem' }}>
              <select
                onMouseDown={e => e.stopPropagation()}
                onChange={e => {
                  const userVal = e.target.value;
                  getReportTable(data[userVal]);
                  setUser(userVal);
                }}
                defaultValue={user}
              >
                {users.map((el, i) => (
                  <option key={`${el}-${i}`} value={el}>
                    {el}
                  </option>
                ))}
              </select>
            </div>
          )}
          {props.report === 'Waterfall' && (
            <>
              <div className="waterfall-header">
                <select id="filter" onChange={selectMetric}>
                  <option>Choose to filter</option>
                  <option>RECIST</option>
                  <option>ADLA</option>
                  <option>intensitystddev</option>
                  <option>ser_original_shape_voxelvolume</option>
                  <option>ser_original_shape_maximum2ddiameterslice</option>
                  <option>ser_original_firstorder_maximum</option>
                  <option>ser_original_firstorder_median</option>
                  <option>adc_original_firstorder_maximum</option>
                  <option>adc_original_firstorder_median</option>
                  <option>ve_original_firstorder_maximum</option>
                  <option>ve_original_firstorder_median</option>
                  <option>Export (beta)</option>
                </select>
              </div>
              {data.series && data.series.length >= 0 && (
                <div style={{ position: 'relative', background: '#FFFFFF' }}>
                  {resizeListener}
                  <WaterfallReact
                    data={data}
                    waterfallSelect={waterfallClickOn}
                    width={sizes.width}
                  />
                </div>
              )}
              {data.waterfallExport && <CSVLink {...{ data: data.waterfallExport, headers: data.waterfallHeaders, filename: 'waterfall.csv' }}>Export to CSV</CSVLink>}
            </>
          )}

          {node}
        </div>
      </Rnd>
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
    aimsList: state.annotationsListReducer.aimsList
  };
};

export default withRouter(connect(mapStateToProps)(Report));
