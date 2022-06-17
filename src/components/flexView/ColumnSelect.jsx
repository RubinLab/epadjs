import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

const ColumnSelect = (props) => {

  const { studyColumns, onChecked, order } = props;

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <button data-bs-display="static" id='subSpecDrop' type="button" className="btn btn-dark btn-sm dropdown color-schema" ref={ref}
      onClick={(e) => {
        // e.preventDefault();
        onClick(e);
      }}>
      {children}
    </button>
  ));

  return (
    <Dropdown id='subSpecDrop' className="d-inline mx-2">
      <Dropdown.Toggle as={CustomToggle}>
        Select Columns
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu p-2 dropdown-menu-dark" popperConfig={{ strategy: "fixed" }} >
        {studyColumns?.map((column, y) => {
          return (
            <div key={y} className="row">
              <div key={y} className="mb-3" style={{ width: '250px' }}>
                <input className="form-check-input filter-input" type="checkbox" value={y} checked={order?.includes(y)} onChange={onChecked} />
                <label className="form-check-label title-case" style={{ paddingLeft: '0.3rem' }} htmlFor="flexCheckDefault">
                  {column}
                </label>
              </div></div>
          )
        })
        }
        {/* <div style={{ float: 'right', marginRight: '1em' }}>
        <button className='btn btn-dark btn-sm' onClick={handleApply}>Apply</button>
      </div> */}
      </Dropdown.Menu>
    </Dropdown >
  );
};

export default ColumnSelect;
