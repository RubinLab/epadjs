import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import ReactTable from "react-table";
import {
  saveDefaultParameter,
  getDefaultParameter,
  deleteOneDefaultParameter,
  editDefaultparameter,
} from "../../../../../services/pluginServices";
import { FaRegTrashAlt } from "react-icons/fa";
class ParametersWindow extends React.Component {
  constructor(props) {
    super(props);
    console.log("props ", props);
    this.state = {
      defaultParameterList: [],
      parameterFormElements: {
        plugindbid: props.pluginid,
        name: "",
        default_value: "",
        creator: "",
        type: "",
        description: "",
      },
    };
    //console.log("modal log templates", props.allTemplates);
  }

  state = { addnew: false, allTemplates: [], editParam: false };

  componentWillMount = async () => {
    const tempDefaultParameterList = await getDefaultParameter(
      this.state.parameterFormElements.plugindbid
    );
    console.log("parameter lists", tempDefaultParameterList);
    this.setState({ defaultParameterList: tempDefaultParameterList });
  };

  handleFormElementChange = (e) => {
    const plElements = { ...this.state.parameterFormElements };
    if (e.currentTarget.name != "enabled") {
      plElements[e.currentTarget.name] = e.currentTarget.value;
    } else {
      plElements[e.currentTarget.name] = e.currentTarget.checked;
    }
    //console.log("form elements : ", this.state.pluginFormElements);
    console.log(e.currentTarget.name, ": value : ", e.currentTarget.value);
    if (e.currentTarget.name === "enabled") {
      console.log(e.currentTarget.name, ": target : ", e.currentTarget.checked);
    }
    this.setState({ parameterFormElements: plElements });
  };
  showAddForm = () => {
    const tempParameterFormElements = {
      plugindbid: this.props.pluginid,
      name: "",
      default_value: "",
      creator: "",
      type: "",
      description: "",
    };
    this.setState({
      addnew: true,
      parameterFormElements: tempParameterFormElements,
    });
  };
  closeAddForm = () => {
    this.setState({ addnew: false });
  };
  saveParameters = async () => {
    this.setState({ addnew: false });
    console.log(
      "save paramters after filled : ",
      this.state.parameterFormElements
    );
    const saveParameterResponse = await saveDefaultParameter(
      this.state.parameterFormElements
    );
    if (saveParameterResponse.status === 200) {
      console.log("parameters saved succesfully");
      this.props.notifyParameterParent(
        this.state.parameterFormElements.plugindbid,
        "addnew"
      );
    } else {
      alert("an error occourred while saving parameters");
    }
    //this.props.onSave();
  };
  dock;
  deleteOneParameter = async (parameterdbid) => {
    console.log("delete one called", parameterdbid);
    const deleteParameterResponse = await deleteOneDefaultParameter(
      parameterdbid
    );
    console.log("delete one parameter response :", deleteParameterResponse);
    if (deleteParameterResponse.status === 200) {
      console.log("parameter deleted succesfully");
      this.props.notifyParameterParent(
        this.state.parameterFormElements.plugindbid,
        "addnew"
      );
    } else {
      alert("an error occourred while deleting parameter");
    }
  };
  handleShowEditParameterWindow = (rowInfo) => {
    console.log("row click :", rowInfo);
    const tempParameterFormElements = {
      plugindbid: this.state.parameterFormElements.plugindbid,
      paramdbid: rowInfo.original.id,
      name: rowInfo.original.name,
      default_value: rowInfo.original.default_value,
      creator: rowInfo.original.creator,
      type: rowInfo.original.type,
      description: rowInfo.original.description,
    };
    this.setState({
      editParam: true,
      addnew: true,
      parameterFormElements: tempParameterFormElements,
    });
  };
  handleEditParameterSave = async () => {
    console.log("edit paramter save clicked");
    const editParameterResponse = await editDefaultparameter(
      this.state.parameterFormElements
    );
    if (editParameterResponse.status === 200) {
      console.log("parameters edited succesfully");
      this.props.notifyParameterParent(
        this.state.parameterFormElements.plugindbid,
        "addnew"
      );
      // this.props.notifyParameterParent(
      //   this.state.parameterFormElements.plugindbid,
      //   "addnew"
      // );
    } else {
      alert("an error occourred while editing parameters");
    }

    this.setState({ editParam: false, addnew: false });
  };
  handleCloseEditForm = () => {
    console.log("edit paramter close clicked");
    this.setState({ editParam: false, addnew: false });
  };
  defineParametersTableColumns = () => {
    return [
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
      },
      {
        Header: "value",
        accessor: "default_value",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "format",
        accessor: "format",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "type",
        accessor: "type",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "prefix",
        accessor: "prefix",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "inputbinding",
        accessor: "inputbinding",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "description",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "",
        Cell: (data) => {
          //const rowdata = original.row.checkbox;
          return (
            <div onClick={() => this.deleteOneParameter(data.original.id)}>
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          );
        },
      },
    ];
  };
  render() {
    const { error } = this.props;
    console.log(this.props.data);
    return (
      <div className="tools menu-display" id="template">
        <Modal.Dialog className="create-plugin__modal">
          <Modal.Header>
            <Modal.Title>Paramaters</Modal.Title>
          </Modal.Header>
          <Modal.Body className="create-user__modal--body">
            {!this.state.addnew && (
              <ReactTable
                className="pro-table"
                data={this.props.data}
                columns={this.defineParametersTableColumns()}
                getTdProps={(state, rowInfo, column, instance) => ({
                  onClick: () => {
                    console.log("column data :", column.Header);
                    if (column.Header != "") {
                      if (typeof rowInfo !== "undefined") {
                        this.handleShowEditParameterWindow(rowInfo);
                      }
                    }
                  },
                })}
                pageSizeOptions={[10, 20, 50]}
                defaultPageSize={10}
              />
            )}
            {this.state.addnew && (
              <div>
                <h5>add new parameter</h5>
                <form className="add-project__modal--form">
                  <h5 className="add-project__modal--label">Name*</h5>
                  <input
                    onMouseDown={(e) => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="name"
                    type="text"
                    onChange={this.handleFormElementChange}
                    id="form-first-element"
                    value={this.state.parameterFormElements.name}
                  />
                  <h5 className="add-project__modal--label">Default value*</h5>
                  <input
                    onMouseDown={(e) => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="default_value"
                    type="text"
                    value={this.state.parameterFormElements.default_value}
                    onChange={this.handleFormElementChange}
                  />
                  <h5 className="add-project__modal--label">Type*</h5>
                  <input
                    onMouseDown={(e) => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="type"
                    type="text"
                    value={this.state.parameterFormElements.type}
                    onChange={this.handleFormElementChange}
                  />
                  <h5 className="add-project__modal--label">Description*</h5>
                  <input
                    onMouseDown={(e) => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="description"
                    type="text"
                    value={this.state.parameterFormElements.description}
                    onChange={this.handleFormElementChange}
                  />

                  <h5 className="form-exp required">*Required</h5>
                  {error && <div className="err-message">{error}</div>}
                </form>
              </div>
            )}
          </Modal.Body>
          {this.state.addnew && !this.state.editParam && (
            <Modal.Footer className="create-user__modal--footer">
              <div className="create-user__modal--buttons">
                <button
                  variant="primary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.saveParameters}
                >
                  save
                </button>
                <button
                  variant="secondary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.closeAddForm}
                >
                  Close
                </button>
              </div>
            </Modal.Footer>
          )}
          {this.state.editParam && (
            <Modal.Footer className="create-user__modal--footer">
              <div className="create-user__modal--buttons">
                <button
                  variant="primary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.handleEditParameterSave}
                >
                  save
                </button>
                <button
                  variant="secondary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.handleCloseEditForm}
                >
                  Close
                </button>
              </div>
            </Modal.Footer>
          )}
          {!this.state.addnew && (
            <Modal.Footer className="create-user__modal--footer">
              <div className="create-user__modal--buttons">
                <button
                  variant="primary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.showAddForm}
                >
                  add parameter
                </button>
                <button
                  variant="secondary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.props.onCancel}
                >
                  Close
                </button>
              </div>
            </Modal.Footer>
          )}
        </Modal.Dialog>
      </div>
    );
  }
}

export default ParametersWindow;
PropTypes.NewPluginWindow = {
  //onSelect: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
};
