import React from 'react';

const tableRow = ({ name, role, onSelect }) => {
  // console.log(typeofrole);
  return (
    <tr className="edit-userRole__table--row">
      <th className="edit-userRole__table--col">{name}</th>
      <td>
        <input
          type="radio"
          value="Owner"
          name={name}
          onChange={onSelect}
          defaultChecked={'Owner' === role}
        />
      </td>
      <td>
        <input
          type="radio"
          value="Member"
          name={name}
          onChange={onSelect}
          defaultChecked={'Member' === role}
        />
      </td>
      <td>
        <input
          type="radio"
          value="Collaborator"
          name={name}
          onChange={onSelect}
          defaultChecked={'Collaborator' === role}
        />
      </td>
      <td>
        <input
          type="radio"
          value=""
          onChange={onSelect}
          name={name}
          defaultChecked={'None' === role}
        />
      </td>
    </tr>
  );
};

export default tableRow;
