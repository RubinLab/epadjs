import React from 'react';
import ModalityFilter from './ModalityFilter';
import SubSpecialtyFilter from './SubSpecialtyFilter';
import AnatomyFilter from './AnatomyFilter';
import DiagnosisFilter from './DiagnosisFilter';
// import "./ModalityFilter.css";

class TeachingFilters extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { selectedDiagnosis, setSelectedDiagnosis, selectedAnatomies, setSelectedAnatomies, selectedSubs, setSelectedSubs, selectedMods, setSelectedMods, tfOnly, setTfOnly, myCases, setMyCases } = this.props;
        return (
            <>
                <div className="col-auto">
                    <div className="input-group input-group-sm mb-3">
                        <SubSpecialtyFilter selectedSubs={selectedSubs} setSelectedSubs={setSelectedSubs} />
                        <ModalityFilter selectedMods={selectedMods} setSelectedMods={setSelectedMods} />
                        <AnatomyFilter selectedAnatomies={selectedAnatomies} setSelectedAnatomies={setSelectedAnatomies} />
                        <DiagnosisFilter selectedDiagnosis={selectedDiagnosis} setSelectedDiagnosis={setSelectedDiagnosis} />
                    </div>
                </div>
                <div className="col-auto" style={{ fontSize: '.9em', float: 'right' }}>
                    <div className="form-check form-check-inline" >
                        <label className="form-check-label" htmlFor="flexCheckChecked">Inc Significant Images</label>
                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" key={"tfOnly"} checked={!tfOnly} onChange={e => setTfOnly(!e.target.checked)} />
                    </div>
                    <div className="form-check form-check-inline">
                        <label className="form-check-label" htmlFor="flexCheckChecked">Only My Cases</label>
                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" key={"myCases"} checked={myCases} onChange={e => setMyCases(e.target.checked)} />
                    </div>
                </div>
            </>
        );
    }
}

export default TeachingFilters;