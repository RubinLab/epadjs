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
} from "../action";
import "../annotationsList.css";

const handleJumpToAim = (aimId, index, imageID, frame) => {
  const frameNo = frame - 1;
  window.dispatchEvent(
    new CustomEvent("jumpToAimImage", {
      detail: { aimId, index, imageID, frameNo },
    })
  );
};

const annotationsLink = (props) => {
  const [presentImgID, setPresentImgID] = useState("");
  const { openSeries, activePort, aimsList, otherSeriesAimsList } = props;
  const { seriesUID, studyUID, projectID } = openSeries[activePort];
  let studyAimsList = [];

  useEffect(() => {
    const { openSeries, activePort } = props;
    setPresentImgID(openSeries[activePort].imageID);
  }, [props.openSeries, props.aimsList]);

  const checkIfSerieOpen = (selectedSerie, imgIDs) => {
    let isOpen = false;
    let index = null;
    let frameNo = null;
    let mfIndex = null;
//     Check if there is same seriesuid
// İf there is same uid check if it has multiframeMap or hasMultiframe or multiframeIndex
// If there is find the image id of the aim clicked
// From the multiframemap find it’s index
// İf the index is the same with the openseriesAddition return true
// Else return false 
    props.openSeriesAddition.forEach((serie, i) => {
      // console.log(" +++serie.seriesUID === selectedSerie", serie.seriesUID === selectedSerie)
      if (serie.seriesUID === selectedSerie) {
        if (serie.hasMultiframe || serie.multiFrameMap || serie.multiFrameIndex) {
          const keysArr = Object.keys(imgIDs);
          for (let k = 0; k < keysArr.length; k++) {
            const imgID = keysArr[k].split('/frames/')[0];
            const mfIndex = serie.multiFrameMap && serie.multiFrameMap[imgID];
            if ((mfIndex === true && serie.hasMultiframe && !serie.multiFrameIndex) || mfIndex === serie.multiFrameIndex) {
              isOpen = true;
              index = i;
              break;
            }
          }
        } else {
          isOpen = true;
          index = i;
        }
      }
    });
    return { isOpen, index };
  };

  const getExistingSeriesData = (serie) => {
    const { projectID, patientID, studyUID } = serie;
    const { seriesData } = props;
    const dataExists =
        seriesData[projectID] &&
        seriesData[projectID][patientID] &&
        seriesData[projectID][patientID][studyUID] &&
        seriesData[projectID][patientID][studyUID].list;

    const existingData = dataExists
      ? seriesData[projectID][patientID][studyUID].list
      : null;
    return existingData;
  }

  const displayAnnotations = (e, selected) => {
    const { openSeriesAddition, activePort } = props;
    const maxPort = parseInt(sessionStorage.getItem("maxPort"));

    let isGridFull = openSeries.length === maxPort;
    const { isOpen, index } = checkIfSerieOpen(selected.seriesUID, selected.imgIDs);

    console.log(" ++++++ isOpen, index ", isOpen, index);

    if (isOpen) {
      const imageUID = Object.keys(selected.imgIDs);
      const imgIDArr = imageUID[0].split("/frames/");
      props.dispatch(changeActivePort(index));
      // No need to change
      props.dispatch(jumpToAim(selected.seriesUID, selected.aimID, index));
      // change the arguments to handle the multiframe
      handleJumpToAim(selected.aimID, index, imgIDArr[0], imgIDArr[1]);
      props.dispatch(clearSelection());
    } else {
      if (isGridFull) {
        props.dispatch(addToGrid(selected, selected.aimID, props.activePort));
      } else {
        props.dispatch(addToGrid(selected, selected.aimID));
      }
      const list = getExistingSeriesData(selected);
      console.log("list --->", list);
      props
        .dispatch(getSingleSerie(selected, selected.aimID, null, list))
        .then(() => {})
        .catch((err) => console.error(err));
      props.dispatch(clearSelection());
    }
  };

  const getSeriesNo = (uids) => {
    const {projectID, patientID, studyUID, seriesUID} = uids;
    const projectExists = props.seriesData[projectID]; 
    const patientExists = projectExists && props.seriesData[projectID][patientID];
    const studyExists = patientExists && props.seriesData[projectID][patientID][studyUID];
    let no = null;
    if (studyExists) {
      props.seriesData[projectID][patientID][studyUID].list.forEach(el => {
        if (el.seriesUID === seriesUID) no = el.seriesNo;
      })
    }
    return no;
  }

  const renderUI = () => {
    if (otherSeriesAimsList[projectID][studyUID]) {
      const otherSeriesAims = Object.values(
        otherSeriesAimsList[projectID][studyUID]
      );
      if (otherSeriesAims) {
        otherSeriesAims.forEach((series, i) => {
          const seriesList = [];
          series[2].forEach((aim, index) => {
            let ind = typeof aim.name === 'string' ? aim.name.indexOf("~") : -1;
            let aimName = ind >= 0 ? aim.name.substring(0, ind) : aim.name;
            const autoGeneratedComment = aim.comment.split("~~");
            const commentArr = autoGeneratedComment[0].split("/");
            let slideNo = commentArr[2];
            slideNo = typeof slideNo === 'string' && !isNaN(parseInt(slideNo.trim())) ? parseInt(slideNo.trim()) : null;
            const seriesIndex = getSeriesNo(aim);

            const imgIDs = Object.keys(aim?.imgIDs);
            let imgMatches = false;

            imgIDs.forEach((el) => {
              if (presentImgID && el === presentImgID) imgMatches = true;
            });
            const color =
              imgMatches &&
              aimsList[aim.seriesUID] &&
              aimsList[aim.seriesUID][aim.aimID]
                ? aimsList[aim.seriesUID][aim.aimID]?.color.button.background
                : null;
            seriesList.push(
              <li
                style={{
                  background: color,
                  listStyleType: "none",
                  cursor: "pointer",
                }}
                onClick={(e) => displayAnnotations(e, aim)}
              >
                {aimName}
                <span className="img-labels">
                  {slideNo &&
                  <span className="img-num">
                    {" "}
                    {slideNo ? `${slideNo}` : null}
                  </span> }
                  <span className="img-ser">
                    {seriesIndex ? `${seriesIndex}` : null}
                  </span>
                </span>
              </li>
            );
          });
          studyAimsList.push(<ul className="series">{seriesList}</ul>);
        });
      }
    }

    if (studyAimsList.length === 0) return "";
    else return studyAimsList;
  };

  return (
    <React.Fragment>
      {otherSeriesAimsList[projectID] &&
        otherSeriesAimsList[projectID][studyUID] && (
          <div>
            <div className="other-annotations"> Other Annotations</div>
            <div className="annotation-back">
              <p className="img-label">Image / Series</p>
              {renderUI()}
            </div>
          </div>
        )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    openSeriesAddition: state.annotationsListReducer.openSeriesAddition,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList,
    otherSeriesAimsList: state.annotationsListReducer.otherSeriesAimsList,
    seriesData: state.annotationsListReducer.seriesData
  };
};
export default connect(mapStateToProps)(annotationsLink);
