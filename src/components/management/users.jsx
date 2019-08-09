import React from "react";
import Table from "react-table";
import "./menuStyle.css";
import { getUsers } from "../../services/userServices";
import ToolBar from "./common/basicToolBar";

class Users extends React.Component {
  state = {
    data: []
  };

  componentDidMount = () => {
    this.getUserData();
  };

  getUserData = async () => {
    const result = await getUsers();
    this.setState({ data: result.data.ResultSet.Result });
  };

  convertArrToStr = arr => {
    return arr.reduce((all, item, index) => {
      if (item.length > 0) {
        all.length > 0 ? (all += ", " + item) : (all += item);
      }
      return all;
    }, "");
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              // checked={this.state.selected[original.firstName] === true}
              // onChange={() => this.toggleRow(original.firstName)}
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              // checked={this.state.selectAll === 1}
              //   ref={input => {
              //     if (input) {
              //       input.indeterminate = this.state.selectAll === 2;
              //     }
              //   }}
              //   onChange={() => this.toggleSelectAll()}
            />
          );
        },
        sortable: false,
        width: 45
      },
      {
        Header: "First",
        accessor: "firstname",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Last",
        accessor: "lastname",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Email",
        accessor: "email",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Color",
        accessor: "colorpreference",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Projects",
        accessor: "projects",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => (
          <p className="menu-clickable wrapped">
            {original.row.projects.join(", ")}
          </p>
        )
      },
      {
        Header: "Admin",
        accessor: "admin",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Permissions",
        accessor: "permissions",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => (
          <p className="menu-clickable wrapped">
            {this.convertArrToStr(original.row.permissions)}
          </p>
        )
      },
      {
        Header: "Enable",
        accessor: "enabled",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Password",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      }
    ];
  };

  render = () => {
    // const col =
    return (
      <div className="users menu-display">
        <ToolBar />
        <Table data={this.state.data} columns={this.defineColumns()} />
      </div>
    );
  };
}

export default Users;
