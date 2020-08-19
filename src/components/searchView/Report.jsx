import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import Draggable from 'react-draggable';
import { renderTable } from './recist';
import { drawWaterfall } from './waterfall';
import { FaTimes } from 'react-icons/fa';
import { getReport } from '../../services/annotationServices';
import { getWaterfallReport } from '../../services/reportServices';
const dummyData = {
  series: [{ name: '7', project: 'RECIST', y: -0.19390825546299983 }],
};

const style = { width: 'auto', minWidth: 300, maxHeight: 800, height: 'auto' };
const Report = props => {
  const [node, setNode] = useState(null);
  const [data, setData] = useState([]);

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
    const { report } = props;
    let patients;
    let projectID;
    let patientID;
    if (report !== 'Waterfall') {
      patients = Object.values(props.selectedPatients);
      ({ projectID, patientID } = patients[0]);
    }
    const template = report === 'RECIST' ? null : props.template;
    const id = 'recisttbl';
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

  const onClose = () => {
    props.onClose();
  };

  const getReportTable = async data => {
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
          reportTable = await renderTable(
            id,
            patientID,
            projectID,
            report,
            data,
            numofHeaderCols,
            hideCols,
            loadFilter,
            onClose
          );
        }
        if (props.report === 'Waterfall') reportTable = await drawWaterfall(data);
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
            subjectUIDs,
            null,
            type,
            metric
          );
        } else {
          const pairs = constructPairs(filteredObj);
          result = await getWaterfallReport(null, null, pairs, type, metric);
        }
      }
      getReportTable(dummyData);
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
    getReportTable(data);
  };

  const stopProp = e => {
    e.stopPropagation();
  };

  useEffect(() => {
    const closeBtn = document.getElementById('closeBtn');
    const shapesFilter = document.getElementById('shapesFilter');
    const templateFilter = document.getElementById('templateFilter');
    const filter = document.getElementById('filter');

    if (closeBtn) closeBtn.addEventListener('click', onClose);
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
      if (closeBtn) closeBtn.removeEventListener('click', onClose);
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

  return (
    <Draggable>
      <div id="report" style={props.report === 'Waterfall' ? style : {}}>
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
    </Draggable>
  );
};

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedProject: state.annotationsListReducer.selectedProject,
  };
};

export default connect(mapStateToProps)(Report);
