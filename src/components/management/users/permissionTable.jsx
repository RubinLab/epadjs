import React from "react";
import PropTypes from "prop-types";

const permissionTable = ({ userPermission, onSelect }) => {
  const permission = ["projects", "users", "connections", "queries"];
  const rows = [];

  permission.forEach(el => {
    rows.push(
      <div className="edit-userPermission __row" key={el}>
        <input
          type="checkbox"
          value={el}
          name={el}
          onChange={onSelect}
          defaultChecked={userPermission.includes(el)}
        />
        <label className="edit-userPermission __row --label">{`Create ${el}`}</label>
      </div>
    );
  });
  return <div className="edit-userPermission">{rows}</div>;
};

permissionTable.propTypes = {
  userPermission: PropTypes.array,
  onSelect: PropTypes.func
};

export default permissionTable;
