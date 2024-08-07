import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import ReactTable from "react-table-v6";
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
        refreshdicoms:"0",
        name: "",
        sendname: "0",
        sendparamtodocker:"1",
        uploadimages:"0",
        uploadaims:"0",
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
    console.log('before : ',this.state.parameterFormElements) ;
    if (e.currentTarget.name != "sendname"  && e.currentTarget.name != "uploadimages" &&
    e.currentTarget.name != "uploadaims" && e.currentTarget.name != "sendparamtodocker" && e.currentTarget.name != "refreshdicoms") {
      if (e.currentTarget.name === "paramid"){
        plElements[e.currentTarget.name] = e.currentTarget.value;
        plElements["format"] = "select";
      }else{
        plElements[e.currentTarget.name] = e.currentTarget.value;
      
      
      }
    } else {
      if (e.currentTarget.checked){
        plElements[e.currentTarget.name] = "1";
      }else{
        plElements[e.currentTarget.name] = "0";
      }
     
    }
    //console.log("form elements : ", this.state.pluginFormElements);
    console.log(e.currentTarget.name, ": value : ", e.currentTarget.value);
    if (e.currentTarget.name === "sendname") {
      console.log(e.currentTarget.name, ": target : ", e.currentTarget.checked);
    }
    this.setState({ parameterFormElements: plElements });
    console.log('after : ',this.state.parameterFormElements) ;
  };

  showAddForm = () => {
    const tempParameterFormElements = {
      plugindbid: this.props.pluginid,
      paramid: "",
      refreshdicoms:"0",
      name: "",
      sendname: "0",
      sendparamtodocker: "1",
      uploadimages:"0",
      uploadaims:"0",
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
      sendname: String(rowInfo.original.sendname),
      uploadimages:String(rowInfo.original.uploadimages),
      uploadaims:String(rowInfo.original.uploadaims),
      sendparamtodocker : String(rowInfo.original.sendparamtodocker),
      refreshdicoms: String(rowInfo.original.refreshdicoms),
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
        id: "id",
        Header: "id",
        accessor: "paramid",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
      },
      {
        id: "format",
        Header: "format",
        accessor: "format",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        id :"value",
        Header: "value",
        accessor: "default_value",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        id: "name",
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
      },
      {
        id: "inputbinding",
        Header: "inputbinding",
        accessor: "inputBinding",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        id : "refreshdicoms",
        Header: "refresh dicoms",
        accessor: "refreshdicoms",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
        Cell: (data) => {
          console.log("me",data.original);
          if (data.original.refreshdicoms === 1){
            return (
              "yes"
            );
          }else{
            return (
              "no"
            );
          }
        },
      },
      {
        id : "sendparam",
        Header: "send param to docker",
        accessor: "sendparamtodocker",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
        Cell: (data) => {
          console.log("me",data.original);
          if (data.original.sendparamtodocker === 1){
            return (
              "yes"
            );
          }else{
            return (
              "no"
            );
          }

        },
      },
      {
        id: "sendname",
        Header: "send name",
        accessor: "sendname",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
        Cell: (data) => {
          console.log("me",data.original);
          if (data.original.sendname === 1){
            return (
              "yes"
            );
          }else{
            return (
              "no"
            );
          }

        },
      },
      {
        id: "uploadimages",
        Header: "upload images",
        accessor: "uploadimages",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
        Cell: (data) => {
          console.log("me",data.original);
          if (data.original.uploadimages === 1){
            return (
              "yes"
            );
          }else{
            return (
              "no"
            );
          }

        },
      },
      {
        id:"uploadaims",
        Header: "upload aims",
        accessor: "uploadaims",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
        Cell: (data) => {
          console.log("me",data.original);
          if (data.original.uploadaims === 1){
            return (
              "yes"
            );
          }else{
            return (
              "no"
            );
          }

        },
      },
      {
        id: "prefix",
        Header: "prefix",
        accessor: "prefix",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        id:"type",
        Header: "type",
        accessor: "type",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },

      {
        id: "desciption",
        Header: "description",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        id:"deleteone",
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
    options.push(
      <option key="dockeroptions" name="dockeroptions" value="dockeroptions">
        docker options
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
    switch (this.state.parameterFormElements.paramid) {
      case "output":
        options.push(
          <option key="OutputFolder" name="OutputFolder" value="OutputFolder">
            output folder
          </option>
        );
        options.push(
          <option key="OutputFile" name="OutputFile" value="OutputFile">
            output file
          </option>
        );
        break;
      case "aims":
        options.push(
          <option key="InputFolder" name="InputFolder" value="InputFolder">
            input folder
          </option>
        );
        options.push(
          <option key="InputFile" name="InputFile" value="InputFile">
            input file
          </option>
        );
        break;
      case "dicoms":
        options.push(
          <option key="InputFolder" name="InputFolder" value="InputFolder">
            input folder
          </option>
        );
        options.push(
          <option key="InputFile" name="InputFile" value="InputFile">
            input file
          </option>
        );
        break;
      case "parameters":
        options.push(
          <option key="Parameters" name="Parameters" value="Parameters">
            parameters
          </option>
        );
        break;
      case "dockeroptions":
        options.push(
          <option key="sharedram" name="sharedram" value="sharedram">
            shared ram
          </option>
        );
        options.push(
          <option key="driver" name="driver" value="driver">
            driver
          </option>
        );
        options.push(
          <option key="deviceids" name="deviceids" value="deviceids">
            device ids
          </option>
        );
        options.push(
          <option key="capabilities" name="capabilities" value="capabilities">
            capabilities
          </option>
        );
        break;
      default:
    }

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
        directory
      </option>
    );
    options.push(
      //
      //  text : Parameter Name/Value -> File
      <option key="Parameters" name="Parameter" value="File">
        file
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
                  NoDataComponent={() => null}
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
                    <h5 className="plugin_parameter_window_modal_label">
                      type*
                    </h5>
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
                    {this.state.parameterFormElements.paramid === "dicoms" && this.state.parameterFormElements.refreshdicoms === "0" &&
                      <div><h5>refresh patient images</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="refreshdicoms"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="refreshdicoms"
                      value={this.state.parameterFormElements.refreshdicoms}
                    /></div>}
                      {this.state.parameterFormElements.paramid === "dicoms" && this.state.parameterFormElements.refreshdicoms === "1" &&
                      <div><h5>refresh patient images</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="refreshdicoms"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="refreshdicoms"
                      value={this.state.parameterFormElements.refreshdicoms}
                      checked
                    /></div>}
                    {this.state.parameterFormElements.paramid === "parameters" && this.state.parameterFormElements.sendparamtodocker === "0" &&
                      <div><h5>Send parameter to docker</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="sendparamtodocker"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="sendparamtodocker"
                      value={this.state.parameterFormElements.sendparamtodocker}
                    /></div>}
                      {this.state.parameterFormElements.paramid === "parameters" && this.state.parameterFormElements.sendparamtodocker === "1" &&
                      <div><h5>Send parameter to docker</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="sendparamtodocker"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="sendparamtodocker"
                      value={this.state.parameterFormElements.sendparamtodocker}
                      checked
                    /></div>}


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

                    {this.state.parameterFormElements.sendname === "1" && 
                      <div><h5>Send name as parameter</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="sendname"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="sendname"
                      value={this.state.parameterFormElements.sendname}
                      checked
                    /></div>}
                    {this.state.parameterFormElements.sendname === "0" && 
                      <div><h5>Send name as parameter</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="sendname"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="sendname"
                      value={this.state.parameterFormElements.sendname}
                    /></div>}


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
                    {this.state.parameterFormElements.format === "OutputFolder" && this.state.parameterFormElements.uploadimages === "0" &&
                      <div><h5>Upload back images</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="uploadimages"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="uploadimages"
                      value={this.state.parameterFormElements.uploadimages}
                    /></div>}
                      {this.state.parameterFormElements.format === "OutputFolder" && this.state.parameterFormElements.uploadimages === "1" &&
                      <div><h5>Upload back images</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="uploadimages"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="uploadimages"
                      value={this.state.parameterFormElements.uploadimages}
                      checked
                    /></div>}
                      {this.state.parameterFormElements.format === "OutputFolder" && this.state.parameterFormElements.uploadaims === "1" &&
                      <div><h5>Upload back aims</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="uploadaims"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="uploadaims"
                      value={this.state.parameterFormElements.uploadaims}
                      checked
                    /></div>}
                     {this.state.parameterFormElements.format === "OutputFolder" && this.state.parameterFormElements.uploadaims === "0" &&
                      <div><h5>Upload back aims</h5><input
                      //onMouseDown={(e) => e.stopPropagation()}
                      className="parameter_window_modal_label"
                      name="uploadaims"
                      type="checkbox"
                      onChange={this.handleFormElementChange}
                      id="uploadaims"
                      value={this.state.parameterFormElements.uploadaims}
                    /></div>}
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
                    {/* <h5 className="parameter_window_modal_label">Type</h5>
                    <select
                      className="pluginaddqueueselect"
                      id="type"
                      name="type"
                      onChange={this.handleFormElementChange}
                      onMouseDown={this.handleonMouseDown}
                      value={this.state.parameterFormElements.type}
                    >
                      {this.prepareDropDownHtmlForParameterType()}
                    </select> */}
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
