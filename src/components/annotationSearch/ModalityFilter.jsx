import React, { useState, useEffect } from 'react';
import { DISP_MODALITIES as dispModalities, COMP_MODALITY_VALS as compModality } from "../../constants.js";
import Dropdown from 'react-bootstrap/Dropdown';

const ModalityFilter = (props) => {
    const [modalities,] = useState([...dispModalities, "PET-CT", "PET-MR", "US-RF"]);
    const [selecteds, setSelecteds] = useState(props.selectedMods);
    const [show, setShow] = useState(false);

    useEffect(() => {
        window.addEventListener('click', clickHandler);
        return () => { window.removeEventListener('click', clickHandler) }
    });

    const clickHandler = (e) => {
        if (e.target.id !== 'modalityDrop' && e.target.id !== 'modalityTog' && e.target.id !== 'noClose')
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
        const { setSelectedMods } = props;
        setSelectedMods(selecteds);
        setShow(false);
    }

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <button id='modalityTog' type="button" className="btn btn-dark btn-sm dropdown-toggle color-schema" ref={ref}
            onClick={(e) => {
                setSelecteds(props.selectedMods);
                e.preventDefault();
                handleToggle();
            }}>
            {children}
        </button>
    ));

    const breakIntoArrayOfArrays = (array, chunk = 3) => {
        let result = [];
        let i = 0;
        for (i = 0; i < array.length; i += chunk) {
            result.push(array.slice(i, i + chunk))
        }
        return result;
    }

    const modalities2D = breakIntoArrayOfArrays(modalities);

    const CustomMenu = React.forwardRef(({ children, className, id }, ref) => {
        return (<div id={id} className={className} ref={ref}>
            {children}
        </div>
        )
    },);

    const handleToggle = () => {
        setShow(!show)
    }

    return (
        <Dropdown id='modalityTog' className="d-inline mx-1" show={show}>
            <Dropdown.Toggle as={CustomToggle}>
                Modality
            </Dropdown.Toggle>
            <Dropdown.Menu id='modalityDrop' as={CustomMenu} className="p-2 dropdown-menu-dark modality">
                {modalities2D?.map((modalities, y) => {
                    return (
                        <div key={y} className="row">
                            {modalities.map((modality, i) => {
                                return (
                                    <div id='noClose' key={i} className="mb-3 col-md-4">
                                        <input id='noClose' className="form-check-input" type="checkbox" value={compModality[modality] ? compModality[modality] : modality} checked={selecteds.includes(compModality[modality] ? compModality[modality] : modality)} onChange={handleChange} />
                                        <label id='noClose' className="form-check-label title-case" style={{ paddingLeft: '0.3em' }} htmlFor="noCLose">
                                            {modality}
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

export default ModalityFilter;