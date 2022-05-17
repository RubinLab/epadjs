import React, { useState } from 'react';
import { connect } from "react-redux";
import "./SubSpecialityFilter.css";
import { getAllowedTermsOfTemplateComponent } from "Utils/aid";
import { teachingFileTempCode } from '../../constants.js';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';

const AnatomyFilter = (props) => {

    const [anatomies,] = useState(getAnatomies());

    function getAnatomies() {
        const { Template } = props.templates[teachingFileTempCode].TemplateContainer;
        return getAllowedTermsOfTemplateComponent(Template, "Anatomy Detail");
    }

    const handleSelect = (selection) => {
        const { selectedAnatomies, setSelectedAnatomies } = props;
        setSelectedAnatomies([...selectedAnatomies, selection])
    }

    const handleApply = () => {
        props.onClose();
    }

    const AnatomyTogle = React.forwardRef(({ children, onClick }, ref) => (
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

    const AnatomyMenu = React.forwardRef(
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
            <Dropdown.Toggle as={AnatomyTogle} id="dropdown-custom-components">
                Anatomy
            </Dropdown.Toggle>

            <Dropdown.Menu as={AnatomyMenu}>
                {anatomies?.map((anatomy, i) => {
                    return (
                        <Dropdown.Item key={i} eventKey={anatomy} onSelect={eventKey => handleSelect(eventKey)}>{anatomy}</Dropdown.Item>
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

export default connect(mapStateToProps)(AnatomyFilter);