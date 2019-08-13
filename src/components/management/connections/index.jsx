import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt, FaRegEye, FaEdit } from "react-icons/fa";
import {
  getPacs,
  deletePacs,
  updatePacs,
  createPacs
} from "../../../services/pacsServices";
import DeleteAlert from "../common/alertDeletionModal";
import UploadModal from "../../searchView/uploadModal";
import EditConnections from "./editConnection";
import ConnectionCreationForm from "./connectionCreationForm";

class Connections extends React.Component {
  state = {
    connections: [],
    projectList: {},
    hasAddClicked: false,
    delAll: false,
    delOne: false,
    selectAll: 0,
    selected: {},
    selectedOne: {},
    hasEditClicked: false,
    displayCreationForm: false
  };

  componentDidMount = async () => {
    this.getConnectionsData();
  };

  renderMessages = input => {
    return {
      deleteAll: "Delete selected connections? This cannot be undone.",
      deleteOne: `Delete the connection? This cannot be undone.`,
      missingFormInput: `Please fill the required fields!`
    };
  };
  getConnectionsData = async () => {
    const {
      data: {
        ResultSet: { Result: connections }
      }
    } = await getPacs();
    this.setState({ connections });
  };

  toggleRow = async pacID => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[pacID]) {
      delete newSelected[pacID];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[pacID] = true;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.connections.forEach(temp => {
        let tempID = temp.Template[0].templateUID;
        let projectID = temp.projectID ? temp.projectID : "lite";
        newSelected[tempID] = projectID;
      });
    }
    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      name: "",
      id: "",
      user: "",
      description: "",
      error: "",
      delAll: false,
      hasEditClicked: false,
      delOne: false,
      selectedOne: {},
      pacID: null,
      displayCreationForm: false,
      abbreviation: "",
      aeTitle: "",
      hostName: "",
      port: ""
    });
  };

  deleteAll = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    const promiseArr = [];
    for (let connection in newSelected) {
      if (connection) {
        promiseArr.push(deletePacs(connection));
      }
    }
    Promise.all(promiseArr)
      .then(() => {
        this.getConnectionsData();
        this.setState({ selectAll: 0, selected: {} });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getConnectionsData();
      });
    this.handleCancel();
  };

  handleDeleteAll = () => {
    const selectedArr = Object.keys(this.state.selected);
    if (selectedArr.length === 0) {
      return;
    } else {
      this.setState({ delAll: true });
    }
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    if (
      this.state.error === this.renderMessages().missingFormInput &&
      !this.state[name]
    ) {
      this.setState({ error: "" });
    }
    this.setState({ [name]: value });
  };

  handleDeleteOne = connectionData => {
    const { pacID } = connectionData;
    this.setState({
      delOne: true,
      pacID
      //   selectedOne: { [templateUID]: projectID }
    });
  };

  deleteOne = () => {
    deletePacs(this.state.pacID)
      .then(() => {
        const newSelected = { ...this.state.selected };
        if (newSelected[this.state.pacID]) {
          delete newSelected[this.state.pacID];
        }
        const selectAll = Object.keys(newSelected).length > 0 ? 2 : 0;
        this.getConnectionsData();
        this.setState({
          selectAll,
          selected: newSelected,
          delOne: false
        });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getConnectionsData();
      });
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({ original }) => {
          const { pacID } = original;
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[pacID]}
              onChange={() => this.toggleRow(pacID)}
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
        resizable: false
      },
      {
        Header: "Name",
        accessor: "aeTitle",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 350
      },
      // {
      //   Header: "Open",
      //   sortable: false,
      //   resizable: false,
      //   width: 75,
      //   Cell: original => {
      //     //   console.log(original.row.checkbox);
      //     return (
      //       <div>
      //         <FaRegEye className="menu-clickable" />
      //       </div>
      //     );
      //   }
      // },
      {
        Header: "Host",
        accessor: "hostname",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 350
      },
      {
        Header: "Port",
        accessor: "port",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 150
      },
      {
        Header: "",
        // width: 45,
        // minResizeWidth: 20,
        // resizable: true,
        Cell: original => (
          <div
            onClick={() => {
              const id = original.row.checkbox.pacID;
              const name = original.row.checkbox.aeTitle;
              const host = original.row.checkbox.hostname;
              const port = original.row.checkbox.port;
              const connectionToEdit = { id, name, host, port };

              this.setState({
                hasEditClicked: true,
                connectionToEdit
              });
            }}
          >
            <FaEdit className="menu-clickable" />
          </div>
        )
      },
      {
        Header: "",
        // width: 45,
        // minResizeWidth: 20,
        // resizable: false,
        Cell: original => {
          const connection = original.row.checkbox;
          return (
            <div onClick={() => this.handleDeleteOne(connection)}>
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          );
        }
      }
    ];
  };
  clearConenctionInfo = () => {
    this.setState({ connectionToEdit: {} });
  };
  editConnection = async () => {
    const { aeTitle, host, port } = this.state;
    const { id } = this.state.connectionToEdit;
    const editPromises = [];
    if (aeTitle) {
      editPromises.push(updatePacs(id, "aeTitle", aeTitle));
    }
    if (host) {
      editPromises.push(updatePacs(id, "hostname", host));
    }
    if (port) {
      editPromises.push(updatePacs(id, "port", port));
    }
    Promise.all(editPromises)
      .then(res => {
        this.getConnectionsData();
        this.handleCancel();
        // console.log("passed through");
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message
        });
        this.clearConenctionInfo();
        this.handleCancel();
      });
  };

  createConnection = e => {
    const { abbreviation, aeTitle, hostName, port } = this.state;
    if (!abbreviation || !aeTitle || !hostName || !port) {
      this.setState({ error: this.renderMessages().missingFormInput });
    } else {
      createPacs(abbreviation, aeTitle, hostName, port)
        .then(() => {
          this.getConnectionsData();
          this.setState({
            abbreviation: "",
            aeTitle: "",
            hostName: "",
            port: ""
          });
          this.handleCancel();
        })
        .catch(error => {
          toast.error(error.response.data.message, { autoClose: false });
          this.getConnectionsData();
          this.handleCancel();
        });
    }
  };

  handleClickAdd = () => {
    this.setState({ displayCreationForm: true });
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const data = this.state.connections;
    const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    console.log(this.state);
    return (
      <div className="connections menu-display">
        <ToolBar
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
          onAdd={this.handleClickAdd}
        />
        <ReactTable
          className="pro-table"
          data={this.state.connections}
          columns={this.defineColumns()}
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={pageSize}
        />
        {(this.state.delAll || this.state.delOne) && (
          <DeleteAlert
            message={
              this.state.delAll
                ? this.renderMessages().deleteAll
                : this.renderMessages().deleteOne
            }
            onCancel={this.handleCancel}
            onDelete={this.state.delAll ? this.deleteAll : this.deleteOne}
            error={this.state.errorMessage}
          />
        )}
        {this.state.displayCreationForm && (
          <ConnectionCreationForm
            onCancel={this.handleCancel}
            onType={this.handleFormInput}
            error={this.state.error}
            onSubmit={this.createConnection}
          />
        )}
        {this.state.hasEditClicked && (
          <EditConnections
            onCancel={this.handleCancel}
            connectionToEdit={this.state.connectionToEdit}
            onType={this.handleFormInput}
            onSubmit={this.editConnection}
          />
        )}
      </div>
    );
  };
}

export default Connections;
