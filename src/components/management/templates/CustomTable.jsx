import React, { Component } from "react";
import { connect } from "react-redux";
import Table from "react-table";

class CustomTable extends Component {
  state = {};
  setColumns = () => {
    return [
      {
        Header: "Project",
        accessor: "name",
      },
      {
        Header: "Enable",
        width: 70,
        Cell: original => {
          return (
            <input
              className="projectTable-row__check"
              type="checkbox"
              name="enable"
              // data-id={original.row.id}
            />
          );
        },
      },
      // {
      //   Header: "Default",
      //   width: 50,
      //   Cell: original => {
      //     return (
      //       <input
      //         className="projectTable-row__check"
      //         type="checkbox"
      //         name="default"
      //         // data-id={original.row.id}
      //       />
      //     );
      //   },
      // },
    ];
  };

  render = () => {
    return (
      <Table
        className="pro-edit_table"
        data={this.props.data}
        columns={this.setColumns()}
        defaultPageSize={this.props.data.length}
        showPagination={false}
      />
    );
  };
}

export default CustomTable;
