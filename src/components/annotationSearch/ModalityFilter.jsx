import React from 'react';
import { DISP_MODALITIES as modalities } from "../../constants.js";
import "./ModalityFilter.css";

class ModalityFilter extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClick = (event) => {
        console.log("evetn", event.target.value, event.target.checked);
    }

    handleApply = () => {
        this.props.onClose();
    }

    render() {
        return (
            <div className="mf-pop-up">
                <div className="close-mf-menu" onClick={this.props.onClose}>
                    <a href="#">X</a>
                </div>
                <div>
                    {modalities.map(modality => {
                        return (
                            <label key={modality}><input type="checkbox" key={modality} value={modality} onClick={this.handleClick} /> {modality}</label>
                        )
                    })
                    }
                </div>
                <div>
                    <button onClick={this.handleApply}>Apply</button>
                </div>
            </div>
        );
    }
}

export default ModalityFilter;