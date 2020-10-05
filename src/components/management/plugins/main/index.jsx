import React from "react";
import { toast } from "react-toastify";
import { getProjectsWithPkAsId } from "../../../../services/projectServices";
import {
  getTemplatesFromDb,
  getTemplatesUniversal,
} from "../../../../services/templateServices";
import { getUser } from "../../../../services/userServices";
import PluginProjectWindow from "../tabs/manage/pluginProjectWindow";
import PluginTemplateWindow from "../tabs/manage/pluginTemplateWindow";
import NewPluginWindow from "../tabs/manage/newPluginWindow";
import ParametersWindow from "../tabs/manage/parametersWindow";
import {
  getPluginsWithProject,
  updateProjectsForPlugin,
  updateTemplatesForPlugin,
  deletePlugin,
  savePlugin,
  editPlugin,
  saveDefaultParameter,
  getDefaultParameter,
  getOnePlugin,
} from "../../../../services/pluginServices";
import DeleteAlert from "../../common/alertDeletionModal";
import UploadModal from "../../../searchView/uploadModal";
import EditTools from "../../templates/projectTable";
import PluginNavBar from "./pluginNavBar";
import ManageTab from "./../tabs/manage/manageTab";
import TriggerTab from "./../tabs/trigger/triggerTab";
import TrackTab from "./../tabs/track/trackTab";
import { arrayToMap } from "../../../../Utils/aid";
import "../css/plugin.css";
class Plugins extends React.Component {
  state = {
    plugins: [], //using
    projectList: [], //using
    templateList: [], //using
    selectedProjects: [], //using
    selectedTemplates: [], //using
    parametersDefault: {}, //using
    parameterFormElements: {
      paramid: "",
      name: "",
      format: "",
      prefix: "",
      inputBinding: "",
      default_value: "",
      creator: "",
      type: "",
      description: "",
    }, //using
    tableSelectedData: {}, //using
    manageTabActive: true, //using
    trackTabActive: false, //using
    triggerTabActive: false, //using
    hasAddProjectClicked: false, //using
    hasAddTemplateClicked: false, //using
    newPluginClicked: false, //using
    editPluginClicked: false, //using
    parametersClicked: false, //using
    delAll: false,
    delOne: false,
    selectAll: 0, //using
    selected: {}, //uising
    selectedplugindbidfordefparams: -1, //using
    uploadClicked: false,
    hasEditClicked: false,
    errorMessage: null, //using
    pluginFormElements: {
      //using
      name: "",
      plugin_id: "",
      image_name: "",
      image_repo: "",
      image_tag: "",
      image_id: "",
      description: "",
      enabled: true,
      modality: "",
      developer: "",
      documentation: "",
      processmultipleaims: "",
    },
    isAdmin: false,
  };

  componentDidMount = async () => {
    console.log("checking props : ", this.props);

    const pluginList = await getPluginsWithProject();
    let projectList = await getProjectsWithPkAsId();
    let templateList = await getTemplatesFromDb();
    let user = await getUser(sessionStorage.getItem("username"));
    user = user.data;
    const templateUniversal = await getTemplatesUniversal();
    console.log("universal templates", templateUniversal);
    templateList = templateList.data;

    const plugins = pluginList.data;
    projectList = projectList.data;
    console.log("session:", sessionStorage.getItem("username"));
    console.log("session owner is admin:", user.admin);
    this.setState({ plugins, projectList, templateList, isAdmin: user.admin });

    console.log("plugin list to check is admin :", this.state.isAdmin);
  };

  handleProjectSelect = (onclickselectedProject, tableData) => {
    let tempSelectedProjects = this.state.selectedProjects;
    let elementIndex = tempSelectedProjects.indexOf(onclickselectedProject);
    if (elementIndex === -1) {
      tempSelectedProjects.push(onclickselectedProject);
    } else {
      tempSelectedProjects = this.state.selectedProjects.filter((project) => {
        return project !== onclickselectedProject;
      });
    }
    this.setState({ selectedProjects: tempSelectedProjects });
  };

  addProject = (projectArray, tableSelectedData) => {
    if (this.state.isAdmin === true) {
      const tempProjectMap = arrayToMap(projectArray);
      this.setState({
        hasAddProjectClicked: true,
        selectedProjectsAsMap: tempProjectMap,
        tableSelectedData: tableSelectedData,
        selectedProjects: projectArray,
      });
    } else {
      toast.info("user has no right to add project. Admin required", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  handleAddProjectCancel = () => {
    this.setState({
      selectedProjects: [],
      tableSelectedData: {},
      hasAddProjectClicked: false,
    });
  };

  handleAddProjectSave = async () => {
    const selectedPluginId = this.state.tableSelectedData.original.id;
    const newProjects = this.state.selectedProjects;
    const tempoldProjects = this.state.tableSelectedData.original.projects;
    const oldProjects = [];

    tempoldProjects.forEach((project) => {
      oldProjects.push(project.id);
    });

    let projectsToRemove = [];
    let projectsToAdd = [];

    projectsToAdd = newProjects.filter((prid) => !oldProjects.includes(prid));
    projectsToRemove = oldProjects.filter(
      (prid) => !newProjects.includes(prid)
    );

    const projectsArrayAsResponse = await updateProjectsForPlugin(
      selectedPluginId,
      {
        projectsToAdd,
        projectsToRemove,
      }
    );

    const tempPlugins = this.state.plugins;
    let arrayIndex = -1;
    for (let i = 0; i < tempPlugins.length; i++) {
      if (tempPlugins[i].id === selectedPluginId) {
        tempPlugins[i].projects = projectsArrayAsResponse.data;
      }
    }
    this.setState({
      hasAddProjectClicked: false,
      plugins: tempPlugins,
      tableSelectedData: {},
    });
  };

  addTemplate = (templateArray, tableSelectedData) => {
    const tempTemplateMap = arrayToMap(templateArray);
    this.setState({
      hasAddTemplateClicked: true,
      selectedTemplateAsMap: tempTemplateMap,
      tableSelectedData: tableSelectedData,
      selectedTemplates: templateArray,
    });
  };

  handleAddTemplateSave = async () => {
    const selectedPluginId = this.state.tableSelectedData.original.id;
    const newTemplates = this.state.selectedTemplates;
    const tempoldTemplates = this.state.tableSelectedData.original.templates;
    const oldTemplates = [];

    tempoldTemplates.forEach((template) => {
      oldTemplates.push(template.id);
    });
    let templatesToRemove = [];
    let templatesToAdd = [];
    templatesToAdd = newTemplates.filter(
      (templateid) => !oldTemplates.includes(templateid)
    );
    templatesToRemove = oldTemplates.filter(
      (templateid) => !newTemplates.includes(templateid)
    );

    const templatesArrayAsResponse = await updateTemplatesForPlugin(
      selectedPluginId,
      {
        templatesToAdd,
        templatesToRemove,
      }
    );

    const tempPlugins = this.state.plugins;
    let arrayIndex = -1;
    for (let i = 0; i < tempPlugins.length; i++) {
      if (tempPlugins[i].id === selectedPluginId) {
        tempPlugins[i].templates = templatesArrayAsResponse.data;
      }
    }

    this.setState({
      hasAddTemplateClicked: false,
      plugins: tempPlugins,
      tableSelectedData: {},
    });
  };

  handleTemplateSelect = (onclickselectedTemplate, tableData) => {
    let tempSelectedTemplates = this.state.selectedTemplates;
    let elementIndex = tempSelectedTemplates.indexOf(onclickselectedTemplate);
    if (elementIndex === -1) {
      tempSelectedTemplates.push(onclickselectedTemplate);
    } else {
      tempSelectedTemplates = this.state.selectedTemplates.filter(
        (template) => {
          return template !== onclickselectedTemplate;
        }
      );
    }

    this.setState({ selectedTemplates: tempSelectedTemplates });
  };

  handleAddTemplateCancel = () => {
    this.setState({
      selectedTemplates: [],
      tableSelectedData: {},
      hasAddTemplateClicked: false,
    });
  };

  handleTabClic = (whichtab) => {
    this.setState({
      manageTabActive: false,
      trackTabActive: false,
      triggerTabActive: false,
      [whichtab]: true,
    });
  };

  handleDeleteOne = async (rowdata) => {
    if (this.state.isAdmin === true) {
      console.log("data type to delete : ", Array.isArray(rowdata));
      let selectedRowPluginId = [];
      if (Array.isArray(rowdata)) {
        selectedRowPluginId = [...rowdata];
      } else {
        selectedRowPluginId.push(rowdata.id);
      }
      //  const selectedRowPluginId = rowdata.id;
      const tempPlugins = this.state.plugins;

      let resultPlugins = [];
      const deletePluginResult = await deletePlugin({ selectedRowPluginId });

      if (!Array.isArray(deletePluginResult.data)) {
        console.log("delete plugin result :", deletePluginResult);
        resultPlugins = tempPlugins.filter((plugin) => {
          return !selectedRowPluginId.includes(plugin.id);
        });
        this.setState({ plugins: resultPlugins });
      } else {
        if (deletePluginResult.data.length > 0) {
          console.log("delete plugin result :", deletePluginResult);
          resultPlugins = tempPlugins.filter((plugin) => {
            // return plugin.id !== selectedRowPluginId;
            return !deletePluginResult.data.includes(plugin.id);
          });
          this.setState({ plugins: resultPlugins });
          toast.info("plugin has process in queue. please delete them first", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.info("plugin has process in queue. please delete them first", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    } else {
      toast.info("user has no right to delete plugin. Admin required", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  handleDeleteAll = async () => {
    const tempPlugins = this.state.plugins;
    const selectedCheckBoxes = this.state.selected;
    let resultPlugins = [];
    resultPlugins = tempPlugins.filter((plugin) => {
      return typeof selectedCheckBoxes[plugin.id] === "undefined";
    });
    const pluginIdsToDelete = Object.values(selectedCheckBoxes);
    console.log("multi plugin delete : ", pluginIdsToDelete);
    this.handleDeleteOne(pluginIdsToDelete);
    //const deletePluginResult = await deletePlugin({ pluginIdsToDelete });
    //this.setState({ plugins: resultPlugins });
  };

  handleSelectAll = () => {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.plugins.forEach((plugin) => {
        let pluginid = plugin.id;

        newSelected[pluginid] = pluginid;
      });
    }
    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0,
    });
  };

  handleSelectRow = async (id) => {
    console.log(this.state.selected, id);
    let selectedCheckBoxes = this.state.selected;
    console.log(selectedCheckBoxes[id]);
    if (typeof selectedCheckBoxes[id] === "undefined") {
      selectedCheckBoxes = { ...selectedCheckBoxes, [id]: id };
    } else {
      delete selectedCheckBoxes[id];
    }
    this.setState({ selected: selectedCheckBoxes });
  };
  handleAddPlugin = () => {
    if (this.state.isAdmin === true) {
      const temppluginFormElements = {
        //using
        name: "",
        plugin_id: "",
        image_name: "",
        image_repo: "",
        image_tag: "",
        image_id: "",
        description: "",
        enabled: true,
        modality: "",
        developer: "",
        documentation: "",
        processmultipleaims: "",
      };
      this.setState({
        newPluginClicked: true,
        pluginFormElements: temppluginFormElements,
      });
    } else {
      toast.info("user has no right to add plugin. Admin required", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  handleAddPluginCancel = () => {
    this.setState({ newPluginClicked: false, errorMessage: null });
  };

  handleAddPluginSave = async () => {
    const pluginform = this.state.pluginFormElements;
    if (
      !pluginform.name ||
      !pluginform.plugin_id ||
      !pluginform.image_repo ||
      !pluginform.image_tag
    ) {
      this.setState({ errorMessage: "please fill required boxes" });
      return;
    }
    this.setState({ newPluginClicked: false, errorMessage: null });

    const responseSavePlugin = await savePlugin({
      pluginform,
    });
    console.log(" ---->   handleAddPluginSave : ", responseSavePlugin.status);
    if (responseSavePlugin.status === 200) {
      const pluginList = await getPluginsWithProject();
      const plugins = pluginList.data;

      let projectList = await getProjectsWithPkAsId();
      projectList = projectList.data;

      let templateList = await getTemplatesFromDb();
      templateList = templateList.data;

      this.setState({ plugins, projectList, templateList });
    } else {
      toast.error("error happened while saving plugin", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      //  alert("error happened while saving plugin");
    }
    //pluginFomElements
  };

  handleEditPlugin = (selectedPluginData) => {
    if (this.state.isAdmin === true) {
      console.log("handle edit plugin id :", selectedPluginData);
      let editimage_name = "";
      let editimage_repo = "";
      let editimage_tag = "";
      let editimage_id = "";
      let edit_processmultipleaims = "";
      if (selectedPluginData.original.image_name != null) {
        editimage_name = selectedPluginData.original.image_name;
      }
      if (selectedPluginData.original.image_repo != null) {
        editimage_repo = selectedPluginData.original.image_repo;
      }
      if (selectedPluginData.original.image_tag != null) {
        editimage_tag = selectedPluginData.original.image_tag;
      }
      if (selectedPluginData.original.image_id != null) {
        editimage_id = selectedPluginData.original.image_id;
      }
      if (selectedPluginData.original.processmultipleaims != null) {
        edit_processmultipleaims =
          selectedPluginData.original.processmultipleaims;
      }

      const editpluginFormElements = {
        //using
        dbid: selectedPluginData.original.id,
        name: selectedPluginData.original.name,
        plugin_id: selectedPluginData.original.plugin_id,
        image_name: editimage_name,
        image_repo: editimage_repo,
        image_tag: editimage_tag,
        image_id: editimage_id,
        description: selectedPluginData.original.description,
        enabled: selectedPluginData.original.enabled,
        modality: selectedPluginData.original.modality,
        developer: selectedPluginData.original.developer,
        documentation: selectedPluginData.original.documentation,
        processmultipleaims: edit_processmultipleaims,
      };

      this.setState({
        editPluginClicked: true,
        pluginFormElements: editpluginFormElements,
      });
    } else {
      toast.info("user has no right to edit plugin. Admin required", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  handleEditPluginCancel = () => {
    this.setState({ editPluginClicked: false, errorMessage: null });
  };
  handleEditPluginSave = async () => {
    console.log("edit plugin save clicked");
    //this.setState({ editPluginClicked: false });
    const pluginform = this.state.pluginFormElements;
    if (
      !pluginform.name ||
      !pluginform.plugin_id ||
      !pluginform.image_repo ||
      !pluginform.image_tag
    ) {
      this.setState({ errorMessage: "please fill required boxes" });
      return;
    }
    const responseEditPlugin = await editPlugin({
      pluginform,
    });
    if (responseEditPlugin.status === 200) {
      console.log("responseEditPlugin", responseEditPlugin);
      const tempPlugins = this.state.plugins;
      console.log("tempPlugins[0]", tempPlugins[0]);
      let arrayIndex = -1;
      for (let i = 0; i < tempPlugins.length; i++) {
        if (tempPlugins[i].id === responseEditPlugin.data.dbid) {
          console.log("found : ", tempPlugins[i]);
          let obj = {};
          obj = { ...tempPlugins[i], ...responseEditPlugin.data };
          tempPlugins[i] = obj;
          console.log("after : ", tempPlugins[i]);
        }
      }
      this.setState({
        plugins: tempPlugins,
        editPluginClicked: false,
        errorMessage: null,
      });
    } else {
      toast.error("error happened while editing plugi", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      //  alert("an arror occured after editing plugin");
    }
  };

  handleParametersClicked = (parametersData) => {
    if (this.state.isAdmin === true) {
      console.log("parameters data on prm click : ", parametersData);
      console.log(
        "parameters data on prm click temp: ",
        parametersData.original.parameters
      );
      const tempParametersDefault = parametersData.original.parameters;
      const plugindbid = parametersData.original.id;
      console.log("plugin id when clicked params :", plugindbid);

      //
      this.setState({
        selectedplugindbidfordefparams: plugindbid,
        parametersClicked: true,
        parametersDefault: tempParametersDefault,
      });
    } else {
      toast.info(
        "user has no right to edit plugin parameters. Admin required",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };
  handleParameterChange = (e) => {
    const parameterElements = { ...this.state.parameterFormElements };
    parameterElements[e.currentTarget.name] = e.currentTarget.value;

    //console.log("form elements : ", this.state.pluginFormElements);
    console.log(e.currentTarget.name, ": value : ", e.currentTarget.value);
    this.setState({ parameterFormElements: parameterElements });
  };
  handleParameterCancel = () => {
    this.setState({
      parametersClicked: false,
      selectedplugindbidfordefparams: -1,
    });
  };

  handleDefaultParameterSave = async () => {
    console.log("add parameetr called ");
    console.log(
      "parameters form elements : ",
      this.state.parameterFormElements
    );

    const parameterform = this.state.parameterFormElements;
    this.setState({ newPluginClicked: false });
    const responseSaveParameter = await saveDefaultParameter({
      parameterform,
    });
    console.log(
      " ---->   handleDefaultParameterSave : ",
      responseSaveParameter.status
    );
    if (responseSaveParameter.status === 200) {
      //edit here
      // const pluginList = await getPluginsWithProject();
      // const plugins = pluginList.data;
      // let projectList = await getProjectsWithPkAsId();
      // projectList = projectList.data;
      // let templateList = await getTemplatesFromDb();
      // templateList = templateList.data;
      // this.setState({ plugins, projectList, templateList });
      this.setState({
        parametersClicked: false,
      });
    } else {
      toast.error("error happened while saving parameter", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      //  alert("error happened while saving parameter");
    }
  };

  handleNotifyParentForParemeterSituation = async (plugindbid, operation) => {
    console.log("in parent updt", plugindbid);
    console.log("state parameters default", this.state.parametersDefault);
    const newparams = await getDefaultParameter(plugindbid);
    console.log("newparams", newparams);
    const tempPluginUpdated = await getOnePlugin(plugindbid);
    console.log(
      "again updated plugin list with new params : ",
      tempPluginUpdated
    );
    switch (operation) {
      case "addnew":
        const tempPlugins = this.state.plugins;
        for (let i = 0; i < tempPlugins.length; i++) {
          if (tempPlugins[i].id === plugindbid) {
            let paramsobj = [];
            paramsobj = [...tempPluginUpdated.data.defaultparameters];
            console.log(
              "we are replacing this plugin def params :",
              tempPlugins[i].parameters
            );
            console.log("with this one :", paramsobj);
            tempPlugins[i].parameters = [...paramsobj];
          }
        }
        this.setState({
          parametersDefault: newparams.data,
          plugins: tempPlugins,
          //plugins: tempPluginList.data
        });
        break;
    }
  };

  handleAddPluginChange = (e) => {
    const plElements = { ...this.state.pluginFormElements };
    if (e.currentTarget.name != "enabled") {
      plElements[e.currentTarget.name] = e.currentTarget.value;
    } else {
      plElements[e.currentTarget.name] = e.currentTarget.checked;
    }
    if (e.currentTarget.name === "processmultipleaims") {
      console.log(e.currentTarget.name, ": target : ", e.currentTarget.checked);
      if (e.currentTarget.value === "-1") {
        plElements[e.currentTarget.name] = null;
      }
    }
    //console.log("form elements : ", this.state.pluginFormElements);
    console.log(e.currentTarget.name, ": value : ", e.currentTarget.value);
    // if (e.currentTarget.name === "enabled") {
    //   console.log(e.currentTarget.name, ": target : ", e.currentTarget.checked);
    // }
    console.log("processmultiple aims plElements on change ", plElements);
    this.setState({ pluginFormElements: plElements });
  };
  //cavit
  projectDataToCell = (tableData) => {
    const { projects } = tableData.row;
    const tempProjects = [];
    let projectArray = [];
    let projectNameArray = [];
    for (let project of projects) {
      const { id, projectname } = project;
      tempProjects.push(id);
      projectNameArray.push(projectname);
    }
    projectArray = projectNameArray.join(" ,");

    return (
      <div
        onClick={() => {
          this.addProject(tempProjects, tableData);
        }}
      >
        {projectArray.length === 0 ? "add project" : projectArray}
      </div>
    );
  };

  templateDataToCell = (tableData) => {
    const { templates } = tableData.row;
    const tempTemplates = [];
    let templateArray = [];
    const templateNameArray = [];
    for (let template of templates) {
      const { id, templateName } = template;
      tempTemplates.push(id);
      templateNameArray.push(templateName);
    }
    templateArray = templateNameArray.join(" ,");

    return (
      <div
        onClick={() => {
          this.addTemplate(tempTemplates, tableData);
        }}
      >
        {templateArray.length === 0 ? "add template" : templateArray}
      </div>
    );
  };
  handleEnablePluginClicked = (id) => {
    //  alert(id);
  };
  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const data = this.state.plugins;
    const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    return (
      <div className="pluginmain" id="pluginmain">
        {/* <ToolBar
          onAdd={this.handleAddPlugin}
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
        /> */}
        <PluginNavBar
          handleTabClic={this.handleTabClic}
          trackTabActive={this.state.trackTabActive}
          manageTabActive={this.state.manageTabActive}
          triggerTabActive={this.state.triggerTabActive}
        />
        {this.state.manageTabActive && (
          <ManageTab
            className="pro-table"
            data={this.state.plugins}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={pageSize}
            onAdd={this.handleAddPlugin}
            onDelete={this.handleDeleteAll}
            handleDeleteOne={this.handleDeleteOne}
            templateDataToCell={this.templateDataToCell}
            projectDataToCell={this.projectDataToCell}
            handleSelectAll={this.handleSelectAll}
            handleSelectRow={this.handleSelectRow}
            handleEditPlugin={this.handleEditPlugin}
            handleParametersClicked={this.handleParametersClicked}
            selectAll={this.state.selectAll}
            selected={this.state.selected}
            handleEnablePluginClicked={this.handleEnablePluginClicked}
          />
        )}
        {this.state.triggerTabActive && <TriggerTab />}
        {this.state.trackTabActive && <TrackTab />}
        {(this.state.delAll || this.state.delOne) && (
          <DeleteAlert
            message={
              this.state.delAll
                ? this.renderMessages().deleteAll
                : this.renderMessages(this.state.templateName).deleteOne
            }
            onCancel={this.handleCancel}
            onDelete={this.state.delAll ? this.deleteAll : this.deleteOne}
            error={this.state.errorMessage}
          />
        )}
        {this.state.uploadClicked && (
          <UploadModal
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmitUpload}
          />
        )}
        {this.state.hasEditClicked && (
          <EditTools
            projectList={this.state.projectList}
            onCancel={this.handleCancel}
          />
        )}
        {this.state.hasAddProjectClicked && this.state.isAdmin && (
          <PluginProjectWindow
            onChange={this.handleProjectSelect}
            onCancel={this.handleAddProjectCancel}
            onSave={this.handleAddProjectSave}
            selectedProjectsAsMap={this.state.selectedProjectsAsMap}
            allProjects={this.state.projectList}
            tableSelectedData={this.state.tableSelectedData}
          />
        )}
        {this.state.hasAddTemplateClicked && (
          <PluginTemplateWindow
            onChange={this.handleTemplateSelect}
            onCancel={this.handleAddTemplateCancel}
            onSave={this.handleAddTemplateSave}
            selectedTemplateAsMap={this.state.selectedTemplateAsMap}
            allTemplates={this.state.templateList}
            tableSelectedData={this.state.tableSelectedData}
          />
        )}
        {this.state.newPluginClicked && (
          <NewPluginWindow
            onCancel={this.handleAddPluginCancel}
            onSave={this.handleAddPluginSave}
            onChange={this.handleAddPluginChange}
            error={this.state.errorMessage}
            pluginFormElements={this.state.pluginFormElements}
          />
        )}
        {this.state.editPluginClicked && (
          <NewPluginWindow
            onCancel={this.handleEditPluginCancel}
            onSave={this.handleEditPluginSave}
            onChange={this.handleAddPluginChange}
            error={this.state.errorMessage}
            pluginFormElements={this.state.pluginFormElements}
          />
        )}
        {this.state.parametersClicked && (
          <ParametersWindow
            data={this.state.parametersDefault}
            onCancel={this.handleParameterCancel}
            onSave={this.handleDefaultParameterSave}
            pluginid={this.state.selectedplugindbidfordefparams}
            notifyParameterParent={this.handleNotifyParentForParemeterSituation}
            //onChange={this.handleParameterChange}
            //error={this.handleParameterError}
            //parameterFormElements={this.state.parameterFormElements}
          />
        )}
      </div>
    );
  };
}

export default Plugins;
