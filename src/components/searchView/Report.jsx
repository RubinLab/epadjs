import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import Draggable from 'react-draggable';
import Modal from 'react-bootstrap/Modal';
import { renderTable } from './recist';
import { getReport } from '../../services/annotationServices';

const Report = props => {
  const [data, setData] = useState({});
  const [node, setNode] = useState(null);

  const getTableArguments = () => {
    const patients = Object.values(props.selectedPatients);
    const { projectID, patientID } = patients[0];
    // const report = props.report;
    const report = 'RECIST';
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
          loadFilter
        );
        reportTable = ReactHtmlParser(reportTable);
        setNode(reportTable);
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    // console.log(reportNode)
    const { projectID, patientID, filter } = getTableArguments();
    async function fetchData() {
      try {
        const result = await getReport(projectID, patientID, filter);
        setData(result.data);
        getReportTable(result.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    // <Draggable>
    // <Modal>
      <div id="report">{node}</div>
    // </Modal>
    // </Draggable>
  );
};

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
  };
};

export default connect(mapStateToProps)(Report);
