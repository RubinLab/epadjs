import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import {
  saveDefaultParameter,
  getDefaultParameter,
  deleteOneDefaultParameter,
  editDefaultparameter,
} from "../../../../../services/pluginServices";
import { FaRegTrashAlt } from "react-icons/fa";
import Popup from "../../common/Popup.jsx";
import "../../css/plugin.css";

class ParametersWindow extends React.Component {
  constructor(props) {
    super(props);
    console.log("props ", props);
    this.state = {
      defaultParameterList: [],
      parameterFormElements: {
        plugindbid: props.pluginid,
        paramid: "",
        name: "",
        format: "",
        prefix: "",
        inputBinding: "",
        default_value: "",
        creator: "",
        type: "",
        description: "",
      },
    };
    //console.log("modal log templates", props.allTemplates);
  }

  state = { addnew: false, allTemplates: [], editParam: false, update: false };

  componentWillMount = async () => {
    const tempDefaultParameterList = await getDefaultParameter(
      this.state.parameterFormElements.plugindbid
    );
    console.log("parameter lists", tempDefaultParameterList);
    this.setState({ defaultParameterList: tempDefaultParameterList });
  };

  componentDidUpdate = async () => {
    if (this.state.update === true) {
      const tempDefaultParameterList = await getDefaultParameter(
        this.state.parameterFormElements.plugindbid
      );
      console.log("parameter lists", tempDefaultParameterList);
      this.setState({
        defaultParameterList: tempDefaultParameterList,
        update: false,
      });
    }
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
      paramid: "",
      name: "",
      format: "",
      prefix: "",
      inputBinding: "",
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
    console.log(
      "save paramters after filled : ",
      this.state.parameterFormElements
    );
    console.log("parameter id :", this.state.parameterFormElements.paramid);
    if (
      this.state.parameterFormElements.paramid == "" ||
      this.state.parameterFormElements.format == ""
    ) {
      alert("Please select the required fields");
    } else {
      if (
        (this.state.parameterFormElements.format == "InputFolder" ||
          this.state.parameterFormElements.format == "OutputFolder") &&
        this.state.parameterFormElements.default_value == ""
      ) {
        alert("Please assign a default value");
      } else {
        this.setState({ addnew: false });
        const saveParameterResponse = await saveDefaultParameter(
          this.state.parameterFormElements
        );

        if (saveParameterResponse.status === 200) {
          console.log("parameters saved succesfully");
          this.props.notifyParameterParent(
            this.state.parameterFormElements.plugindbid,
            "addnew"
          );
          this.setState({ update: true });
        } else {
          toast.error("error happened while saving parameter", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          //  alert("an error occourred while saving parameters");
        }
      }
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
      this.setState({ update: true });
    } else {
      toast.error("error happened while deleting parameter", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      //  alert("an error occourred while deleting parameter");
    }
  };

  handleShowEditParameterWindow = (rowInfo) => {
    console.log("row click :", rowInfo);
    const tempParameterFormElements = {
      plugindbid: this.state.parameterFormElements.plugindbid,
      paramdbid: rowInfo.original.id,
      paramid: rowInfo.original.paramid,
      name: rowInfo.original.name,
      format: rowInfo.original.format,
      prefix: rowInfo.original.prefix,
      inputBinding: rowInfo.original.inputBinding,
      default_value: rowInfo.original.default_value,
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
      this.setState({ update: true });
    } else {
      toast.error("error happened while editing parameter", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      //  alert("an error occourred while editing parameters");
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
        Header: "id",
        accessor: "paramid",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
      },
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
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
        Header: "prefix",
        accessor: "prefix",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "inputbinding",
        accessor: "inputBinding",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
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
        Header: "type",
        accessor: "type",
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
  handleonMouseDown = (e) => {
    e.stopPropagation();

    console.log("The link was clicked.");
  };
  prepareDropDownHtmlForParameterIds = () => {
    let options = [];
    options.push(
      <option key="select" name="select" value="select">
        select
      </option>
    );
    options.push(
      <option key="output" name="output" value="output">
        output
      </option>
    );
    options.push(
      <option key="aims" name="aims" value="aims">
        aims
      </option>
    );
    options.push(
      <option key="dicoms" name="dicoms" value="dicoms">
        dicoms
      </option>
    );
    options.push(
      <option key="paramaters" name="parameters" value="parameters">
        parameters
      </option>
    );

    return options;
  };
  prepareDropDownHtmlForParameterFormat = () => {
    let options = [];
    options.push(
      <option key="select" name="select" value="select">
        select
      </option>
    );
    options.push(
      <option key="InputFolder" name="InputFolder" value="InputFolder">
        InputFolder
      </option>
    );
    options.push(
      <option key="InputFile" name="InputFile" value="InputFile">
        InputFile
      </option>
    );
    options.push(
      <option key="OutputFolder" name="OutputFolder" value="OutputFolder">
        OutputFolder
      </option>
    );
    options.push(
      <option key="Parameters" name="Parameters" value="Parameters">
        parameters
      </option>
    );

    return options;
  };
  prepareDropDownHtmlForParameterType = () => {
    let options = [];
    options.push(
      <option key="select" name="select" value="select">
        select
      </option>
    );
    options.push(
      //  <option key="ParamaterValue" name="Parameter" value="Value">
      //  text : Parameter Value -> Directory
      <option key="ParamaterValue" name="Parameter" value="Directory">
        Directory
      </option>
    );
    options.push(
      //
      //  text : Parameter Name/Value -> File
      <option key="Parameters" name="Parameter" value="File">
        File
      </option>
    );

    return options;
  };
  render() {
    const { error } = this.props;
    console.log(this.props.data);
    return (
      <div
        className="plugin_parameter_window_container"
        id="plugin_paramwindow"
      >
        <Popup>
          <div className="plugin_parameter_window_modal">
            <div className="plugin_parameter_window_header">
              <div className="title">Paramaters</div>
            </div>
            <div className="plugin_parameter_window_modal_body">
              {!this.state.addnew && (
                <ReactTable
                  className="pro-table"
                  data={this.state.defaultParameterList.data}
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
                  pageSizeOptions={[5, 10, 20, 50]}
                  defaultPageSize={5}
                />
              )}
              {this.state.addnew && (
                <div className="plugin_parameter_window_modal_addnew">
                  <h5>add new parameter</h5>
                  <form className="plugin_parameter_window_modal_form">
                    <h5 className="plugin_parameter_window_modal_label">id*</h5>
                    <select
                      className="pluginaddqueueselect"
                      id="paramid"
                      name="paramid"
                      onChange={this.handleFormElementChange}
                      onMouseDown={this.handleonMouseDown}
                      value={this.state.parameterFormElements.paramid}
                    >
                      {this.prepareDropDownHtmlForParameterIds()}
                    </select>
                    <h5 className="parameter_window_modal_label">Name</h5>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="name"
                      type="text"
                      onChange={this.handleFormElementChange}
                      id="form-first-element"
                      value={this.state.parameterFormElements.name}
                    />
                    <h5 className="parameter_window_modal_label">format*</h5>
                    <select
                      className="pluginaddqueueselect"
                      id="format"
                      name="format"
                      onChange={this.handleFormElementChange}
                      onMouseDown={this.handleonMouseDown}
                      value={this.state.parameterFormElements.format}
                    >
                      {this.prepareDropDownHtmlForParameterFormat()}
                    </select>
                    <h5 className="parameter_window_modal_label">prefix</h5>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="prefix"
                      type="text"
                      onChange={this.handleFormElementChange}
                      id="form-first-element"
                      value={this.state.parameterFormElements.prefix}
                    />
                    <h5 className="parameter_window_modal_label">
                      input binding
                    </h5>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="inputBinding"
                      type="text"
                      onChange={this.handleFormElementChange}
                      id="form-first-element"
                      value={this.state.parameterFormElements.inputBinding}
                    />
                    <h5 className="parameter_window_modal_label">
                      Default value
                    </h5>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="default_value"
                      type="text"
                      value={this.state.parameterFormElements.default_value}
                      onChange={this.handleFormElementChange}
                    />
                    <h5 className="parameter_window_modal_label">Type</h5>
                    <select
                      className="pluginaddqueueselect"
                      id="type"
                      name="type"
                      onChange={this.handleFormElementChange}
                      onMouseDown={this.handleonMouseDown}
                      value={this.state.parameterFormElements.type}
                    >
                      {this.prepareDropDownHtmlForParameterType()}
                    </select>
                    <h5 className="parameter_window_modal_label">
                      Description
                    </h5>
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
            </div>
            {this.state.addnew && !this.state.editParam && (
              <div className="plugin_parameter_window_modal_footer">
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
              </div>
            )}
            {this.state.editParam && (
              <div className="plugin_parameter_window_modal_footer">
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
              </div>
            )}
            {!this.state.addnew && (
              <div className="plugin_parameter_window_modal_footer">
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
              </div>
            )}
          </div>
        </Popup>
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
