import React from "react";
import { FormGroup, ControlLabel, FormControl } from "react-bootstrap";

const Input = ({ name, label, error, className, ...rest }) => {
  return (
    <FormGroup bsSize="small">
      <ControlLabel htmlFor={name} className="label-not-bold">
        {label}
      </ControlLabel>
      <FormControl {...rest} name={name} id={name} />
      {error && <div className="alert alert-danger">{error}</div>}
    </FormGroup>
  );
};

export default Input;
