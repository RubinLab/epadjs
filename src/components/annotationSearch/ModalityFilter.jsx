import React, { useState, useEffect } from 'react';
import { DISP_MODALITIES as dispModalities } from "../../constants.js";
import "./ModalityFilter.css";

const ModalityFilter = (props) => {
    const [modalities,] = useState(dispModalities);
    const [selecteds, setSelecteds] = useState(props.selectedMods);

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
        props.onClose();
    }


    return (
        <div className="mf-pop-up">
            <div className="close-mf-menu" onClick={props.onClose}>
                <a href="#">X</a>
            </div>
            <div>
                {modalities.map((modality, i) => {
                    return (
                        <label key={i}><input type="checkbox" value={modality} checked={selecteds.includes(modality)} onChange={handleChange} /> {modality}</label>
                    )
                })
                }
            </div>
            <div>
                <button onClick={handleApply}>Apply</button>
            </div>
        </div>
    );
}

export default ModalityFilter;