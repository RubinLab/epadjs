import React from "react";
import PropTypes from "prop-types";
import Table from "react-table-v6";

const userList = props => {
  const columns = [
    {
      sortable: true,
      resizable: true,
      minWidth: 30,
      Cell: original => (
        <input
          type="checkbox"
          onChange={props.onChange}
          name={original.row.username}
          checked={props.assignees[original.row.username]}
          id={original.row.username}
        />
      )
    },
    {
      accessor: "username",
      sortable: true,
      resizable: true,
      minWidth: 250
    }
  ];
  return (
    <div>
      <Table
        className="__table"
        data={props.users}
        columns={columns}
        pageSize={props.users.length}
        showPagination={false}
        NoDataComponent={() => null}
      />
    </div>
  );
};

export default userList;
