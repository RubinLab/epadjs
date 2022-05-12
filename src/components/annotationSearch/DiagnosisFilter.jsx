import React from 'react';
import { connect } from "react-redux";
import "./SubspecialityFilter.css";
import { getAllowedTermsOfTemplateComponent } from "Utils/aid";
import { teachingFileTempCode } from '../../constants';

const componentLabel = "Findings and Diagnosis";

class DiagnosisFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diagnosisList: []
        }
    }

    componentDidMount() {
        const { Template } = this.props.templates[teachingFileTempCode].TemplateContainer;
        this.setState({ diagnosisList: getAllowedTermsOfTemplateComponent(Template, componentLabel) });
    }

    handleClick = (event) => {
        // console.log("evetn", event.target.value, event.target.checked);
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
                    {this.state.diagnosisList?.map(diagnosis => {
                        return (
                            <label key={diagnosis}><input type="checkbox" key={diagnosis} value={diagnosis} onClick={this.handleClick} /> {diagnosis}</label>
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

const mapStateToProps = state => {
    return {
        templates: state.annotationsListReducer.templates,
    };
};

export default connect(mapStateToProps)(DiagnosisFilter);