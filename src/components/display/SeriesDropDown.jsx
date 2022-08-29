
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { getSeries } from '../../services/seriesServices';
import { addStudyToGrid } from 'components/annotationsList/action';

const SeriesDropDown = (props) => {
    const [seriesList, setSeriesList] = useState([]);
    const [firstRun, setFirstRun] = useState(true);

    useEffect(() => {
        if (!firstRun)
            return;
        const { openStudies, studyUID, projectID, patientID } = props.serie;
        async function fetchData() {
            const { data: seriesOfStudy } = await getSeries(projectID, patientID, studyUID);
            return seriesOfStudy;
        }
        if (openStudies && openStudies.hasOwnProperty(studyUID)) {
            setSeriesList(openStudies[studyUID]);
            setFirstRun(false);
        }
        else {
            fetchData().then(result => {
                console.log("restuls", result);
                props.dispatch(addStudyToGrid({ [studyUID]: result }));
                setSeriesList(result);
            });
            setFirstRun(false);
        }
    });

    return (
        <div>
            <DropdownButton
                key='1'
                id={`dropdown-button-drop-1`}
                size="sm"
                variant="secondary"
                title="Other Series"
            >
                {seriesList && seriesList.length && seriesList.map(({ seriesDescription, i }) => {
                    return (<Dropdown.Item eventKey={i}>{seriesDescription?.length ? seriesDescription : "No Description"}</Dropdown.Item>);
                })}
            </DropdownButton>
        </div >
    );
}

const mapStateToProps = (state) => {
    return {
        openStudies: state.annotationsListReducer.openStudies,
    };
};
export default (connect(mapStateToProps)(SeriesDropDown));