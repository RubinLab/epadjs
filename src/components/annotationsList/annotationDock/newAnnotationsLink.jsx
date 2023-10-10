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
  let studyAimsList = [];

  useEffect(() => {
    const { openSeries, activePort } = props;
    setPresentImgID(openSeries[activePort].imageID);
  }, [props.openSeries, props.aimsList])

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
    console.log(' ---> selected');
    console.log(selected);
    const maxPort = parseInt(sessionStorage.getItem('maxPort'));

    let isGridFull = openSeries.length === maxPort;
    const { isOpen, index } = checkIfSerieOpen(selected.seriesUID);

    if (isOpen) {
      props.dispatch(changeActivePort(index));
      props.dispatch(jumpToAim(selected.seriesUID, selected.aimID, index));
      handleJumpToAim(selected.aimID, index);
      props.dispatch(clearSelection());
    } else {
      if (isGridFull) {
        props.dispatch(addToGrid(selected, selected.aimID, props.activePort));
      } else {
        props.dispatch(addToGrid(selected, selected.aimID));
      }
      props
        .dispatch(getSingleSerie(selected, selected.aimID))
        .then(() => { })
        .catch(err => console.error(err));
      props.dispatch(clearSelection());
    }
  };

  const renderUI = () => {
    if (otherSeriesAimsList[studyUID]) {
      const otherSeriesAims = Object.values(otherSeriesAimsList[studyUID]);
      if (otherSeriesAims) {
        otherSeriesAims.forEach((series, i) => {
          const seriesList = [];
          // console.log(" ======= aimsList")
          // console.log(aimsList);
          // console.log(" =======")
          series[2].forEach((aim, index) => {
            const commentArr = aim?.comment.split('/');
            const slideNo = commentArr[2] || "";
            const seriesIndex = commentArr[3] || "";

            const imgIDs = Object.keys(aim?.imgIDs);
            let imgMatches = false;
            imgIDs.forEach(el => {
              if (presentImgID && presentImgID.includes(el)) imgMatches = true;

            })
            const color = imgMatches && aimsList[aim.seriesUID] && aimsList[aim.seriesUID][aim.aimID] ? aimsList[aim.seriesUID][aim.aimID]?.color.button.background : null;
            seriesList.push((
              <li style={{ background: color, listStyleType: 'none', cursor: 'pointer' }}
                onClick={(e) => displayAnnotations(e, aim)}
              >
                {aim.name}
                <span className="img-labels">
                  <span className="img-num">  {slideNo ? `${slideNo}` : null}</span>
                  <span className="img-ser">{seriesIndex ? `${seriesIndex}` : null}</span>
                </span>
              </li>
            ))

          })
          studyAimsList.push((<ul className='series'>{seriesList}</ul>))
        });
      }
    }

    if (studyAimsList.length === 0) return ("");
    else return studyAimsList;
  }

  return (
    <React.Fragment>
      {otherSeriesAimsList[studyUID] && (
        <div>
          <div className="other-annotations"> Other Annotations</div>
          <div className="annotation-back" >
            <p className="img-label">Image / Series</p>
            {renderUI()}
            {/* <ul>{studyAimsList}</ul> */}
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
