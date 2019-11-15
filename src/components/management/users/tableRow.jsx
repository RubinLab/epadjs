import React from "react";
import PropTypes from "prop-types";

const tableRow = ({ name, role, onSelect, projectId }) => {
  return (
    <tr className="edit-userRole__table--row">
      <th className="edit-userRole__table--col">{name}</th>
      <td>
        <input
          type="radio"
          value="Owner"
          name={name}
          onChange={onSelect}
          defaultChecked={"Owner" === role}
          data-projectid={projectId}
        />
      </td>
      <td>
        <input
          type="radio"
          value="Member"
          name={name}
          onChange={onSelect}
          defaultChecked={"Member" === role}
          data-projectid={projectId}
        />
      </td>
      <td>
        <input
          type="radio"
          value="Collaborator"
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
          name={name}
          onChange={onSelect}
          defaultChecked={"StudyOnly" === role}
          data-projectid={projectId}
        />
      </td>
      <td>
        <input
          type="radio"
          value="None"
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
