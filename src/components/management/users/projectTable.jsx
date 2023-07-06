import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Row from "./tableRow";
import '../menuStyle.css'

const projectTable = ({ onSelect, projectToRole, projectMap }) => {
  const mode = sessionStorage.getItem("mode");
  const rows = [];
  const userRoles = {};
  projectToRole = projectToRole || [];
  for (let role of projectToRole) {
    const roleArr = role.split(":");
    userRoles[roleArr[0]] = roleArr[1];
  }

  for (let project in projectMap) {
    rows.push(
      <Row
        name={projectMap[project].projectName}
        key={project}
        role={userRoles[project] || "None"}
        onSelect={onSelect}
        projectId={project}
      />
    );
  }
  return (
    <table className="project-table">
      <thead>
        <tr>
          <th className="project-table __header --project">Project</th>
          {mode !== "lite" && <th className="project-table __header">Owner</th>}
          <th className="project-table __header">Member</th>
          {mode !== "lite" && (
            <>
              <th className="project-table __header">Collaborator</th>
              <th className="project-table __header">StudyOnly</th>
            </>
          )}
          <th className="project-table __header">None</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

PropTypes.projectTable = {
  onSelect: PropTypes.func,
  projects: PropTypes.Array,
  projectMap: PropTypes.Object,
  projectToRole: PropTypes.Array,
};

const mapStateToProps = state => {
  return { projectMap: state.annotationsListReducer.projectMap };
};
export default connect(mapStateToProps)(projectTable);

// export default projectTable;
