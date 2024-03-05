import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import PropagateLoader from "react-spinners/PropagateLoader";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { getStudyAims } from "../../services/studyServices";
import { getSeries } from "../../services/seriesServices"
import {
  replaceInGrid,
  getSingleSerie,
  setSeriesData,
  getSeriesAdditional
} from "components/annotationsList/action";
import { isSupportedModality, otherSeriesOpened } from "../../Utils/aid.js";

import "./SeriesDropDown.css";

const SeriesDropDown = (props) => {
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  let mfIndex = {};

  const checkMultiframe = () => {
    const { openSeries, activePort, openSeriesAddition } = props;
    // if the currrent series is multiframe 
    const multiFrameFlag = openSeries[activePort].multiFrameImage;
    // in the series annotation get aimID - lookup in framedata
    let imageID =  openSeriesAddition[activePort].frameData && openSeriesAddition[activePort].frameData[openSeries[activePort].aimID];
    // get index 0 from the array and split it by /frames/
    imageID = imageID ? imageID[0].split('/frames/')[0] : '';
    // first part is the imageid look up in multiframemap if it has value it means it is amultiframe
    const isMultiFrameAim = imageID && openSeriesAddition[activePort].multiFrameMap ? openSeriesAddition[activePort].multiFrameMap[imageID] > 0: false;
    const multiframeDataExists = openSeriesAddition[activePort].hasMultiframe || openSeriesAddition[activePort].multiFrameIndex;
    return multiFrameFlag || isMultiFrameAim || multiframeDataExists;

  }

  const checkAllSameSeries = (list) => {
    const seriesUID = list[0].seriesUID
    for (let i = 1; i < list.length; i++) {
      if (list[i].seriesUID !== seriesUID) return false;
    }
    return true;
  }

  const mergeLists = (existingData, newList) => {
    const { list, map } = existingData;
    const result = [ ...list ];
    newList.forEach(el => {
      if (!map[el.seriesUID]) result.push(el);
    })
    return result;
  }

  const checkIfSerieOpen = (key) => {
    let isOpen = false;
    let index = null;
    const keyArr = key.split('_');
    const seriesUID = keyArr[0];
    const mfIndex = parseInt(keyArr[1]);
    for (let i = 0; i < props.openSeriesAddition.length; i++) {
      const serie = props.openSeriesAddition[i];
      if (serie.seriesUID === seriesUID) {
        if (serie.hasMultiframe || serie.multiFrameMap || serie.multiFrameIndex) {
            const stillImages = mfIndex === 0 && serie.hasMultiframe && serie.multiFrameIndex === null;         
            if (stillImages || mfIndex === serie.multiFrameIndex) {
              isOpen = true;
              index = i;
              break
            }
        } else {
          isOpen = true;
          index = i;
        }
      }
    };
    return { isOpen, index };
  };

  useEffect(() => {
    let studyUID;
    let projectID;
    let patientID;

    const data = props.seriesData;
    if (props.serie) {
      studyUID = props.serie.studyUID;
      projectID = props.serie.projectID;
      patientID = props.serie.patientID;
    }
    const studyExist =
      data[projectID] &&
      data[projectID][patientID] &&
      data[projectID][patientID][studyUID];

    const list = studyExist ? data[projectID][patientID][studyUID].list : null
    const isString = (currentValue) => currentValue.seriesDescription === '' || typeof currentValue.seriesDescription === 'string';
    const isFilled= (currentValue) => currentValue.filled || currentValue.multiFrameImage;
    const hasDescription = list ? list.every(isFilled) : false;

    if (checkMultiframe() && studyExist && checkAllSameSeries(data[projectID][patientID][studyUID].list) && !data[projectID][patientID][studyUID].mfMerged) {
      getSeries(projectID, patientID, studyUID).then(res => {
        const newList = mergeLists(data[projectID][patientID][studyUID], res.data);
        props.dispatch(setSeriesData(projectID, patientID, studyUID, newList, true, true));
        setLoading(false);
      }).catch((err) => console.error(err));
    } if (studyExist && hasDescription) {
      let series = data[projectID][patientID][studyUID].list;
      series = series?.filter(isSupportedModality);
      setSeriesList(series);
    } else {
      setLoading(true);
      const shouldFill = props.index === 0 || !hasDescription ? true : !otherSeriesOpened(props.openSeries, props.index);
      if (studyExist && shouldFill && studyUID && projectID && patientID) {
        props.dispatch(getSeriesAdditional({studyUID, projectID, patientID}))
      } else {
        getSeries(projectID, patientID, studyUID).then(res => {
          props.dispatch(setSeriesData(projectID, patientID, studyUID, res.data, true));
          setLoading(false);
        }).catch((err) => console.error(err));
      }
    }
  }, [props.seriesData]);

  const handleSelect = (e) => {
    const UIDArr = e.split("_");
    const seriesUIDFmEvent = UIDArr[0];
    const multiFrameIndex = UIDArr[1] ? parseInt(UIDArr[1]) : null;
    const { seriesUID } = props.openSeries[props.activePort];

    // if (multiFrameIndex === undefined) {
      const serie = seriesList.find((element) => element.seriesUID === seriesUIDFmEvent);

      if ( multiFrameIndex ) serie.multiFrameIndex = multiFrameIndex;
      else serie.multiFrameIndex = null;

      if (props.isAimEditorShowing) {
        // if (!props.onCloseAimEditor(true))
        //     return;
      }
      const { isOpen, index } = checkIfSerieOpen(e);

      if (!isOpen) {
        props.onSelect(0, props.activePort, true);
        props.dispatch(replaceInGrid(serie));
        const list = seriesList.length > 0 ? seriesList : null;
        props.dispatch(getSingleSerie(serie, null, null, list));
        window.dispatchEvent(
          new CustomEvent("serieReplaced", {
            detail: {
              viewportId: props.activePort,
              id: e,
              multiFrameIndex: parseInt(multiFrameIndex)
            },
          })
        );
        window.dispatchEvent(new CustomEvent("deleteViewportWL"));
      } else {
        toast.info(`This series is already open at viewport ${index + 1}`);
      }
  };

  return (
    <div>
      <DropdownButton
        // onToggle={handleToggle}
        key="button"
        id={`dropdown-button-drop-1`}
        size="sm"
        variant="secondary"
        title="Series"
        data-tip
        data-for="dropdownOtherSeries"
      >
      {loading && seriesList.length === 0 && <div class="spinner-border" role="status" style={{'height': '12px', 'width': '12px', 'fontSize': '8px', 'marginRight': '10px', 'marginLeft': '10px'}}/>} 
      {<div style={{maxHeight: `${props.height - 50}px`, overflow: 'auto'}}
>
        {seriesList &&
          seriesList.length > 0 &&
          seriesList.map((series, i) => {
            const {
              seriesDescription,
              numberOfAnnotations,
              seriesUID,
              seriesNo,
              multiFrameImage,
              numberOfFrames,
              multiFrameIndex
            } = series;

            let uniqueKey = seriesUID;
            
            const openSeriesSeriesUID =
              props.openSeries[props.activePort].seriesUID;
            const openSeriesMultiFrameIndex =
              props.openSeriesAddition[props.activePort].multiFrameIndex;
            // if (multiFrameImage || multiFrameIndex) {
              const currentIndex = mfIndex[seriesUID] >= 0 ? mfIndex[seriesUID] + 1  : 0;
              mfIndex[seriesUID] = currentIndex;
              uniqueKey = `${seriesUID}_${currentIndex}`;
            // }  

            let isCurrent;
            if (multiFrameImage || multiFrameIndex) {
              const compound = `${openSeriesSeriesUID}_${openSeriesMultiFrameIndex}`;
              isCurrent = compound === uniqueKey;
            } else {
              isCurrent =
              `${openSeriesSeriesUID}_${currentIndex}` === uniqueKey && !openSeriesMultiFrameIndex;
              // openSeriesSeriesUID === uniqueKey;
            }

            let counts = numberOfAnnotations
              ? `${numberOfAnnotations} Ann -`
              : "";

            return (
                <Dropdown.Item
                  key={uniqueKey}
                  eventKey={uniqueKey}
                  onSelect={handleSelect}
                  style={{ textAlign: "left !important" }}
                  >
                  {seriesNo ? seriesNo : "#NA"} {" - "} {counts}{" "}
                  {seriesDescription?.length
                    ? seriesDescription
                    : "No Description"}{" "}
                  {multiFrameImage ? `(${numberOfFrames})` : ``}{" "}
                  {isCurrent ? "(Current)" : ""}
                </Dropdown.Item>
            );
          })}
      </div>}
      </DropdownButton>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    seriesData: state.annotationsListReducer.seriesData,
    openSeriesAddition: state.annotationsListReducer.openSeriesAddition
  };
};
export default connect(mapStateToProps)(SeriesDropDown);
