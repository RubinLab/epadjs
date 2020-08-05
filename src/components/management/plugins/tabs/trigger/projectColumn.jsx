import React from "react";
import ReactTable from "react-table";
import { getPluginsForProject } from "../../../../../services/pluginServices";
import { getSummaryAnnotations } from "../../../../../services/annotationServices";
import { getProjects } from "../../../../../services/projectServices";
import { FaCogs } from "react-icons/fa";
import RunTimeParamWindow from "./runtimeParamWindow";
import { addPluginsToQueue } from "../../../../../services/pluginServices";
import { toast } from "react-toastify";
import "../../css/plugin.css";

class ProjectColumn extends React.Component {
  state = {
    selectedProjectText: "select",
    selectedPluinText: "select",
    selectedParameterTypeText: "select",

    projectList: [],
    pluginList: [],
    parameterList: [],
    queueObjectList: [],
    annotationList: [],
    queueObject: {
      queueId: -1,
      projectDbId: -1,
      projectId: "",
      projectName: "",
      pluginDbId: -1,
      pluginId: "",
      pluginName: "",
      pluginType: "", //local or pluginstore
      processMultipleAims: null, // -1 : -> null -> no aim ; 0 -> only one aim ; 1-> multiple aim
      runtimeParams: {},
      parameterType: "",
      aims: {},
    },
    selectedAims: {},
    runtimeParams: {},

    selectedProjectId: "select",
    selectedProjectDbId: -1,
    selectedProjectName: "",

    selectedPluginDbId: -1,
    selectedPluginId: "",
    selectedPluginName: "",
    selectedPluginProcessMultipleAims: null,

    selectedParameterTypeId: "select",

    optionsHtml: "",
    projectDropDownUpdate: false,
    pluginDropDownUpdate: false,
    parameterTypeDropDownUpdate: false,
    annotationDropDownUpdate: false,

    projectDropDownSelected: false,
    pluginDropDownSelected: false,
    parameterTypeDropDownSelected: false,
    annotationDropDownSelected: false,
    selectAll: false,
    showParamWindow: false,

    aimIdForParams: "",
  };

  componentDidMount = async () => {
    console.log("component will mount");
    const { data } = await getProjects();
    const projectsForUser = data;
    console.log("project for users ", projectsForUser.data);
    this.setState({ projectList: projectsForUser });
  };
  componentDidUpdate = async () => {
    console.log("componenet is updating ");
    if (this.state.projectDropDownUpdate === true) {
      if (this.state.selectedProjectId !== "select") {
        const { data: dataplugin } = await getPluginsForProject(
          this.state.selectedProjectId
        );
        console.log("plugins for projects ", dataplugin.projectplugin);
        const { data: dataAnnotation } = await getSummaryAnnotations(
          this.state.selectedProjectId
        );
        console.log("annotation data : ", dataAnnotation);

        this.setState({
          pluginList: dataplugin.projectplugin,
          annotationList: dataAnnotation,
          projectDropDownUpdate: false,
          parameterDropDownSelected: false,
          selectedParameterTypeId: "select",
        });
      } else {
        this.setState({
          parameterDropDownSelected: false,
          selectedProjectId: "select",
        });
      }
      this.setState({ projectDropDownUpdate: false });
    }
    if (this.state.pluginDropDownUpdate === true) {
      //get parameters
      if (this.state.selectedPluginDbId === "-1") {
        this.setState({
          parameterDropDownSelected: false,
          selectedParameterTypeId: "select",
        });
      }

      this.setState({
        pluginDropDownUpdate: false,
        selectedParameterTypeId: "select",
        parameterDropDownSelected: false,
      });
    }
    if (this.state.parameterDropDownUpdate === true) {
      if (this.state.selectedPluginProcessMultipleAims === null) {
        if (this.state.selectedParameterTypeId === "runtime") {
          this.setState({
            parameterDropDownUpdate: false,
            parameterDropDownSelected: false,
            showParamWindow: true,
          });
        } else {
          this.setState({
            parameterDropDownUpdate: false,
            parameterDropDownSelected: false,
          });
        }
      } else {
        if (
          this.state.selectedPluginProcessMultipleAims === 1 &&
          this.state.selectedParameterTypeId === "runtime"
        ) {
          this.setState({
            showParamWindow: true,
            parameterDropDownUpdate: false,
          });
        } else {
          this.setState({
            parameterDropDownUpdate: false,
          });
        }
      }
    }
  };
  handleChangeProject = (e) => {
    console.log("change project caled");
    const targetSelectObjId = e.target.id;
    const targetSelectObjValue = e.target.value;
    console.log("e.target project", e.target.id);

    switch (targetSelectObjId) {
      case "projects":
        let isSelected = false;
        if (targetSelectObjValue !== "select") {
          isSelected = true;
        }
        console.log("project clicked setting the state for sleted project");
        this.setState({
          selectedProjectText: e.target.value,
          selectedProjectName: e.target.name,
          selectedProjectId: e.target.value,
          projectDropDownSelected: isSelected,
          selectedPluinText: "select",
          selectedPluginDbId: -1,
          projectDropDownUpdate: true,
          pluginDropDownSelected: false,
        });
        break;

      default:
      // code block
    }
  };
  handleChangePlugin = (e) => {
    const tempPluginDbId = parseInt(e.target.value);
    console.log("e.target ", e.target.id);

    let isSelected = false;
    if (tempPluginDbId !== -1) {
      isSelected = true;
    }
    console.log(
      "plugin clicked setting the state for sleted plugin",
      tempPluginDbId
    );
    let tempProjectDbId = -1;
    let tempPluginId = "";
    let tempProcessMultipleAims = null;
    const pluginListSize = this.state.pluginList.length;
    if (pluginListSize > 0) {
      tempProjectDbId = this.state.pluginList[0].project_plugin.project_id;
      for (let i = 0; i < pluginListSize; i++) {
        if (this.state.pluginList[i].id === tempPluginDbId) {
          console.log("fund");
          console.log(this.state.pluginList[i].id, " === ", tempPluginDbId);
          tempPluginId = this.state.pluginList[i].plugin_id;
          tempProcessMultipleAims = this.state.pluginList[i]
            .processmultipleaims;
          break;
        } else {
          console.log(
            " typeof this.state.pluginList[i].id",
            typeof this.state.pluginList[i].id
          );
          console.log(" typeof ttempPluginDbId", typeof tempPluginDbId);
          console.log("not found ");
          console.log(this.state.pluginList[i].id, " === ", tempPluginDbId);
        }
      }
    }
    console.log("plugin : ", this.state.pluginList);

    this.setState({
      selectedPluinText: e.target.value,
      selectedPluginName: e.target.name,
      selectedPluginDbId: tempPluginDbId,
      selectedPluginId: tempPluginId,
      selectedPluginProcessMultipleAims: tempProcessMultipleAims,
      selectedProjectDbId: tempProjectDbId,
      pluginDropDownSelected: isSelected,
      pluginDropDownUpdate: true,
    });
  };

  handleChangeParameter = (e) => {
    const targetSelectObjValue = e.target.value;
    console.log("e.target ", e.target.id);

    let isSelected = false;
    if (targetSelectObjValue !== "select") {
      isSelected = true;
    }
    console.log(
      "plugin clicked setting the state for sleted plugin",
      targetSelectObjValue
    );
    this.setState({
      selectedParameterTypeText: e.target.value,
      selectedParameterTypeId: targetSelectObjValue,

      parameterDropDownSelected: isSelected,
      parameterDropDownUpdate: true,
    });
  };

  prepareDropDownHtmlForProjects = () => {
    const list = this.state.projectList;
    let options = [];
    for (let i = 0; i < list.length; i++) {
      options.push(
        <option key={list[i].id} value={list[i].id}>
          {list[i].name}
        </option>
      );
    }

    return options;
  };
  prepareDropDownHtmlForPlugins = () => {
    const list = this.state.pluginList;
    let options = [];
    for (let i = 0; i < list.length; i++) {
      options.push(
        <option key={list[i].id} value={list[i].id}>
          {list[i].name}
        </option>
      );
    }

    return options;
  };
  prepareDropDownHtmlForParameterTypes = () => {
    let options = [];
    options.push(
      <option key="select" value="select">
        select
      </option>
    );
    options.push(
      <option key="default" value="default">
        default
      </option>
    );
    options.push(
      <option key="project" value="project">
        project
      </option>
    );
    options.push(
      <option key="runtime" value="runtime">
        runtime
      </option>
    );

    return options;
  };
  handleonMouseDown = (e) => {
    e.stopPropagation();

    console.log("The link was clicked.");
  };
  handleParamsClick = (original) => {
    const aimID = original.aimID;
    console.log("params clicked", aimID);
    console.log("selected project ", this.state.selectedProjectId);
    console.log("selected plugin ", this.state.selectedPluginDbId);
    console.log("selected paramtype ", this.state.selectedParameterTypeId);
    console.log(
      "checking aim if selected before opening params window",
      this.state.selectedAims
    );
    console.log("aim id match ", aimID);
    let verifyIfAnnotSelectedForParam = false;
    verifyIfAnnotSelectedForParam = console.log(
      "has own prop",
      this.state.selectedAims.hasOwnProperty(aimID)
    );
    if (Object.keys(this.state.selectedAims).length !== 0) {
      if (this.state.selectedAims.hasOwnProperty(aimID)) {
        this.setState({ showParamWindow: true, aimIdForParams: aimID });
      } else {
        toast.warn(
          "click on the correct row's param or select the annotation",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        //  alert("click on the correct row's param or select the annotation");
      }
    } else {
      toast.warn("select an annotation to continue", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      //  alert("select an annotation");
    }
  };

  handleAddSelectedAnnotations = async () => {
    let send = false;
    const tempQueueObject = { ...this.state.queueObject };
    tempQueueObject.projectDbId = this.state.selectedProjectDbId;
    tempQueueObject.projectId = this.state.selectedProjectId;
    tempQueueObject.projectName = this.state.selectedProjectName;

    tempQueueObject.pluginDbId = this.state.selectedPluginDbId;
    tempQueueObject.pluginId = this.state.selectedPluginId;
    tempQueueObject.pluginName = this.state.selectedPluginName;
    tempQueueObject.pluginType = "local";
    tempQueueObject.processMultipleAims = this.state.selectedPluginProcessMultipleAims;
    tempQueueObject.runtimeParams = { ...this.state.runtimeParams };
    tempQueueObject.parameterType = this.state.selectedParameterTypeId;
    tempQueueObject.aims = { ...this.state.selectedAims };

    console.log("------------------------add selected annotations");
    console.log("selected projectId ", this.state.selectedProjectId);
    console.log("selected projectDbId ", this.state.selectedProjectDbId);
    console.log("selected pluginId ", this.state.selectedPluginId);
    console.log("selected pluginDbId ", this.state.selectedPluginDbId);
    console.log(
      "selected parameterTypeid ",
      this.state.selectedParameterTypeId
    );
    console.log("selected selected aims  ", this.state.selectedAims);
    console.log(
      "process multiple aims  ",
      this.state.selectedPluginProcessMultipleAims
    );
    console.log("runtime parasm ", this.state.runtimeParams);

    const tempSelectedPluginProcessMultipleAims = this.state
      .selectedPluginProcessMultipleAims;

    switch (tempSelectedPluginProcessMultipleAims) {
      case null:
        if (
          this.state.selectedParameterTypeId === "runtime" &&
          Object.keys(this.state.runtimeParams).length === 0
        ) {
          toast.warn("set runtime parameters", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          //  alert("set runtime parameters !");
        } else {
          console.log("save queue object and send to the queue");
          send = true;
          toast.info("plugin process added to the queue, switch to track tab", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          // lert("plugin saved  for case null !");
        }

        break;
      case 0:
        let error = false;
        if (Object.keys(this.state.selectedAims).length !== 0) {
          if (this.state.selectedParameterTypeId === "runtime") {
            for (let [key, value] of Object.entries(this.state.selectedAims)) {
              console.log("key ", key, "value ", value);
              if (value.hasOwnProperty("pluginparamters")) {
                console.log("plugin saved to the queue for 0 case and runtime");
                send = true;
                toast.info(
                  "plugin process added to the queue, switch to track tab",
                  {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  }
                );
                //  alert("plugin saved to the queue");
              } else {
                toast.warn("set parameters for all aims", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
                //  alert("set params for all aims");
                return;
              }
            }
          } else {
            send = true;
            toast.info(
              "plugin process added to the queue, switch to track tab",
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
            //  alert("plugin saved to the queue for 0 ");
          }
        } else {
          toast.warn("select an annotation", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          //  alert("Please select an annotation");
        }
        // code block
        break;
      case 1:
        if (
          this.state.selectedParameterTypeId === "runtime" &&
          Object.keys(this.state.runtimeParams).length === 0
        ) {
          toast.warn("set runtime params", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          //  alert("set runtime parameters !");
        } else {
          if (Object.keys(this.state.selectedAims).length !== 0) {
            console.log("save queue object and send to the queue");
            send = true;
            toast.info(
              "plugin process added to the queue, switch to track tab",
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
            //  alert("plugin saved for case 1!");
          } else {
            console.log("select an aim");
            toast.warn("select an aim", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            //  alert("please select an aim");
          }
        }
        break;
      default:
      // code block
    }
    if (send === true) {
      send = false;
      const resultAddQueue = await addPluginsToQueue(tempQueueObject);

      if (resultAddQueue.status === 200) {
        this.setState({
          selectedProjectText: "select",
          selectedProjectName: "",
          selectedProjectId: "select",

          selectedPluinText: "select",
          selectedPluginDbId: -1,
          projectDropDownUpdate: true,
          projectDropDownSelected: false,
          pluginDropDownSelected: false,
          selectedProjectId: "select",
          selectedProjectDbId: -1,
          selectedProjectName: "",
          parameterDropDownSelected: false,
          selectedParameterTypeId: "select",
        });
      }
    }
  };

  handleSelectOneAnnotation = (original) => {
    const tempSelectedAims = this.state.selectedAims;
    console.log("one checkbox clicked ", original.aimID);
    if (tempSelectedAims.hasOwnProperty(original.aimID)) {
      console.log("this aim already added removing");
      delete tempSelectedAims[original.aimID];
    } else {
      tempSelectedAims[original.aimID] = original;
    }
    console.log("state of selected aims ", tempSelectedAims);
    this.setState({ selectedAims: tempSelectedAims });
  };
  handleSelectAllAnnotations = () => {
    const tempSelectedAims = {};
    if (this.state.selectAll === false) {
      const tempAnnotationList = this.state.annotationList;
      for (let i = 0; i < tempAnnotationList.length; i++) {
        tempSelectedAims[tempAnnotationList[i].aimID] = tempAnnotationList[i];
      }
      console.log("select all ===false", tempSelectedAims);
      this.setState({ selectAll: true, selectedAims: tempSelectedAims });
    } else {
      this.setState({ selectAll: false, selectedAims: tempSelectedAims });
    }
  };
  handleCancelShowParamwindow = () => {
    this.setState({ showParamWindow: false });
  };
  handleSaveRunTimeParamsForAim = (aparam) => {
    // if plugin requires one aim , runtime parameters is added to aim object ,
    //  if no aim or multiple aim require paramters will be in te runtimeParams vaiable.
    console.log(
      "aim id to save params if the plugin is annotation plugins ",
      this.state.aimIdForParams
    );
    if (this.state.aimIdForParams === "") {
      this.setState({ runtimeParams: aparam, showParamWindow: false });
      console.log(
        "this plugin is not annotation plugin or multi aims plugin so parameters will be written in runtimeParams "
      );
    } else {
      const tempSelectedAims = this.state.selectedAims;
      console.log(
        "this is annotation plugin. Writing paramters in aim object in selected aims"
      );
      console.log("selcted aims ", this.state.selectedAims);
      const tempAimObjectToWriteParams = this.state.selectedAims[
        this.state.aimIdForParams
      ];
      tempAimObjectToWriteParams["pluginparamters"] = {
        ...aparam,
      };
      console.log("this aim ", tempAimObjectToWriteParams);
      this.setState({ showParamWindow: false });
    }
    console.log(
      "param save returns to projectColumn(Parent component) ",
      aparam
    );
  };
  defineAnnotationsTableColumns = () => {
    return [
      {
        Header: (x) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selectAll === true}
              onChange={() => this.handleSelectAllAnnotations()}
            />
          );
        },
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selectedAims[original.aimID]}
              onChange={() => this.handleSelectOneAnnotation(original)}
            />
          );
        },

        // sortable: false,
        resizable: false,
        // minResizeWidth: 20
        // maxWidth: 45
      },
      {
        Header: "patient name",
        accessor: "patientName",
        sortable: true,
        resizable: true,
        minResizeWidth: 150,
        width: 150,
        className: "trHeader",
      },
      {
        Header: "name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 150,
        width: 150,
      },
      {
        Cell: ({ original }) => {
          const { aimID } = original;
          return (
            this.state.selectedParameterTypeId === "runtime" &&
            this.state.selectedPluginProcessMultipleAims === 0 && (
              <div onClick={() => this.handleParamsClick(original)}>
                <FaCogs />
              </div>
            )
          );
        },
      },
    ];
  };
  render() {
    return (
      <div className="plugin_trigger_project_column_inner_container ">
        <h2></h2>
        <table className="plugin_trigger_table">
          <tbody>
            <tr className="trHeader">
              <td>projects</td>
              {this.state.projectDropDownSelected && <td>plugins</td>}
              {this.state.pluginDropDownSelected && <td>parameter type</td>}
              {this.state.parameterDropDownSelected && <td></td>}
            </tr>
            <tr padding="10px">
              <td padding="10px">
                <select
                  className="pluginaddqueueselect"
                  id="projects"
                  onChange={this.handleChangeProject}
                  onMouseDown={this.handleonMouseDown}
                  value={this.state.selectedProjectId}
                >
                  <option key="select" value="select">
                    select
                  </option>
                  {this.prepareDropDownHtmlForProjects()}
                </select>
              </td>
              <td>
                {this.state.projectDropDownSelected && (
                  <select
                    className="pluginaddqueueselect"
                    id="plugins"
                    onChange={this.handleChangePlugin}
                    onMouseDown={this.handleonMouseDown}
                    value={this.state.selectedPluginDbId}
                  >
                    <option key="-1" value="-1">
                      select
                    </option>
                    {this.prepareDropDownHtmlForPlugins()}
                  </select>
                )}
              </td>
              <td>
                {this.state.pluginDropDownSelected && (
                  <select
                    className="pluginaddqueueselect"
                    id="parametertype"
                    onChange={this.handleChangeParameter}
                    onMouseDown={this.handleonMouseDown}
                    value={this.state.selectedParameterTypeId}
                  >
                    {this.prepareDropDownHtmlForParameterTypes()}
                  </select>
                )}
              </td>
              <td>
                {this.state.selectedParameterTypeId !== "select" && (
                  <div>
                    <button
                      variant="primary"
                      className="btn btn-sm btn-outline-light"
                      onClick={this.handleAddSelectedAnnotations}
                    >
                      add selected
                    </button>
                  </div>
                )}
              </td>
            </tr>
            {this.state.parameterDropDownSelected && (
              <tr className="trHeader">
                <td className="trHeader" colSpan="4">
                  Annotations
                </td>
              </tr>
            )}
            <tr>
              <td className="trHeader" colSpan="4">
                {this.state.parameterDropDownSelected && (
                  <ReactTable
                    className="pro-table"
                    data={this.state.annotationList}
                    columns={this.defineAnnotationsTableColumns()}
                    pageSizeOptions={[10, 20, 50]}
                    defaultPageSize={10}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>
        {this.state.showParamWindow && (
          <RunTimeParamWindow
            className="trHeader"
            onCancel={this.handleCancelShowParamwindow}
            onSave={this.handleSaveRunTimeParamsForAim}
            // onChange={this.handleAddPluginChange}
            selectedPluginDbId={this.state.selectedPluginDbId}
            selectedProjectDbId={this.state.selectedProjectDbId}
            aimIdForParams={this.state.aimIdForParams}
            selectedAims={this.state.selectedAims}
          />
        )}
      </div>
    );
  }
}

export default ProjectColumn;
