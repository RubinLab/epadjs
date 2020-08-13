import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import Draggable from 'react-draggable';
import { FaTimes } from 'react-icons/fa';
import { renderTable } from './recist';
import { getReport } from '../../services/annotationServices';
import { setMetadata } from '../../cornerstone-tools/store/modules/segmentationModule/metadata';

const style = { overflow: 'scroll' };
const Report = props => {
  const [node, setNode] = useState(null);
  const [data, setData] = useState([])

  // create filter default values
  // add event handler with change set state

  // in recist set default values in filter method
  // and if all three are not default or changed flag is true

  const getTableArguments = () => {
    const patients = Object.values(props.selectedPatients);
    const { projectID, patientID } = patients[0];
    // const report = props.report;
    const { report } = props;
    const template = report === 'RECIST' ? null : props.template;
    const id = 'recisttbl';
    // const report = "RECIST";
    let filter = '';
    let loadFilter = '';
    let numofHeaderCols = null;
    let hideCols;
    if (report === 'RECIST') {
      filter = 'report=RECIST';
      numofHeaderCols = 3;
      hideCols = [1];
    } else if (report === 'ADLA') {
      filter = 'report=Longitudinal&shapes=line';
      loadFilter = 'shapes=line&metric=standard deviation';
      numofHeaderCols = 2;
      hideCols = [];
    } else {
      filter = 'report=Longitudinal';
      if (report != 'Longitudinal') loadFilter = 'metric=' + report;
      if (template != null) filter += '&templatecode=' + template;
      numofHeaderCols = 2;
      hideCols = [];
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
      } = getTableArguments();
      if (Object.keys(data).length > 0) {
        let reportTable = await renderTable(
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
        reportTable = ReactHtmlParser(reportTable);
        setNode(reportTable);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const { projectID, patientID, filter } = getTableArguments();
    async function fetchData() {
      try {
        const result = await getReport(projectID, patientID, filter);
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

  useEffect(() => {
    const closeBtn = document.getElementById('closeBtn');
    const shapesFilter = document.getElementById('shapesFilter');
    const templateFilter = document.getElementById('templateFilter');
    const filter = document.getElementById('filter');

    if (closeBtn) closeBtn.addEventListener('click', onClose);
    if (shapesFilter)
      shapesFilter.addEventListener('change', handleFilterSelect);
    if (templateFilter)
      templateFilter.addEventListener('change', handleFilterSelect);
    if (filter) filter.addEventListener('change', handleFilterSelect);

    return () => {
      if (closeBtn) closeBtn.removeEventListener('click', onClose);
      if (shapesFilter)
        shapesFilter.removeEventListener('change', handleFilterSelect);
      if (templateFilter)
        templateFilter.removeEventListener('change', handleFilterSelect);
      if (filter) filter.removeEventListener('change', handleFilterSelect);
    };
  }, [onClose, handleFilterSelect]);

  return (
    <Draggable>
      <div id="report">{node}</div>
    </Draggable>
  );
};

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
  };
};

export default connect(mapStateToProps)(Report);
