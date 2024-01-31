import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
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
    console.log(" studyExist && hasDescription with filled", studyExist, hasDescription);
    // if the currrent series is multiframe 
      // in the series annotation get aimID - lookup in framedata
      // get index 0 from the array
      // split it by /frames/
      // first part is the imageid look up in multiframemap if it has value it means it is amultiframe
    // check if all the seriesUID's are same
    // if same get series all series from scratch
    // if there are different series 

    if (studyExist && hasDescription) {
      let series = data[projectID][patientID][studyUID];
      console.log(" +++++ series", series);
      series = series?.filter(isSupportedModality);
      setSeriesList(series);
    } else {
      setLoading(true);
      const shouldFill = props.index === 0 || !hasDescription ? true : !otherSeriesOpened(props.openSeries, props.index);
      if (studyExist && shouldFill && studyUID && projectID && patientID) {
        props.dispatch(getSeriesAdditional({studyUID, projectID, patientID}))
      } else {
        getSeries(projectID, patientID, studyUID).then(res => {
          console.log(' --->  dropdown fresh data', res.data);
          props.dispatch(setSeriesData(projectID, patientID, studyUID, res.data, true));
          setLoading(false);
        }).catch((err) => console.error(err));
      }
    }
  }, [props.seriesData]);

  const handleSelect = (e) => {
    const UIDArr = e.split("_");
    const seriesUIDFmEvent = UIDArr[0];
    const multiFrameIndex = UIDArr[1];
    const { seriesUID } = props.openSeries[props.activePort];

    if (multiFrameIndex === undefined) {
      const serie = seriesList.find((element) => element.seriesUID == e);
      if (props.isAimEditorShowing) {
        // if (!props.onCloseAimEditor(true))
        //     return;
      }
      // props.onSelect(0, props.activePort, true);
      props.dispatch(replaceInGrid(serie));
      const list = seriesList.length > 0 ? seriesList : null;
      props.dispatch(getSingleSerie(serie, null, null, list));
      window.dispatchEvent(
        new CustomEvent("serieReplaced", {
          detail: {
            viewportId: props.activePort,
            id: e,
            multiFrameIndex: parseInt(multiFrameIndex),
          },
        })
      );
    } else {
      props.onSelect(0, props.activePort, e);
      window.dispatchEvent(
        new CustomEvent("serieReplaced", {
          detail: {
            viewportId: props.activePort,
            id: e,
            multiFrameIndex: parseInt(multiFrameIndex),
          },
        })
      );
    }
    window.dispatchEvent(new CustomEvent("deleteViewportWL"));
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
            } = series;

            let uniqueKey = seriesUID;
            
            const openSeriesSeriesUID =
              props.openSeries[props.activePort].seriesUID;
            const openSeriesMultiFrameIndex =
              props.openSeriesAddition[props.activePort].multiFrameIndex;
            if (multiFrameImage) {
              const currentIndex = mfIndex[seriesUID] ? mfIndex[seriesUID] + 1  : 1;
              mfIndex[seriesUID] = currentIndex;
              uniqueKey = `${seriesUID}_${currentIndex}`;
            }  

            let isCurrent;
            if (!multiFrameImage) {
              isCurrent =
                openSeriesSeriesUID === uniqueKey && !openSeriesMultiFrameIndex;
            } else {
              const compound = `${openSeriesSeriesUID}_${openSeriesMultiFrameIndex}`;
              isCurrent = compound === uniqueKey;
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
