import React from 'react';
import ModalityFilter from './ModalityFilter';
// import "./ModalityFilter.css";

class TeachingFilters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModalityFilter: false
        }
    }

    handleModalityFilterDisplay = () => {
        const { showModalityFilter } = this.state;
        this.setState({ showModalityFilter: !showModalityFilter })
    }

    render() {
        const { showModalityFilter } = this.state;
        return (
            <div
                className="annotationSearch-cont__item"
                style={{ margin: '1rem 0rem' }}
            >
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