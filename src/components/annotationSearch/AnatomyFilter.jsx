import React from 'react';
import { connect } from "react-redux";
import "./SubspecialityFilter.css";
import { getAllowedTermsOfTemplateComponent } from "Utils/aid";
import { teachingFileTempCode } from '../../constants';

class AnatomyFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anatomyList: []
        }
    }

    componentDidMount() {
        const { Template } = this.props.templates[teachingFileTempCode].TemplateContainer;
        this.setState({ subspecialities: getAllowedTermsOfTemplateComponent(Template, "Anatomy Detail") });
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
                    {this.state.anatomyList?.map(anatomy => {
                        return (
                            <label key={anatomy}><input type="checkbox" key={anatomy} value={anatomy} onClick={this.handleClick} /> {anatomy}</label>
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

export default connect(mapStateToProps)(AnatomyFilter);