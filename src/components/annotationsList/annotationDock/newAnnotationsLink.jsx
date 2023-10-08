import React, { useEffect, useState } from "react";
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
  jumpToAim,
  updateImageId,
} from '../action';
import "../annotationsList.css";

const handleJumpToAim = (aimId, index) => {
  window.dispatchEvent(
    new CustomEvent("jumpToAimImage", { detail: { aimId, index } })
  );
};

const annotationsLink = (props) => {
  const [presentImgID, setPresentImgID] = useState("");
  const { openSeries, activePort, aimsList, otherSeriesAimsList } = props;
  const { seriesUID, studyUID } = openSeries[activePort];
  let list = [];
  let header = [];
  let studyAimsList = [];

  useEffect(() => {
    const { openSeries, activePort } = props;
    setPresentImgID(openSeries[activePort].imageID);
  }, [props.openSeries])

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
      handleJumpToAim(aimID, index);
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

  if (otherSeriesAimsList[studyUID]) {
    const otherSeriesAims = Object.values(otherSeriesAimsList[studyUID]);
    header.push(
      <th
        className="annsLink-table __header --cell"
        key="anns-header"
        id="annsHeader"
      >
        Other  Annotations
      </th>,
    );

    // aim => series
    console.log(" ====>     console.log(otherSeriesAims");
    console.log(otherSeriesAims);

    otherSeriesAims.forEach((series, i) => {
      console.log(' ----> series');
      console.log(series);
      series[2].forEach((aim, index) => {
        const commentArr = aim.comment.split('/');
        const slideNo = commentArr[2] || "";
        const seriesIndex = commentArr[3] || "";

        // const imgIDs = Object.keys(aim.imgIDs);
        // let imgMatches = false;
        // imgIDs.forEach(el => {
        //   if (presentImgID && presentImgID.includes(el)) { imgMatches = true; }
        // })
        // const color = imgMatches && aim.color ? aim.color.button.background : null

        studyAimsList.push((
          // <tr key={aim.aimID} className="annsLink-table __tbody --row" style={{ background: color }}>
          <tr key={aim.aimID} className="annsLink-table __tbody --row">
            <td
              data-id={aim.aimID}
              data-serie={seriesUID}
              onClick={(e) => displayAnnotations(e, aim)}
              className="annsLink-table __tbody --cell"
            >
              {aim.name}
            </td>
            <td className="annsLink-table __tbody --cell">{slideNo || seriesIndex ? `${slideNo} / ${seriesIndex}` : null}</td>
          </tr>
        ))

      })
    });

  }

  if (list.length === 0 && studyAimsList.length === 0) return ("");

  return (
    <React.Fragment>
      {aimsList[seriesUID] && (
        <table className="annsLink-table">
          {/* <thead className="annsLink-table __header">
            <tr className="annsLink-table __header --row" >{header[0]}</tr>
          </thead> */}
          {/* <tbody className="annsLink-table __tbody" style={{ backgroundColor: '#333' }}>{list}</tbody> */}
        </table>
      )}
      {otherSeriesAimsList[studyUID] && (
        <table className="annsLink-table">
          <thead className="annsLink-table __header">
            <tr className="annsLink-table __header --row" >{header[0]}</tr>
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
