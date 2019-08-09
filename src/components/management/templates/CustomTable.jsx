import React, { Component } from "react";
import { connect } from "react-redux";
import Table from "react-table";

class CustomTable extends Component {
  state = {};
  setColumns = () => {
    return [
      {
        Header: "Project",
        accessor: "name"
      },
      {
        Header: "Enable",
        Cell: original => {
          return (
            <input
              className="projectTable-row__check"
              type="checkbox"
              name="enable"
              // data-id={original.row.id}
            />
          );
        }
      },
      {
        Header: "Default",
        Cell: original => {
          return (
            <input
              className="projectTable-row__check"
              type="checkbox"
              name="default"
              // data-id={original.row.id}
            />
          );
        }
      }
    ];
  };

  render = () => {
    return (
      <Table
        className="pro-edit_table"
        data={this.props.data}
        columns={this.setColumns()}
        defaultPageSize={this.props.data.length}
      />
    );
  };
}

export default CustomTable;
