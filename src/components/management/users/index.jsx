import React from "react";
import ReactTable from "react-table";
import { FaEdit, FaCheck } from "react-icons/fa";
import "../menuStyle.css";
import { getUsers } from "../../../services/userServices";
import ToolBar from "../common/basicToolBar";
import EditUsers from "./editUsersForm";
import ColorPicker from "./colorPicker";

class Users extends React.Component {
  state = {
    data: [],
    showColorpicker: false
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
        className: "usersTable-cell",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 35
      },
      {
        Header: "Last",
        accessor: "lastname",
        className: "usersTable-cell",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 35
      },
      {
        Header: "Email",
        accessor: "email",
        className: "usersTable-cell",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Color",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 20,
        Cell: original => {
          let color = original.row.checkbox.colorpreference;
          color = color ? `#${color}` : `#19ff75`;
          return (
            <p className="menu-clickable wrapped" style={{ color }}>
              {original.row.checkbox.username}
            </p>
          );
        }
      },
      {
        Header: "Projects",
        className: "usersTable-cell",
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
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 20,
        Cell: original => {
          // console.log(original.row.checkbox);
          return original.row.checkbox.admin ? (
            <div className="centeredCell"> {<FaCheck />}</div>
          ) : null;
        }
      },

      {
        Header: "Permissions",
        accessor: "permissions",
        className: "usersTable-cell",
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
        Header: "Enabled",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 30,
        Cell: original => {
          // console.log(original.row.checkbox);
          return original.row.checkbox.enabled ? (
            <div className="centeredCell"> {<FaCheck />}</div>
          ) : null;
        }
      },
      {
        Header: "Edit",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => {
          return original.row.checkbox.username ===
            sessionStorage.getItem("username") ? (
            <div
              onClick={() => {
                this.setState({
                  hasEditClicked: true,
                  userToEdit: original.row.checkbox
                });
              }}
            >
              <FaEdit className="menu-clickable" />
            </div>
          ) : null;
        }
      }
    ];
  };

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      error: "",
      delAll: false,
      hasEditClicked: false,
      delOne: false,
      selectedOne: {},
      displayCreationForm: false,
      firstname: "",
      lastname: "",
      email: "",
      colorpreference: "",
      showColorpicker: false
    });
  };

  handleColorClick = () => {
    this.setState(state => ({ showColorPicker: !state.showColorPicker }));
  };

  render = () => {
    // const col =
    console.log(this.state);
    const pageSize =
      this.state.data.length < 10 ? 10 : this.state.data.length >= 40 ? 50 : 20;
    return (
      <>
        <div className="users menu-display">
          <ToolBar />
          <ReactTable
            className="pro-table"
            data={this.state.data}
            columns={this.defineColumns()}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={pageSize}
          />
          {this.state.hasEditClicked && (
            <EditUsers
              onCancel={this.handleCancel}
              userToEdit={this.state.userToEdit}
              handleColorClick={this.handleColorClick}
              // onType={this.handleFormInput}
              // onSubmit={this.editConnection}
            />
          )}
        </div>
        {this.state.showColorPicker && (
          <ColorPicker onCancel={this.handleColorClick} />
        )}
        {/* {this.state.showColorPicker && <div>here</div>} */}
      </>
    );
  };
}

export default Users;
