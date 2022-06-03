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
            <>
                <div className="col">
                    <div className="input-group input-group-sm mb-3">
                        <SubSpecialtyFilter selectedSubs={selectedSubs} setSelectedSubs={setSelectedSubs} />
                        <ModalityFilter selectedMods={selectedMods} setSelectedMods={setSelectedMods} />
                        <AnatomyFilter selectedAnatomies={selectedAnatomies} setSelectedAnatomies={setSelectedAnatomies} />
                        <div className="dropdown" style={{ marginRight: '12px' }}>
                            <button type="button" onClick={this.handleDiagnosisFilterDisplay} className="btn btn-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                                Diagnosis
                            </button>
                            {showDiagnosisFilter && (<DiagnosisFilter selectedDiagnosis={selectedDiagnosis} setSelectedDiagnosis={setSelectedDiagnosis} onClose={() => { this.setState({ showDiagnosisFilter: false }) }} />)}
                        </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="input-group input-group-sm mb-3" style={{ fontSize: '.9em' }}>
                        <div className="form-check form-check-inline">
                            <label className="form-check-label" htmlFor="flexCheckChecked">Include Significant Images</label>
                            <input className="form-check-input" type="checkbox" id="flexCheckChecked" key={"tfOnly"} checked={!tfOnly} onChange={e => setTfOnly(!e.target.checked)} />
                        </div>
                        <div className="form-check form-check-inline">
                            <label className="form-check-label" htmlFor="flexCheckChecked">Include Only My Cases</label>
                            <input className="form-check-input" type="checkbox" id="flexCheckChecked" key={"myCases"} checked={myCases} onChange={e => setMyCases(e.target.checked)} />
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default TeachingFilters;