import React from "react";
import PropTypes from "prop-types";
import Row from "./tableRow";

const userTable = ({ onSelect, users }) => {
  const rows = [];
  users.forEach(el => {
    rows.push(
      <Row name={el.name} key={el.name} role={el.role} onSelect={onSelect} />
    );
  });
  return (
    <table>
      <thead>
        <tr>
          <th className="user-table__header--user">User</th>
          <th className="user-table__header">Owner</th>
          <th className="user-table__header">Member</th>
          <th className="user-table__header">Collaborator</th>
          <th className="user-table__header">StudyOnly</th>
          <th className="user-table__header">None</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

PropTypes.userTable = {
  onSelect: PropTypes.func,
  users: PropTypes.string
};

export default userTable;
