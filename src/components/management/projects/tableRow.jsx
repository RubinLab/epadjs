import React from "react";
import PropTypes from "prop-types";

const tableRow = ({ name, username, role, onSelect }) => {
  return (
    <tr className="edit-userRole__table--row">
      <th className="edit-userRole__table--col">{name}</th>
      <td>
        <input
          type="radio"
          value="Owner"
          name={username}
          onChange={onSelect}
          defaultChecked={"Owner" === role}
        />
      </td>
      <td>
        <input
          type="radio"
          value="Member"
          name={username}
          onChange={onSelect}
          defaultChecked={"Member" === role}
        />
      </td>
      <td>
        <input
          type="radio"
          value="Collaborator"
          name={username}
          onChange={onSelect}
          defaultChecked={"Collaborator" === role}
        />
      </td>
      <td>
        <input
          type="radio"
          value="StudyOnly"
          name={username}
          onChange={onSelect}
          defaultChecked={"StudyOnly" === role}
        />
      </td>
      <td>
        <input
          type="radio"
          value=""
          onChange={onSelect}
          name={username}
          defaultChecked={"None" === role}
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
