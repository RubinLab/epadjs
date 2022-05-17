import React, { useState } from 'react';
import { connect } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import { getAllowedTermsOfTemplateComponent } from "Utils/aid";
import { teachingFileTempCode } from '../../constants';
import "./SubSpecialityFilter.css";

const componentLabel = "Findings and Diagnosis";

const DiagnosisFilter = (props) => {
    const [diagnosis,] = useState(getDiagnosis());

    function getDiagnosis() {
        const { Template } = props.templates[teachingFileTempCode].TemplateContainer;
        return getAllowedTermsOfTemplateComponent(Template, componentLabel);
    }

    const handleSelect = (selection) => {
        const { selectedDiagnosis, setSelectedDiagnosis } = props;
        setSelectedDiagnosis([...selectedDiagnosis, selection])
    }

    const handleApply = () => {
        props.onClose();
    }

    const DiagnosisTogle = React.forwardRef(({ children, onClick }, ref) => (
        <a
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
            &#x25bc;
        </a>
    ));

    const DiagnosisMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
            const [value, setValue] = useState('');
            const [firstRun, setFirstRun] = useState(true);

            return (
                <div
                    ref={ref}
                    style={style}
                    className={className}
                    aria-labelledby={labeledBy}
                >
                    <FormControl
                        autoFocus
                        className="mx-3 my-2 w-auto"
                        placeholder="Type to filter..."
                        onChange={(e) => { setValue(e.target.value), setFirstRun(false) }}
                        value={value}
                    />
                    {!firstRun && (
                        <ul className="list-unstyled">
                            {React.Children.toArray(children).filter(
                                (child) =>
                                    !value || child.props.children.toLowerCase().includes(value),
                            )}
                        </ul>
                    )}
                </div>
            );
        },
    );

    return (
        <Dropdown>
            <Dropdown.Toggle as={DiagnosisTogle} id="dropdown-custom-components">
                Diagnosis
            </Dropdown.Toggle>

            <Dropdown.Menu as={DiagnosisMenu}>
                {diagnosis?.map((diagnose, i) => {
                    return (
                        <Dropdown.Item key={i} eventKey={diagnose} onSelect={eventKey => handleSelect(eventKey)}>{diagnose}</Dropdown.Item>
                    )
                })
                }
            </Dropdown.Menu>
        </Dropdown>

    );

}

const mapStateToProps = state => {
    return {
        templates: state.annotationsListReducer.templates,
    };
};

export default connect(mapStateToProps)(DiagnosisFilter);