
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { getSeries } from '../../services/seriesServices';
import { addStudyToGrid, replaceInGrid, getSingleSerie, clearActivePortAimID } from 'components/annotationsList/action';
import "./SeriesDropDown.css";

const SeriesDropDown = (props) => {
    const [seriesList, setSeriesList] = useState([]);

    useEffect(() => {
        const { studyUID, projectID, patientID } = props.serie;
        const { openStudies } = props;
        async function fetchData() {
            const { data: seriesOfStudy } = await getSeries(projectID, patientID, studyUID);
            return seriesOfStudy;
        }
        if (openStudies && openStudies.hasOwnProperty(studyUID)) {
            setSeriesList(openStudies[studyUID]);
        }
        else {
            fetchData().then(result => {
                props.dispatch(addStudyToGrid({ [studyUID]: result }));
            });
        }
    }, [props.openStudies]);

    const handleSelect = (e) => {
        if (props.openSeries[props.activePort].seriesUID === e)
            return;
        const serie = seriesList.find(element => element.seriesUID == e);
        if (props.isAimEditorShowing) {
            // if (!props.onCloseAimEditor(true))
            //     return;
        }
        props.dispatch(replaceInGrid(serie));
        props.dispatch(getSingleSerie(serie));
        window.dispatchEvent(
            new CustomEvent("serieReplaced", {
                detail: props.activePort
            })
        );
    }

    return (
        <div>
            <DropdownButton
                key='button'
                id={`dropdown-button-drop-1`}
                size="sm"
                variant="secondary"
                title="Other Series"
            >
                {seriesList && seriesList.length && seriesList.map(({ seriesDescription, seriesUID, seriesNo, i }) => {
                    let isCurrent = props.openSeries[props.activePort].seriesUID === seriesUID;
                    return (<Dropdown.Item key={i} eventKey={seriesUID} onSelect={handleSelect} style={{ textAlign: "left !important" }}>{seriesNo ? seriesNo : "#NA"}  {seriesDescription?.length ? seriesDescription : "No Description"} {isCurrent ? "(Current)" : ""}</Dropdown.Item>);
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