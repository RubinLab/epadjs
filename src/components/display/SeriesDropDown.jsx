
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { getStudyAims } from '../../services/studyServices';
import { getSeries } from '../../services/seriesServices';
import { addStudyToGrid, replaceInGrid, getSingleSerie, clearActivePortAimID } from 'components/annotationsList/action';
import { isSupportedModality } from "../../Utils/aid.js";

import "./SeriesDropDown.css";


const SeriesDropDown = (props) => {
    const [seriesList, setSeriesList] = useState([]);
    const [aimCounts, setAimCounts] = useState({});

    useEffect(() => {
        let studyUID;
        let projectID;
        let patientID;

        if (props.serie) {
            studyUID = props.serie.studyUID;
            projectID = props.serie.projectID;
            patientID = props.serie.patientID;
        }
        const { openStudies } = props;
        // async function fetchData() {
        //     const { data: seriesOfStudy } = await getSeries(projectID, patientID, studyUID);
        //     return seriesOfStudy;
        // }
        if (openStudies && openStudies.hasOwnProperty(studyUID)) {
            let series = openStudies[studyUID];

            // if (props.multiFrameData.length > 0) {
            //     series = [...series, ...props.multiFrameData];
            series = series.filter(isSupportedModality);
            // }
            setSeriesList(series);
        }
        // else {
        //     
        //     fetchData().then(result => {
        //         props.dispatch(addStudyToGrid({ [studyUID]: result }));
        //     });
        // }
    }, [props.openStudies]);

    const handleSelect = (e) => {
        const UIDArr = e.split('_');
        // console.log(e);
        const seriesUIDFmEvent = UIDArr[0];
        const multiFrameIndex = UIDArr[1];
        console.log(" ---> multiFrameIndex", UIDArr, multiFrameIndex);
        const { seriesUID } = props.openSeries[props.activePort];

        // if (seriesUID === seriesUIDFmEvent) return;

        if (multiFrameIndex === undefined) {
            const serie = seriesList.find(element => element.seriesUID == e);
            if (props.isAimEditorShowing) {
                // if (!props.onCloseAimEditor(true))
                //     return;
            }
            props.onSelect(0, props.activePort);
            props.dispatch(replaceInGrid(serie));
            props.dispatch(getSingleSerie(serie));
            window.dispatchEvent(
                new CustomEvent("serieReplaced", {
                    // detail: props.activePort
                    detail: {
                        viewportId: props.activePort,
                        id: e,
                        multiFrameIndex: parseInt(multiFrameIndex)
                    }
                })
            );
        } else {
            console.log(" ----> in else")
            props.onSelect(0, props.activePort, e);
            window.dispatchEvent(
                new CustomEvent("serieReplaced", {
                    detail: {
                        viewportId: props.activePort,
                        id: e,
                        multiFrameIndex: parseInt(multiFrameIndex)
                    }
                })
            );
        }
        window.dispatchEvent(new CustomEvent('deleteViewportWL'));
    }

    // const handleToggle = (show) => {
    //     if (!show)
    //         return;
    //     const { studyUID, projectID, patientID } = props.serie;
    //     const isCountQuery = true;
    //     const { data: aimCounts } = await getStudyAims(patientID, studyUID, projectID, isCountQuery);
    //     setAimCounts(aimCounts);
    // }

    return (
        <div>
            <DropdownButton
                // onToggle={handleToggle}
                key='button'
                id={`dropdown-button-drop-1`}
                size="sm"
                variant="secondary"
                title="Series"
                data-tip
                data-for="dropdownOtherSeries"
            >
                {seriesList && seriesList.length && seriesList.map(({ seriesDescription, numberOfAnnotations, seriesUID, seriesNo, multiFrameImage, numberOfFrames }, i) => {
                    let isCurrent = props.openSeries[props.activePort].seriesUID === seriesUID;
                    let counts = numberOfAnnotations ? `${numberOfAnnotations} Ann -` : "";
                    const uniqueKey = multiFrameImage ? `${seriesUID}_${i}` : seriesUID;
                    return (<Dropdown.Item key={uniqueKey} eventKey={uniqueKey} onSelect={handleSelect} style={{ textAlign: "left !important" }}>{seriesNo ? seriesNo : "#NA"} {' - '} {counts} {seriesDescription?.length ? seriesDescription : "No Description"} {multiFrameImage ? `(${numberOfFrames})` : ``} {isCurrent ? "(Current)" : ""}</Dropdown.Item>);
                })}
            </DropdownButton>
        </div >
    );
}

const mapStateToProps = (state) => {
    return {
        openStudies: state.annotationsListReducer.openStudies,
        openSeries: state.annotationsListReducer.openSeries,
        activePort: state.annotationsListReducer.activePort,
    };
};
export default (connect(mapStateToProps)(SeriesDropDown));