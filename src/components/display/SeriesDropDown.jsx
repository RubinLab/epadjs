import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { getStudyAims } from "../../services/studyServices";
import {
  replaceInGrid,
  getSingleSerie,
  clearActivePortAimID,
} from "components/annotationsList/action";
import { isSupportedModality } from "../../Utils/aid.js";

import "./SeriesDropDown.css";

const SeriesDropDown = (props) => {
  const [seriesList, setSeriesList] = useState([]);
  const [aimCounts, setAimCounts] = useState({});

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

    if (studyExist) {
      let series = data[projectID][patientID][studyUID];
      series = series?.filter(isSupportedModality);
      setSeriesList(series);
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
      props.onSelect(0, props.activePort);
      props.dispatch(replaceInGrid(serie));
      props.dispatch(getSingleSerie(serie));
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
        {seriesList &&
          seriesList.length &&
          seriesList.map((series, i) => {
            const {
              seriesDescription,
              numberOfAnnotations,
              seriesUID,
              seriesNo,
              multiFrameImage,
              numberOfFrames,
            } = series;
            const openSeriesSeriesUID =
              props.openSeries[props.activePort].seriesUID;
            const openSeriesMultiFrameIndex =
              props.openSeries[props.activePort].multiFrameIndex;
            const uniqueKey = multiFrameImage ? `${seriesUID}_${i}` : seriesUID;
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
      </DropdownButton>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    seriesData: state.annotationsListReducer.seriesData,
  };
};
export default connect(mapStateToProps)(SeriesDropDown);
