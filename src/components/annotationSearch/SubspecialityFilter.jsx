import React from 'react';
import { connect } from "react-redux";
import "./SubspecialityFilter.css";
import { getAllowedTermsOfTemplateComponent } from "Utils/aid"
import teachingFileTempCode from 'constants';

class SubspecialityFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subspecialities: []
        }
    }

    componentDidMount() {
        const { Template } = this.props.templates["99EPAD_15"].TemplateContainer;
        this.setState({ subspecialities: getAllowedTermsOfTemplateComponent(Template, "Radiology Specialty") });
        // this.subspecialities = this.props.templates.teachingFileTempCode.TemplateContainer.Template;
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
                    {this.state.subspecialities?.map(speciality => {
                        return (
                            <label key={speciality}><input type="checkbox" key={speciality} value={speciality} onClick={this.handleClick} /> {speciality}</label>
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

export default connect(mapStateToProps)(SubspecialityFilter);