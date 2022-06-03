import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { getAllowedTermsOfTemplateComponent } from "Utils/aid"
import { teachingFileTempCode } from '../../constants.js';
import Dropdown from 'react-bootstrap/Dropdown';
// import "./SubSpecialtyFilter.css";

const componentLabel = "Radiology Specialty";

const SubSpecialityFilter = props => {

    const [subSpecialities, setSubSpecialities] = useState([]);
    const [selecteds, setSelecteds] = useState(props.selectedSubs);
    const [firstRun, setFirstRun] = useState(true);
    const [show, setShow] = useState(false);

    function getSubSpecialities() {
        const { Template } = props?.templates[teachingFileTempCode]?.TemplateContainer;
        return getAllowedTermsOfTemplateComponent(Template, componentLabel);
    }

    useEffect(() => {
        window.addEventListener('click', clickHandler);
        return () => { window.removeEventListener('click', clickHandler) }
    });

    const clickHandler = (e) => {
        if (!document.getElementById('subSpecDrop').contains(e.target) && e.target.id !== 'subSpecDrop')
            setShow(false);
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
        setShow(false);
    }

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <button id='subSpecDrop' type="button" className="btn btn-dark btn-sm dropdown-toggle" ref={ref}
            onClick={(e) => {
                if (firstRun) {
                    setSubSpecialities(getSubSpecialities);
                    setFirstRun(false);
                }
                e.preventDefault();
                handleToggle();
            }}>
            {children}
        </button>
    ));

    const breakIntoArrayOfArrays = (array, chunk = 2) => {
        let result = [];
        let i = 0;
        for (i = 0; i < array.length; i += chunk) {
            result.push(array.slice(i, i + chunk))
        }
        return result;
    }

    const subSpecialities2D = breakIntoArrayOfArrays(subSpecialities);

    const handleToggle = () => {
        if (show)
            setShow(false)
        else
            setShow(true)
    }

    return (
        <Dropdown id='subSpecDrop' className="d-inline mx-2" show={show} >
            <Dropdown.Toggle as={CustomToggle}>
                Subspecialty
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 dropdown-menu-dark subspecialty" >
                {subSpecialities2D?.map((specialities, y) => {
                    return (
                        <div key={y} className="row">
                            {specialities.map((speciality, i) => {
                                return (
                                    <div key={i} className="mb-3 col-md-6">
                                        <input className="form-check-input filter-input" type="checkbox" value={speciality} id="flexCheckDefault" checked={selecteds.includes(speciality)} onChange={handleChange} />
                                        <label className="form-check-label title-case" htmlFor="flexCheckDefault">
                                            {speciality}
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })
                }
                <div style={{ float: 'right', marginRight: '1em' }}>
                    <button className='btn btn-dark btn-sm' onClick={handleApply}>Apply</button>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}

const mapStateToProps = state => {
    return {
        templates: state.annotationsListReducer.templates,
    };
};

export default connect(mapStateToProps)(SubSpecialityFilter);