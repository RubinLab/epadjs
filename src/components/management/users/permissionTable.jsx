import React from "react";
import PropTypes from "prop-types";

const permissionTable = ({ userPermission, onSelect }) => {
  const mode = sessionStorage.getItem("mode");
  const permission = [
    "CreateUser",
    "CreatePAC",
    "CreateAutoPACQuery",
    "CreateProject",
  ];
  const rows = [];
  userPermission = userPermission || [];

  permission.forEach(el => {
    const label =
      el === "CreatePAC"
        ? "Create Connections"
        : el === "CreateAutoPACQuery"
        ? "Create Queries"
        : `${el.substring(0, 6)} ${el.substring(6)}s`;

    if (el.substring(6) === "Project" && mode === "lite") {
      return;
    } else {
      rows.push(
        <div className="edit-userPermission __row" key={el}>
          <input
            type="checkbox"
            value={el}
            name={el}
            onChange={onSelect}
            defaultChecked={userPermission.includes(el)}
          />
          <label className="edit-userPermission __row --label">{label}</label>
        </div>
      );
    }
  });
  return <div className="edit-userPermission">{rows}</div>;
};

permissionTable.propTypes = {
  userPermission: PropTypes.array,
  onSelect: PropTypes.func,
};

export default permissionTable;
