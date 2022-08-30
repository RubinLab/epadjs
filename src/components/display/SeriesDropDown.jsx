
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { getSeries } from '../../services/seriesServices';
import { addStudyToGrid, replaceInGrid, getSingleSerie } from 'components/annotationsList/action';

const SeriesDropDown = (props) => {
    const [seriesList, setSeriesList] = useState([]);
    const [firstRun, setFirstRun] = useState(true);

    useEffect(() => {
        // console.log("neler oluyor");
        // if (!firstRun)
        //     return;
        const { studyUID, projectID, patientID } = props.serie;
        const { openStudies } = props;
        async function fetchData() {
            const { data: seriesOfStudy } = await getSeries(projectID, patientID, studyUID);
            return seriesOfStudy;
        }
        if (openStudies && openStudies.hasOwnProperty(studyUID)) {
            console.log("Didn't fetch results");
            setSeriesList(openStudies[studyUID]);
            // setFirstRun(false);
        }
        else {
            fetchData().then(result => {
                console.log("restuls", result);
                props.dispatch(addStudyToGrid({ [studyUID]: result }));
                // setSeriesList(result);
            });
            // setFirstRun(false);
        }
    }, [props.openStudies]);

    const handleSelect = (e) => {
        const serie = seriesList.find(element => element.seriesUID == e);
        console.log("Found serie", serie);
        props.dispatch(replaceInGrid(e));
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
                key='1'
                id={`dropdown-button-drop-1`}
                size="sm"
                variant="secondary"
                title="Other Series"
            >
                {seriesList && seriesList.length && seriesList.map(({ seriesDescription, seriesUID, i }) => {
                    return (<Dropdown.Item eventKey={seriesUID} onSelect={handleSelect}>{seriesDescription?.length ? seriesDescription : "No Description"}</Dropdown.Item>);
                })}
            </DropdownButton>
        </div >
    );
}

const mapStateToProps = (state) => {
    return {
        openStudies: state.annotationsListReducer.openStudies,
        activePort: state.annotationsListReducer.activePort,
    };
};
export default (connect(mapStateToProps)(SeriesDropDown));