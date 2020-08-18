import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import Draggable from 'react-draggable';
import { renderTable } from './recist';
import { drawWaterfall } from './waterfall';
import { getReport } from '../../services/annotationServices';
import { getWaterfallReport } from '../../services/reportServices';
const dummyData = {
  series: [{ name: '7', project: 'RECIST', y: -0.19390825546299983 }],
};

const style = { width: 'auto', minWidth: 300, maxHeight: 800, height: 'auto' };
const Report = props => {
  const [node, setNode] = useState(null);
  const [data, setData] = useState([]);
  const [type, setType] = useState('BASELINE');
  const [metric, setMetric] = useState('RECIST');

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
    // console.log(report);
    if (report !== 'Waterfall') {
      patients = Object.values(props.selectedPatients);
      ({ projectID, patientID } = patients[0]);
    }
    const template = report === 'RECIST' ? null : props.template;
    const id = 'recisttbl';
    // const report = "RECIST";
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
        } else {
          drawWaterfall(dummyData);
        }
        reportTable = ReactHtmlParser(reportTable);
        setNode(reportTable);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const {
      projectID,
      patientID,
      filter,
      selectedProject,
    } = getTableArguments();
    // console.log(props.report);
    let result;
    async function fetchData() {
      try {
        if (props.report === 'Waterfall') {
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
              result = await getWaterfallReport(
                null,
                null,
                pairs,
                type,
                metric
              );
            }
          }
        } else {
          result = await getReport(projectID, patientID, filter);
        }
        getReportTable(result.data);
        setData(result.data);
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
