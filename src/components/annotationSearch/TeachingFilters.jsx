import React from 'react';
import ModalityFilter from './ModalityFilter';
import SubspecialityFilter from './SubspecialityFilter';
import AnatomyFilter from './AnatomyFilter';
import DiagnosisFilter from './DiagnosisFilter';
// import "./ModalityFilter.css";

class TeachingFilters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModalityFilter: false,
            showSpecialityFilter: false,
            showAnatomyFilter: false,
            showDiagnosisFilter: false
        }
    }

    handleModalityFilterDisplay = () => {
        const { showModalityFilter } = this.state;
        this.setState({ showModalityFilter: !showModalityFilter })
    }

    handleSpecialityFilterDisplay = () => {
        const { showSpecialityFilter } = this.state;
        this.setState({ showSpecialityFilter: !showSpecialityFilter })
    }

    handleAnatomyFilterDisplay = () => {
        const { showAnatomyFilter } = this.state;
        this.setState({ showAnatomyFilter: !showAnatomyFilter })
    }

    handleDiagnosisFilterDisplay = () => {
        const { showDiagnosisFilter } = this.state;
        this.setState({ showDiagnosisFilter: !showDiagnosisFilter })
    }

    render() {
        const { showModalityFilter, showSpecialityFilter, showAnatomyFilter, showDiagnosisFilter } = this.state;
        return (
            <div
                className="annotationSearch-cont__item"
                style={{ margin: '1rem 0rem' }}
            >
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleSpecialityFilterDisplay}
                >
                    Subspeciality
                </div>
                {showSpecialityFilter && (<SubspecialityFilter onClose={() => { this.setState({ showSpecialityFilter: false }) }} />)}
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleModalityFilterDisplay}
                >
                    Modality
                </div>
                {showModalityFilter && (<ModalityFilter onClose={() => { this.setState({ showModalityFilter: false }) }} />)}
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleAnatomyFilterDisplay}
                >
                    Anatomy
                </div>
                {showAnatomyFilter && (<AnatomyFilter onClose={() => { this.setState({ showAnatomyFilter: false }) }} />)}
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleDiagnosisFilterDisplay}
                >
                    Diagnosis
                </div>
                {showDiagnosisFilter && (<DiagnosisFilter onClose={() => { this.setState({ showDiagnosisFilter: false }) }} />)}
            </div>
        );
    }
}

export default TeachingFilters;