import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import ReactTable from "react-table";
import {
  saveProjectParameter,
  getProjectParameter,
  deleteOneProjectParameter,
  editProjectParameter,
} from "../../../../../services/pluginServices";
import { FaRegTrashAlt } from "react-icons/fa";
class ParametersForProjectWindow extends React.Component {
  constructor(props) {
    super(props);
    console.log("props ", props);

    //console.log("modal log templates", props.allTemplates);
  }

  state = {
    defaultParameterList: [],
    parameterFormElements: {
      plugindbid: this.props.plugindbid,
      projectdbid: this.props.projectdbid,
      name: "",
      default_value: "",
      creator: "",
      type: "",
      description: "",
    },
    addnew: false,
    allTemplates: [],
    editParam: false,
  };

  componentWillMount = async () => {
    const tempDefaultParameterList = await getProjectParameter(
      this.props.plugindbid,
      this.props.projectdbid
    );
    console.log("parameter lists", tempDefaultParameterList);
    this.setState({ defaultParameterList: tempDefaultParameterList.data });
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
      plugindbid: this.props.plugindbid,
      projectdbid: this.props.projectdbid,
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
      "save project paramters after filled : ",
      this.state.parameterFormElements
    );
    const saveParameterResponse = await saveProjectParameter(
      this.state.parameterFormElements
    );
    if (saveParameterResponse.status === 200) {
      console.log("plugin project parameters saved succesfully");
      console.log("inserted data : ", saveParameterResponse.data);
      const tempDefaultParameterList = this.state.defaultParameterList;
      tempDefaultParameterList.push(saveParameterResponse.data);
      this.setState({ defaultParameterList: tempDefaultParameterList });
    } else {
      alert("an error occourred while saving project parameters");
    }
    //this.props.onSave();
  };
  dock;
  deleteOneParameter = async (parameterdbid) => {
    console.log("delete one called", parameterdbid);
    const deleteParameterResponse = await deleteOneProjectParameter(
      parameterdbid
    );
    console.log("delete one parameter response :", deleteParameterResponse);
    if (deleteParameterResponse.status === 200) {
      let tempDefaultParameterList = this.state.defaultParameterList.filter(
        (parameter) => {
          return parameter.id !== parameterdbid;
        }
      );
      this.setState({ defaultParameterList: tempDefaultParameterList });
      console.log("parameter deleted succesfully");
    } else {
      alert("an error occourred while deleting project parameter");
    }
  };
  handleShowEditParameterWindow = (rowInfo) => {
    console.log("row click :", rowInfo);
    const tempParameterFormElements = {
      plugindbid: this.props.plugindbid,
      projectdbid: this.props.projectdbid,
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
    const editParameterResponse = await editProjectParameter(
      this.state.parameterFormElements
    );
    if (editParameterResponse.status === 200) {
      console.log(
        "project parameters edited succesfully",
        JSON.stringify(editParameterResponse.data)
      );
      console.log(
        "default list needs to be like this :",
        JSON.stringify(this.state.defaultParameterList[1])
      );
      const editedData = editParameterResponse.data;
      const tempDefaultParameterList = this.state.defaultParameterList;
      for (let i = 0; i < tempDefaultParameterList.length; i++) {
        const editedData = editParameterResponse.data;
        if (tempDefaultParameterList[i].id === editedData.paramdbid) {
          let obj = {};
          obj = { ...tempDefaultParameterList[i], ...editedData };
          tempDefaultParameterList[i] = { ...obj };
          console.log("obj", JSON.stringify(obj));
        }
      }
      this.setState({ defaultParameterList: tempDefaultParameterList });
    } else {
      alert("an error occourred while editing project parameters");
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

    return (
      <div className="tools menu-display" id="template">
        <Modal.Dialog className="create-plugin__modal">
          <Modal.Header>
            <Modal.Title>Project Paramaters</Modal.Title>
          </Modal.Header>
          <Modal.Body className="create-user__modal--body">
            {!this.state.addnew && (
              <ReactTable
                className="pro-table"
                data={this.state.defaultParameterList}
                columns={this.defineParametersTableColumns()}
                getTdProps={(state, rowInfo, column, instance) => ({
                  onClick: () => {
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
                <h5>add new project parameter</h5>
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

export default ParametersForProjectWindow;
PropTypes.NewPluginWindow = {
  //onSelect: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
};
