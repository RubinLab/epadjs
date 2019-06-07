import React from "react";

const header = () => {
  return (
    <div className="searchView-header">
      <div className="searchView-header__desc">Description</div>
      <div className="searchView-header__aims--flex">
        <div># of</div>
        <div>aims</div>
      </div>
      <div className="searchView-header__sub--flex">
        <div># of</div>
        <div>sub-item</div>
      </div>
      <div className="searchView-header__img--flex">
        <div># of</div>
        <div>images</div>
      </div>
      <div className="searchView-header__type">Type</div>
      <div className="searchView-header__cr">Creation Date</div>
      <div className="searchView-header__up">Upload Date</div>
      <div className="searchView-header__acc">Accession</div>
      <div className="searchView-header__id">Identifier</div>
    </div>
  );
};

export default header;
