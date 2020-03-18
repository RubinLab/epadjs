import React from "react";
import ReactTable from "react-table";
import { FaRegTrashAlt } from "react-icons/fa";
import PluginNavBar from "./../../main/pluginNavBar";
class ManageTab extends React.Component {
  state = {};
  defineManageTabColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({ original }) => {
          const { id } = original;
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.props.selected[id]}
              onChange={() => this.props.handleSelectRow(id)}
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.props.selectAll === 1}
              ref={input => {
                if (input) {
                  input.indeterminate = this.props.selectAll === 2;
                }
              }}
              onChange={() => this.props.handleSelectAll()}
            />
          );
        },
        // sortable: false,
        resizable: false
        // minResizeWidth: 20
        // maxWidth: 45
      },
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      },
      {
        Header: "Image",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        Cell: original => {
          return "add,edit,see";
        },
        style: { whiteSpace: "unset" }
      },
      {
        Header: "Config",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        Cell: original => {
          return "add,edit,see";
        },
        style: { whiteSpace: "unset" }
      },
      {
        Header: "Parameters",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        Cell: original => {
          return "add,edit,see";
        },
        style: { whiteSpace: "unset" }
      },
      {
        Header: "Projects",
        accessor: "projects",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        Cell: original => {
          return this.props.projectDataToCell(original);
        },
        style: { whiteSpace: "unset" }
      },
      {
        Header: "Templates",
        accessor: "templates",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        Cell: original => {
          return this.props.templateDataToCell(original);
        },
        style: { whiteSpace: "unset" }
      },
      {
        Header: "",
        Cell: original => {
          const rowdata = original.row.checkbox;
          return (
            <div onClick={() => this.props.handleDeleteOne(rowdata)}>
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          );
        }
      }
    ];
  };
  render() {
    return (
      <ReactTable
        className="pro-table"
        data={this.props.data}
        columns={this.defineManageTabColumns()}
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={this.props.defaultPageSize}
      />
    );
  }
}

export default ManageTab;
