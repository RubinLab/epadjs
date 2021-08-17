import React from "react";
import PropTypes from "prop-types";

const tableRow = ({ name, role, onSelect, projectId }) => {
  const mode = sessionStorage.getItem("mode");
  return (
    <tr className="edit-userRole__table--row">
      <th className="edit-userRole__table--col">{name}</th>
      {mode !== "lite" && (
        <td>
          <input
            type="radio"
            value="Owner"
            id={`Owner-${projectId}`}
            name={name}
            onChange={onSelect}
            defaultChecked={"Owner" === role}
            data-projectid={projectId}
          />
        </td>
      )}
      <td>
        <input
          type="radio"
          value="Member"
          id={`Member-${projectId}`}
          name={name}
          onChange={onSelect}
          defaultChecked={"Member" === role}
          data-projectid={projectId}
        />
      </td>
      {mode !== "lite" && (
        <>
          <td>
            <input
              type="radio"
              value="Collaborator"
              id={`Collaborator-${projectId}`}
              name={name}
              onChange={onSelect}
              defaultChecked={"Collaborator" === role}
              data-projectid={projectId}
            />
          </td>
          <td>
            <input
              type="radio"
              value="StudyOnly"
              id={`StudyOnly-${projectId}`}
              name={name}
              onChange={onSelect}
              defaultChecked={"StudyOnly" === role}
              data-projectid={projectId}
            />
          </td>
        </>
      )}
      <td>
        <input
          type="radio"
          value="None"
          id={`None-${projectId}`}
          onChange={onSelect}
          name={name}
          defaultChecked={"None" === role}
          data-projectid={projectId}
        />
      </td>
    </tr>
  );
};

tableRow.propTypes = {
  name: PropTypes.string,
  role: PropTypes.string,
  onSelect: PropTypes.func
};

export default tableRow;
