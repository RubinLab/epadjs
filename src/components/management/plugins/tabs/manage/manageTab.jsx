import React, { Fragment } from "react";
import ReactTable from "react-table";
import {
  FaRegTrashAlt,
  FaCogs,
  FaWindowClose,
  FaCheck,
  FaPlusCircle,
} from "react-icons/fa";
import "../../../menuStyle.css";
import "./../../css/plugin.css";

class ManageTab extends React.Component {
  state = {};
  defineManageTabColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 20,
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
        resizable: false,
        minResizeWidth: 20,
        // maxWidth: 45
      },
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 200,
        width: 200,
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
        Header: "Aim Required",
        sortable: true,
        resizable: true,
        minResizeWidth: 200,
        width: 200,
        Cell: (data) => {
          if (data.original.processmultipleaims === null) return "not required";
          else if (data.original.processmultipleaims === 0) return "one";
          else return "multiple";
        },
        style: { whiteSpace: "unset" },
      },
      {
        Header: "Image",
        sortable: true,
        resizable: true,
        minResizeWidth: 200,
        width: 200,
        Cell: (data) => {
          if (data.original.image_repo !== "")
            return data.original.image_repo + ":" + data.original.image_tag;
          else return "-";
        },
        style: { whiteSpace: "unset" },
      },
      {
        Header: "Parameters",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 100,
        Cell: (original) => {
          return (
            <div onClick={() => this.props.handleParametersClicked(original)}>
              <FaCogs className="menu-clickable" />
            </div>
          );
        },
        style: { whiteSpace: "unset" },
      },
      {
        Header: "Projects",
        accessor: "projects",
        sortable: true,
        resizable: true,
        minResizeWidth: 200,
        width: 200,
        Cell: (original) => {
          return this.props.projectDataToCell(original);
        },
        style: { whiteSpace: "unset" },
      },
      {
        Header: "Description",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        style: { whiteSpace: "unset" },
      },
      {
        Header: "Enabled",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 100,
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
        Header: "",
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
      <Fragment>
        <div className="topButtons">
          <FaPlusCircle
            data-tip="New Plugin"
            data-for="plus-icon"
            onClick={this.props.onAdd}
            className="cursorHand"
          />
          <FaRegTrashAlt
            data-tip="New Plugin"
            data-for="plus-icon"
            onClick={this.props.onDelete}
            className="cursorHand"
          />
        </div>
        <div>
          <ReactTable
            className="pro-table"
            data={this.props.data}
            columns={this.defineManageTabColumns()}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={this.props.defaultPageSize}
          />
        </div>
      </Fragment>
    );
  }
}

export default ManageTab;
