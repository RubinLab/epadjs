import React, { useState } from 'react';
import { connect } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import WarningModal from '../common/warningModal';
import { getAllowedTermsOfTemplateComponent } from "../../Utils/aid";
import { teachingFileTempCode } from '../../constants';

const componentLabel = "Findings and Diagnosis";
const mode = sessionStorage.getItem('mode')
const warning = { message: `You don't have the required template for the ${mode} mode. Please contact to your admin` }


const DiagnosisFilter = (props) => {
    const [diagnosis, setDiagnosis] = useState([]);
    const [firstRun, setFirstRun] = useState(true);
    const [showWarning, setShowWarning] = useState(false);

    function getDiagnosis() {
        const temp = props ?.templates[teachingFileTempCode];
        if (temp) {
            const { Template } = props.templates[teachingFileTempCode].TemplateContainer;
            return getAllowedTermsOfTemplateComponent(Template, componentLabel);
        }
    }

    const handleSelect = (selection) => {
        const { selectedDiagnosis, setSelectedDiagnosis } = props;
        setSelectedDiagnosis([...selectedDiagnosis, selection])
    }

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <button type="button" className="btn btn-dark btn-sm dropdown-toggle color-schema" ref={ref}
            onClick={(e) => {
                if (props?.templates[teachingFileTempCode] === undefined) {
                    setShowWarning(true);
                } else {
                    if (firstRun) {
                        setDiagnosis(getDiagnosis());
                        setFirstRun(false);
                    }
                    e.preventDefault();
                    onClick(e);
                }
            }}>
            {children}
        </button>
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
                    Select from results to filter
                    <FormControl
                        autoFocus
                        className="form-control"
                        placeholder="Type to find Diagnosis"
                        aria-label="Anatomy"
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
        <>
            <Dropdown className="d-inline mx-1">
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                    Diagnosis
                </Dropdown.Toggle>
                {props.templates[teachingFileTempCode] && <Dropdown.Menu as={DiagnosisMenu} className='dropdown-menu p-2 dropdown-menu-dark modality'>
                    {diagnosis?.map((diagnose, i) => {
                        return (
                            <Dropdown.Item key={i} eventKey={diagnose} onSelect={eventKey => handleSelect(eventKey)}>{diagnose}</Dropdown.Item>
                        )
                    })
                    }
                </Dropdown.Menu> }
            </Dropdown>
            {showWarning && <WarningModal message={warning.message} onOK={() => setShowWarning(false)} />}
        </>

    );
}

const mapStateToProps = state => {
    return {
        templates: state.annotationsListReducer.templates,
    };
};

export default connect(mapStateToProps)(DiagnosisFilter);