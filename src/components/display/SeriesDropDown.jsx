
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ReactTooltip from "react-tooltip";
import { TbStack2 } from "react-icons/tb";
import { getStudyAims } from '../../services/studyServices';
import { getSeries } from '../../services/seriesServices';
import { addStudyToGrid, replaceInGrid, getSingleSerie, clearActivePortAimID } from 'components/annotationsList/action';
import "./SeriesDropDown.css";


const SeriesDropDown = (props) => {
    const [seriesList, setSeriesList] = useState([]);
    const [aimCounts, setAimCounts] = useState({});

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

    const handleToggle = async (show) => {
        if (!show)
            return;
        const { studyUID, projectID, patientID } = props.serie;
        const isCountQuery = true;
        const { data: aimCounts } = await getStudyAims(patientID, studyUID, projectID, isCountQuery);
        setAimCounts(aimCounts);
    }

    return (
        <div>
            <DropdownButton
                onToggle={handleToggle}
                key='button'
                id={`dropdown-button-drop-1`}
                size="sm"
                variant="secondary"
                // title="Other Series"
                title={<TbStack2 />}
                data-tip
                data-for="dropdownOtherSeries"
            >
                {seriesList && seriesList.length && seriesList.map(({ seriesDescription, seriesUID, seriesNo, i }) => {
                    let isCurrent = props.openSeries[props.activePort].seriesUID === seriesUID;
                    let counts = aimCounts[seriesUID] ? `- ${aimCounts[seriesUID]} Ann -` : ""
                    return (<Dropdown.Item key={seriesUID} eventKey={seriesUID} onSelect={handleSelect} style={{ textAlign: "left !important" }}>{seriesNo ? seriesNo : "#NA"} {counts} {seriesDescription?.length ? seriesDescription : "No Description"} {isCurrent ? "(Current)" : ""}</Dropdown.Item>);
                })}
            </DropdownButton>
            <ReactTooltip
                id="dropdownOtherSeries"
                place="bottom"
                type="info"
                delayShow={200}
            >
                <span>Other Series</span>
            </ReactTooltip>
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