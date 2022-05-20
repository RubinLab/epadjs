import React, { useState } from 'react';
import { connect } from "react-redux";
import { getAllowedTermsOfTemplateComponent } from "Utils/aid"
import { teachingFileTempCode } from '../../constants.js';
import "./SubSpecialtyFilter.css";

const componentLabel = "Radiology Specialty";

const SubSpecialityFilter = props => {

    const [subSpecialities, setSubSpecialities] = useState(getSubSpecialities());
    const [selecteds, setSelecteds] = useState(props.selectedSubs);

    function getSubSpecialities() {
        const { Template } = props.templates[teachingFileTempCode].TemplateContainer;
        return getAllowedTermsOfTemplateComponent(Template, componentLabel);
    }

    const handleChange = (event) => {
        const { checked, value } = event.target;
        if (checked)
            setSelecteds([...selecteds, value]);
        else {
            let index = selecteds.indexOf(value);
            setSelecteds(selecteds.filter((_, i) => i !== index));
        }
    }

    const handleApply = () => {
        const { setSelectedSubs } = props;
        setSelectedSubs(selecteds);
        props.onClose();
    }

    return (
        <div className="mf-pop-up" >
            <div className="close-mf-menu" onClick={props.onClose}>
                <a href="#">X</a>
            </div>
            <div>
                {subSpecialities?.map((speciality, i) => {
                    return (
                        <label key={i}><input type="checkbox" value={speciality} checked={selecteds.includes(speciality)} onChange={handleChange} /> {speciality}</label>
                    )
                })
                }
            </div>
            <div>
                <button onClick={handleApply}>Apply</button>
            </div>
        </div >
    );
}

const mapStateToProps = state => {
    return {
        templates: state.annotationsListReducer.templates,
    };
};

export default connect(mapStateToProps)(SubSpecialityFilter);