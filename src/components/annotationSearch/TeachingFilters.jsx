import React from 'react';
import ModalityFilter from './ModalityFilter';
import SubspecialityFilter from './SubspecialityFilter';
// import "./ModalityFilter.css";

class TeachingFilters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModalityFilter: false,
            showSpecialityFilter: false
        }
    }

    handleModalityFilterDisplay = () => {
        const { showModalityFilter } = this.state;
        this.setState({ showModalityFilter: !showModalityFilter })
    }

    handleSpecialityyFilterDisplay = () => {
        const { showSpecialityFilter } = this.state;
        this.setState({ showSpecialityFilter: !showSpecialityFilter })
    }

    render() {
        const { showModalityFilter, showSpecialityFilter } = this.state;
        return (
            <div
                className="annotationSearch-cont__item"
                style={{ margin: '1rem 0rem' }}
            >
                <div
                    className="searchView-toolbar__group"
                    style={{ padding: '0.2rem' }}
                    onClick={this.handleSpecialityyFilterDisplay}
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

            </div>
        );
    }
}

export default TeachingFilters;