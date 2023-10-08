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
        className="other-annotations"
        key="anns-header"
      >
        Other  Annotations
      </th>,
    );

    otherSeriesAims.forEach((series, i) => {
      series[2].forEach((aim, index) => {
        const commentArr = aim.comment.split('/');
        const slideNo = commentArr[2] || "";
        const seriesIndex = commentArr[3] || "";

        const imgIDs = Object.keys(aim.imgIDs);
        let imgMatches = false;
        imgIDs.forEach(el => {
          if (presentImgID && presentImgID.includes(el)) imgMatches = true;

        })
        const color = imgMatches ? aimsList[seriesUID][aim.aimID].color.button.background : null;

        studyAimsList.push((
          <li style={{ background: color, listStyleType: 'none' }}
            data-id={aim.aimID}
            data-serie={seriesUID}
            onClick={(e) => displayAnnotations(e, aim)}
          >
            <span>{aim.name}</span>
            <span >{slideNo || seriesIndex ? `${slideNo} / ${seriesIndex}` : null}</span>
          </li>
        ))

      })
    });

  }

  if (list.length === 0 && studyAimsList.length === 0) return ("");

  return (
    <React.Fragment>
      {otherSeriesAimsList[studyUID] && (
        <div>
          <div className="other-annotations"> Other Annotations</div>
          <div className="annotation-back" >
            <p className="img-label">Image / Series</p>
            <ul>{studyAimsList}</ul>
          </div>
        </div>
      )
      }
    </React.Fragment >
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
