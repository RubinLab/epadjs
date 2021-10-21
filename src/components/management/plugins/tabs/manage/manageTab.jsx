import React, { Fragment } from "react";
import ReactTable from "react-table-v6";
import {
  FaRegTrashAlt,
  FaCogs,
  FaWindowClose,
  FaCheck,
  FaPlusCircle,
} from "react-icons/fa";
import "./../../css/plugin.css";

class ManageTab extends React.Component {
  state = {};
  defineManageTabColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
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
        Header: (x) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.props.selectAll === 1}
              ref={(input) => {
                if (input) {
                  input.indeterminate = this.props.selectAll === 2;
                }
              }}
              onChange={() => this.props.handleSelectAll()}
            />
          );
        },
        // sortable: false,
        resizable: true,
        minResizeWidth: 45,
        minWidth: 45,
      },
      {
        id: "name",
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        minWidth: 150,
        Cell: (data) => {
          const pluginname = data.row.name;
          const pluginid = data.original.id;
          return (
            <div
              className="text_clickable"
              onClick={() => this.props.handleEditPlugin(data)}
            >
              {pluginname}
            </div>
          );
        },
      },
      {
        id: "aimreq",
        Header: "Aim Required",
        accessor: "",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        minWidth: 100,
        Cell: (data) => {
          if (
            typeof data.original.processmultipleaims === "number" &&
            data.original.processmultipleaims === 0
          ) {
            return "one";
          } else if (
            typeof data.original.processmultipleaims === "number" &&
            data.original.processmultipleaims === 1
          ) {
            return "multiple";
          } else {
            return "not required";
          }
        },
        style: { whiteSpace: "unset" },
      },
      {
        id: "image",
        Header: "Image",
        accessor: "",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        minWidth: 200,
        Cell: (data) => {
          if (data.original.image_repo !== "")
            return data.original.image_repo + ":" + data.original.image_tag;
          else return "-";
        },
        style: { whiteSpace: "unset" },
      },
      {
        id: "parameters",
        Header: "Parameters",
        accessor: "",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        minWidth: 100,
        Cell: (original) => {
          return (
            <div onClick={() => this.props.handleParametersClicked(original)}>
              <FaCogs className="menu-clickable" />
            </div>
          );
        },
        style: {
          whiteSpace: "unset",
          color: "#5bc0de",
          cursor: "pointer",
          fontStyle: "italic",
        },
      },
      {
        id: "projects",
        Header: "Projects",
        accessor: "projects",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        minWidth: 100,
        Cell: (original) => {
          return this.props.projectDataToCell(original);
        },
        style: {
          whiteSpace: "unset",
          color: "#5bc0de",
          cursor: "pointer",
          fontStyle: "italic",
        },
      },
      {
        id: "description",
        Header: "Description",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        minWidth: 100,
        style: { whiteSpace: "unset" },
      },
      {
        id: "enabled",
        Header: "Enabled",
        accessor: "",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        minWidth: 100,
        Cell: (data) => {
          if (data.original.enabled) {
            return (
              <div
                onClick={() =>
                  this.props.handleEnablePluginClicked(data.original.id)
                }
              >
                <FaCheck className="menu-clickable" />
              </div>
            );
          } else {
            return (
              <div
                onClick={() =>
                  this.props.handleEnablePluginClicked(data.original.id)
                }
              >
                <FaWindowClose className="menu-clickable" />
              </div>
            );
          }
        },
        style: { whiteSpace: "unset" },
      },
      {
        id: "delete",
        Header: "",
        accessor: "",
        minWidth: 45,
        Cell: (original) => {
          const rowdata = original.row.checkbox;
          return (
            <div onClick={() => this.props.handleDeleteOne(rowdata)}>
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          );
        },
      },
    ];
  };
  render() {
    return (
      <div>
        <div className="topButtons">
          <FaPlusCircle
            data-tip="New Plugin"
            data-for="plus-icon"
            onClick={this.props.onAdd}
            className="cursorHand"
          />
          <FaRegTrashAlt
            data-tip="Delete Plugin"
            data-for="delete-icon"
            onClick={this.props.onDelete}
            className="cursorHand"
          />
        </div>
        <div className="plugin_manage_table">
          <ReactTable
            NoDataComponent={() => null}
            className="pro-table"
            data={this.props.data}
            columns={this.defineManageTabColumns()}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={this.props.defaultPageSize}
          />
        </div>
      </div>
    );
  }
}

export default ManageTab;
