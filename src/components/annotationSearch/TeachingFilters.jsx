import React from 'react';
import ModalityFilter from './ModalityFilter';
import SubSpecialtyFilter from './SubSpecialtyFilter';
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
            showDiagnosisFilter: false,
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
        const { selectedDiagnosis, setSelectedDiagnosis, selectedAnatomies, setSelectedAnatomies, selectedSubs, setSelectedSubs, selectedMods, setSelectedMods, tfOnly, setTfOnly, myCases, setMyCases } = this.props;
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
                {showSpecialityFilter && (<SubSpecialtyFilter selectedSubs={selectedSubs} setSelectedSubs={setSelectedSubs} onClose={() => { this.setState({ showSpecialityFilter: false }) }} />)}
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleModalityFilterDisplay}
                >
                    Modality
                </div>
                {showModalityFilter && (<ModalityFilter selectedMods={selectedMods} setSelectedMods={setSelectedMods} onClose={() => { this.setState({ showModalityFilter: false }) }} />)}
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleAnatomyFilterDisplay}
                >
                    Anatomy
                </div>
                {showAnatomyFilter && (<AnatomyFilter selectedAnatomies={selectedAnatomies} setSelectedAnatomies={setSelectedAnatomies} onClose={() => { this.setState({ showAnatomyFilter: false }) }} />)}
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleDiagnosisFilterDisplay}
                >
                    Diagnosis
                </div>
                {showDiagnosisFilter && (<DiagnosisFilter selectedDiagnosis={selectedDiagnosis} setSelectedDiagnosis={setSelectedDiagnosis} onClose={() => { this.setState({ showDiagnosisFilter: false }) }} />)}
                <label
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                >
                    <input type="checkbox" key={"myCases"} checked={myCases} onChange={e => setMyCases(e.target.checked)} />
                    My cases
                </label>
                <label
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                >
                    <input type="checkbox" key={"tfOnly"} checked={!tfOnly} onChange={e => setTfOnly(!e.target.checked)} />
                    Include Significant Images
                </label>
            </div>
        );
    }
}

export default TeachingFilters;