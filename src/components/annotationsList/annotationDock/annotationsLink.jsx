import React from "react";
import { connect } from "react-redux";
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
} from '../action';
import "../annotationsList.css";

const handleJumpToAim = aimId => {
  window.dispatchEvent(
    new CustomEvent("jumpToAimImage", { detail: aimId })
  );
};

const annotationsLink = (props) => {
  const { openSeries, activePort, aimsList, otherSeriesAimsList } = props;
  const { seriesUID } = openSeries[activePort];
  let list = [];
  let header = [];
  let studyAimsList = [];

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

  const displayAnnotations = (e, selected) => {
    const { patientID, projectID, studyUID, seriesUID, aimID } = selected;
    const maxPort = parseInt(sessionStorage.getItem('maxPort'));

    let isGridFull = openSeries.length === maxPort;
    const { isOpen, index } = checkIfSerieOpen(seriesUID);

    if (isOpen) {
      props.dispatch(changeActivePort(index));
      props.dispatch(jumpToAim(seriesUID, aimID, index));
      props.dispatch(clearSelection());
    } else {
      if (isGridFull) {
        props.dispatch(addToGrid(selected, aimID, props.activePort));
      } else {
        props.dispatch(addToGrid(selected, aimID));
      }
      props
        .dispatch(getSingleSerie(selected, aimID))
        .then(() => { })
        .catch(err => console.error(err));
      props.dispatch(clearSelection());
    }
  };


  if (aimsList[seriesUID]) {
    const seriesAims = Object.values(aimsList[seriesUID]);
    header.push(
      <th
        className="annsLink-table __header --cell"
        key="anns-header"
        id="annsHeader"
      >
        Other Image Annotations in <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Series</span>
      </th>,
      // <th
      //   className="annsLink-table __header --cell"
      //   key="slide-header"
      //   id="annsImgSlide"
      // >
      //   Slice#
      // </th>,
    );

    seriesAims.forEach((aim, i) => {
      if (!props.imageAims[aim.id]) {
        list.push((
          <tr key={`${aim.id}-${i}`} className="annsLink-table __tbody --row">
            <td
              data-id={aim.id}
              data-serie={seriesUID}
              onClick={(e) => handleJumpToAim(aim.id)}
              className="annsLink-table __tbody --cell"
            >
              {aim.name}
            </td>
            {/* <td className="annsLink-table __tbody --cell2">{slideNo}</td> */}
          </tr>
        ));
      }
    });
  }


  if (otherSeriesAimsList[seriesUID]) {
    const otherSeriesAims = Object.values(otherSeriesAimsList[seriesUID]);
    header.push(
      <th
        className="annsLink-table __header --cell"
        key="anns-header"
        id="annsHeader"
      >
        Other Image Annotations in <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Study</span>
      </th>,
      // <th
      //   className="annsLink-table __header --cell"
      //   key="slide-header"
      //   id="annsImgSlide"
      // >
      //   Slice#
      // </th>,
    );

    otherSeriesAims.forEach((aim, i) => {
      studyAimsList.push((
        <tr key={aim.aimID} className="annsLink-table __tbody --row">
          <td
            data-id={aim.aimID}
            data-serie={seriesUID}
            onClick={(e) => displayAnnotations(e, aim)}
            className="annsLink-table __tbody --cell"
          >
            {aim.name}
          </td>
          {/* <td className="annsLink-table __tbody --cell2">{slideNo}</td> */}
        </tr>
      ));

    });

  }

  if (list.length === 0 && studyAimsList.length === 0) return ("");

  return (
    <React.Fragment>
      {aimsList[seriesUID] && (
        <table className="annsLink-table">
          <thead className="annsLink-table __header">
            <tr className="annsLink-table __header --row" >{header[0]}</tr>
          </thead>
          <tbody className="annsLink-table __tbody" style={{ backgroundColor: '#333' }}>{list}</tbody>
        </table>
      )}
      {otherSeriesAimsList[seriesUID] && (
        <table className="annsLink-table">
          <thead className="annsLink-table __header">
            <tr className="annsLink-table __header --row" >{header[1]}</tr>
          </thead>
          <tbody className="annsLink-table __tbody" style={{ backgroundColor: '#333' }}>{studyAimsList}</tbody>
        </table>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList,
    otherSeriesAimsList: state.annotationsListReducer.otherSeriesAimsList
  };
};
export default connect(mapStateToProps)(annotationsLink);
