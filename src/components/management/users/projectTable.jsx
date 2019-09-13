import React from "react";
import PropTypes from "prop-types";
import Row from "./tableRow";

const projectTable = ({ onSelect, projects }) => {
  const rows = [];
  projects.forEach(el => {
    rows.push(
      <Row name={el.id} key={el.id} user={el.user} onSelect={onSelect} />
    );
  });
  return (
    <table>
      <thead>
        <tr>
          <th className="project-table__header--user">User</th>
          <th className="project-table__header">Owner</th>
          <th className="project-table__header">Member</th>
          <th className="project-table__header">Collaborator</th>
          <th className="project-table__header">StudyOnly</th>
          <th className="project-table__header">None</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

PropTypes.projectTable = {
  onSelect: PropTypes.func,
  projects: PropTypes.string
};

export default projectTable;
