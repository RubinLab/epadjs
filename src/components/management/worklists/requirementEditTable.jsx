import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { getAllTemplates } from "../../../services/templateServices";

// accept only integers for aims field
class RequirementEditTable extends React.Component {
  state = {
    templates: {},
    error: null,
    level: null,
    numOfAims: null,
    template: null
  };

  onClickTable = (id, button) => {
    if (button === "delete") {
      this.props.onDelete(id);
    }
  };

  setColumns = () => {
    return [
      {
        Header: "Level",
        width: 70,
        accessor: "level"
      },
      {
        Header: "Template",
        accessor: "template"
      },
      {
        Header: "Aims",
        width: 40,
        accessor: "numOfAims"
      },
      {
        Header: "",
        width: 20,
        Cell: row => (
          <div className="menu-clickable" onClick={() => {}}>
            <FaEdit />
          </div>
        )
      },
      {
        Header: "",
        width: 20,
        Cell: row => (
          <div
            className="menu-clickable"
            onClick={() => {
              this.onClickTable(row.original.id, "delete");
            }}
          >
            <FaTrashAlt />
          </div>
        )
      }
    ];
  };

  render = () => {
    const { error } = this.state;
    return (
      <>
        {this.props.requirements.length > 0 && (
          <ReactTable
            NoDataComponent={() => null}
            data={this.props.requirements}
            columns={this.setColumns()}
            pageSize={this.props.requirements.length}
            showPagination={false}
          />
        )}
      </>
    );
  };
}

export default RequirementEditTable;
