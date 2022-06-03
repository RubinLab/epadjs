import React, { useState } from 'react';
import { DISP_MODALITIES as dispModalities } from "../../constants.js";
import Dropdown from 'react-bootstrap/Dropdown';

const ModalityFilter = (props) => {
    const [modalities,] = useState(dispModalities);
    const [selecteds, setSelecteds] = useState(props.selectedMods);
    const [show, setShow] = useState(false);

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
        <button type="button" className="btn btn-dark btn-sm dropdown-toggle" ref={ref}
            onClick={(e) => {
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

    const handleToggle = () => {
        if (show)
            setShow(false)
        else
            setShow(true)
    }

    return (
        <Dropdown className="d-inline mx-2" show={show} >
            <Dropdown.Toggle as={CustomToggle}>
                Modality
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 dropdown-menu-dark modality">
                {modalities2D?.map((modalities) => {
                    return (
                        <div className="row">
                            {modalities.map((modality, i) => {
                                return (
                                    <div key={i} className="mb-3 col-md-4">
                                        <input className="form-check-input" type="checkbox" value={modality} id="flexCheckDefault" checked={selecteds.includes(modality)} onChange={handleChange} />
                                        <label className="form-check-label title-case" htmlFor="flexCheckDefault">
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