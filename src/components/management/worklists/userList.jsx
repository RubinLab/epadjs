import React from "react";
import PropTypes from "prop-types";
import Table from "react-table-v6";

const userList = props => {
  const columns = [
    {
      Header: (
        <div><input
          type="checkbox"
          onChange={props.selectAll}
          checked={props.isSelectedAll}
        /> Select All</div>
      ),
      sortable: true,
      resizable: true,
      maxWidth: 80,
      Cell: original => (
        <input
          type="checkbox"
          onChange={props.onChange}
          name={original.row.username}
          checked={props.assignees[original.row.username]}
          id={original.row.username}
          style={{ textAlign: "right" }}
        />
      )
    },
    {
      accessor: "username",
      sortable: true,
      resizable: true,
      show: false
    },
    {
      accessor: "displayname",
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
