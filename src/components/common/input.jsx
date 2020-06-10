import React from "react";
import { FormGroup, FormLabel, FormControl } from "react-bootstrap";

const Input = ({ name, label, error, className, ...rest }) => {
  return (
    <FormGroup bsSize="small">
      <FormLabel htmlFor={name} className="label-not-bold">
        {label}
      </FormLabel>
      <FormControl {...rest} name={name} id={name} />
      {error && <div className="alert alert-danger">{error}</div>}
    </FormGroup>
  );
};

export default Input;
