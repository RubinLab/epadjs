import React from "react";
import Table from "react-table";
import { FaRegTrashAlt } from "react-icons/fa";
import ToolBar from "../management/common/basicToolBar";
import { apiUrl } from "../../config.json";
import http from "../../services/httpService";
import Header from "../management/common/managementHeader";

const messages = {
  deleteSingle: "Delete the host? This cannot be undone.",
  deleteSelected: "Delete selected hostss? This cannot be undone."
};

class Admin extends React.Component {
  state = {
    data: [],
    selected: {}
  };

  componentDidMount = () => {
    this.getData();
  };

  getData = async () => {
    const url = apiUrl + "/epads/?summary=true";
    let data = await http.get(url);
    data = data.data.ResultSet.Result;
    this.setState({ data });
  };

  toggleRow = async identifier => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[identifier]) {
      delete newSelected[identifier];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[identifier] = true;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.data.forEach((item, index) => {
        newSelected[item.host + index] = true;
      });
    }
    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  handleCancel = () => {
    this.setState({
      hasDeleteSingleClicked: false,
      hasDeleteAllClicked: false,
      singleDeleteId: "",
      hasAddClicked: false,
      errorMessage: null
    });
  };

  deleteAllSelected = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    const notDeleted = [];
    //call single delete to an array
    //Call Promise.all to array
    //then => refresh the page
    //catch => push
  };

  deleteSingleHost = async () => {};

  handleDeleteAll = () => {
    this.setState({ hasDeleteAllClicked: true });
  };

  handleSingleDelete = id => {
    this.setState({ hasDeleteSingleClicked: true, singleDeleteId: id });
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 30,
        // Cell: ({ original }) => {
        Cell: info => {
          const { original, index } = info;
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[original.host + index]}
              onChange={() => this.toggleRow(original.host + index)}
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selectAll === 1}
              ref={input => {
                if (input) {
                  input.indeterminate = this.state.selectAll === 2;
                }
              }}
              onChange={() => this.toggleSelectAll()}
            />
          );
        },
        sortable: false,
        resizable: false,
        width: 30
      },

      {
        Header: "Host",
        accessor: "host",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 28
      },
      {
        Header: "Users",
        accessor: "numOfUsers",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 8
      },
      {
        Header: "Projects",
        accessor: "numOfProjects",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 12
      },
      {
        Header: "Patients",
        accessor: "numOfPatients",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 12
      },
      {
        Header: "Studies",
        accessor: "numOfStudies",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 10
      },
      {
        Header: "Series",
        accessor: "numOfSeries",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 8
      },
      {
        Header: "Aims",
        accessor: "numOfAims",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 8
      },
      {
        Header: "DSOs",
        accessor: "numOfDSOs",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 8
      },
      {
        Header: "PACs",
        accessor: "numOfPacs",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 8
      },
      {
        Header: "Queries",
        accessor: "numOfAutoQueries",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 10
      },
      {
        Header: "WorkLists",
        accessor: "numOfWorkLists",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 14
      },
      {
        Header: "Files",
        accessor: "numOfFiles",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 10
      },
      {
        Header: "Templates",
        accessor: "numOfTemplates",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 14
      },
      {
        Header: "Plugins",
        accessor: "numOfPlugins",
        sortable: true,
        // minResizeWidth: 20,
        minWidth: 10
      },
      {
        Header: "",
        minWidth: 5,
        Cell: original => {
          const template = original.row.checkbox;
          return (
            <div onClick={() => this.handleDeleteOne(template)}>
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          );
        }
      }
    ];
  };

  render = () => {
    console.log(this.state);
    const { data } = this.state;
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    return (
      <>
        <Header onClose={this.props.onOK} selection="Usage" />
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddProject}
          selected={checkboxSelected}
        />
        <Table
          className="pro-table info-admin"
          data={data}
          columns={this.defineColumns()}
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={pageSize}
        />
      </>
    );
  };
}

export default Admin;
