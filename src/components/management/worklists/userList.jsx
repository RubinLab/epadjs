import React from "react";
import PropTypes from "prop-types";
import Table from "react-table-v6";

const userList = props => {

  const checkUserSelected = (obj) => {
    if (props.assignees[obj.username] &&  props.isSelectedAll !== 0) return true;
    else if (props.isSelectedAll === 1) return true;
    else return false;
  }

  const columns = [
    {
      Header: (
        <div><input
          type="checkbox"
          onChange={props.selectAll}
          checked={props.isSelectedAll}
          ref={input => {
            if (input) {
              input.indeterminate = props.isSelectedAll === 2;
            }
          }}
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
          checked={checkUserSelected(original.row)}
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
