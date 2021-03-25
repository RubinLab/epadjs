import React from "react";
import ReactTable from "react-table";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaPlay,
  FaStop,
  FaDownload,
  FaEye,
  FaTrash,
  FaEnvelopeOpenText,
  FaWindowClose,
} from "react-icons/fa";
import {
  getPluginsQueue,
  runPluginsQueue,
  stopPluginsQueue,
  deleteFromPluginQueue,
  downloadPluginResult,
  getContainerLog,
} from "../../../../../services/pluginServices";
import Draggable from "react-draggable";
import "./../../css/plugin.css";
import "../../../menuStyle.css";

class TrackTab extends React.Component {
  state = {
    ocancel: "",
    runungLogId: 0,
    showContainerLog: false,
    containerLogData: "",
    pluginQueueList: [],
    showParamsNonZero: false,
    tempParamsHtmlnonZero: [],
    selectedQueueIds: {},
    selectAll: 0,
    containerLoggingIntervalHandle: "",
  };

  componentWillMount = async () => {
    const tempPluginQueueList = await getPluginsQueue();
    console.log("track tab queue lists needs to show", tempPluginQueueList);
    // const canc = new Cancellation();
    this.setState({
      pluginQueueList: tempPluginQueueList.data,
      // cancellation: canc,
    });
  };

  componentDidUpdate = async () => {
    const prevPluginQueueList = this.state.pluginQueueList;
    const tempPluginQueueList = await getPluginsQueue();
    let updated = false;
    for (let i = 0; i < prevPluginQueueList.length; i++) {
      if (
        prevPluginQueueList[i].status !== tempPluginQueueList.data[i].status
      ) {
        updated = true;
        break;
      }
    }
    if (updated === true) {
      updated = false;
      console.log("track tab queue lists needs to show", tempPluginQueueList);
      this.setState({ pluginQueueList: tempPluginQueueList.data });
    }
  };
  deleteOneFromQueue = async (queuedbid) => {
    console.log("delete one process called", queuedbid);
    let idsToDelete = [];
    if (Array.isArray(queuedbid)) {
      idsToDelete = [...queuedbid];
    } else {
      idsToDelete.push(queuedbid);
    }
    console.log("deleting process check ids ,idsToDelete", idsToDelete);
    const responseDeleteOneFromQueue = await deleteFromPluginQueue(idsToDelete);
    console.log("delete one process response :", responseDeleteOneFromQueue);
    if (responseDeleteOneFromQueue.status === 200) {
      console.log("is deleted :", responseDeleteOneFromQueue.data.length);
      if (responseDeleteOneFromQueue.data.length > 0) {
        const deletedIds = [...responseDeleteOneFromQueue.data];
        console.log("new ids to delete :", deletedIds);
        let tempPluginQueueList = this.state.pluginQueueList.filter(
          (queueObj) => {
            return !deletedIds.includes(queueObj.id);
          }
        );
        this.setState({ pluginQueueList: tempPluginQueueList });
        console.log("plugin process deleted succesfully");
      }
    } else {
      toast.error("error happened while deleting plugin process", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      //  alert("an error occourred while deleting plugin process");
    }
  };
  handleRunQueue = async () => {
    const tempPluginQueueList = [...this.state.pluginQueueList];
    const responseRunPluginsQueue = await runPluginsQueue(
      Object.keys(this.state.selectedQueueIds)
    );
    if (responseRunPluginsQueue.status === 202) {
      console.log("queue is running");
    } else {
      console.log("error happened while running queue");
    }
  };
  handleStartOne = async (dbid) => {
    console.log("start one ");
    const queuelist = [];
    queuelist.push(dbid);
    const responseRunPluginsQueue = await runPluginsQueue(queuelist);
    if (responseRunPluginsQueue.status === 202) {
      console.log("queue is running");
    } else {
      console.log("error happened while running queue");
    }
  };

  handleStopOne = async (ids) => {
    console.log("stop one ", ids);
    let queuelist = [];

    console.log("stopping plugin");
    //queuelist.push(ids);
    if (Array.isArray(ids)) {
      queuelist = [...ids];
    } else {
      queuelist.push(ids);
    }
    const responseStopPluginsQueue = await stopPluginsQueue(queuelist);
    if (responseStopPluginsQueue.status === 200) {
      console.log("stopping plugin queue process");
    } else {
      console.log("error happened while stopping plugin queue");
    }
  };
  handleStopMultiple = async () => {
    let tempselectedQueueIds = [];
    tempselectedQueueIds = [...Object.keys(this.state.selectedQueueIds)];
    const tempIntselectedQueueIds = tempselectedQueueIds.map((id) => {
      return parseInt(id);
    });

    console.log("handle stop multiple :", tempIntselectedQueueIds);
    this.handleStopOne(tempIntselectedQueueIds);
  };

  handleDeleteMultiple = () => {
    let tempselectedQueueIds = [];
    tempselectedQueueIds = [...Object.keys(this.state.selectedQueueIds)];
    const tempIntselectedQueueIds = tempselectedQueueIds.map((id) => {
      return parseInt(id);
    });

    console.log("handle delete multiple :", tempIntselectedQueueIds);
    this.deleteOneFromQueue(tempIntselectedQueueIds);
  };

  handleDownloadresult = async (queueObject) => {
    console.log("download results", queueObject);
    const responsedownloadPluginResult = await downloadPluginResult(
      queueObject
    );
    if (responsedownloadPluginResult.status === 200) {
      const url = window.URL.createObjectURL(
        new Blob([responsedownloadPluginResult.data], {
          type: "application/zip",
        })
      );
      const link = document.createElement("a");
      document.body.appendChild(link);
      link.style = "display: none";
      link.href = url;
      link.download = "output.zip";
      link.click();
      window.URL.revokeObjectURL(url);
      console.log(
        "downloadPluginResult data",
        responsedownloadPluginResult.data
      );
      console.log("downloadPluginResult success", responsedownloadPluginResult);
    } else {
      console.log("error happened while downloadPluginResult");
    }
  };

  handleGetContainerLog = async (dataOriginal) => {
    if (this.state.showContainerLog === true) {
      clearInterval(this.state.containerLoggingIntervalHandle);
    }
    //  const containerLoggingIntervalHolder = null;
    const containerid = dataOriginal.id;
    let _this = this;
    try {
      let containerlog = await getContainerLog(containerid);
      console.log("err stream", containerlog);
      if (containerlog.data != "404") {
        this.setState({
          showContainerLog: true,
          containerLogData: containerlog.data,
        });

        const containerLoggingIntervalHolder = setInterval(
          async function (innerThis) {
            console.log("continer id = ", containerid);
            containerlog = await getContainerLog(containerid);
            innerThis.setState({
              containerLogData: containerlog.data,
            });
          },
          5000,
          _this
        );
        this.setState({
          containerLoggingIntervalHandle: containerLoggingIntervalHolder,
        });
      } else {
        alert("Please start plugin first");
      }
    } catch (err) {
      console.log("eror:", err);
      alert("no log found for the container");
      return true;
      //
    }
  };

  handlerStopContainerLogging = () => {
    // this.state.ocancel();
    this.setState({
      showContainerLog: false,
      containerLogData: "",
      runungLogId: 0,
    });
    clearInterval(this.state.containerLoggingIntervalHandle);
  };

  showRuntimeParamsForNonZero = (data) => {
    console.log("datadattdatatda :", data);
    let cnt = 0;
    const paramshtml = [];
    for (let [key, value] of Object.entries(data)) {
      cnt = cnt + 1;
      console.log("key  :", key);
      console.log("values  :", value);
      paramshtml.push(
        <table className="setparamtable">
          <tbody>
            <tr key={cnt + "id"}>
              <td className="tdleft">id </td>
              <td className="tdleft"> {value.paramid}</td>
            </tr>
            <tr key={cnt + "name"}>
              <td className="tdleft">name </td>
              <td className="tdleft"> {value.name}</td>
            </tr>
            <tr key={cnt + "description"}>
              <td className="tdleft">description </td>
              <td className="tdleft"> {value.description}</td>
            </tr>
            <tr key={cnt + "format"}>
              <td className="tdleft">format</td>
              <td className="tdleft"> {value.format}</td>
            </tr>
            <tr key={cnt + "prefix"}>
              <td className="tdleft">prefix </td>
              <td className="tdleft"> {value.prefix}</td>
            </tr>
            <tr key={cnt + "value"}>
              <td className="tdleft">value </td>
              <td className="tdleft"> {value.default_value}</td>
            </tr>
            <tr key={cnt + "inputbinding"}>
              <td className="tdleft">inputBinding </td>
              <td className="tdleft"> {value.inputBinding}</td>
            </tr>
          </tbody>
        </table>
      );
    }
    this.setState({
      tempParamsHtmlnonZero: paramshtml,
    });
    this.setState({ showParamsNonZero: true });
  };

  toggleSelectAll() {
    const tempSelectedQueueIds = {};
    console.log("toggleSelectAll queue list", this.state.pluginQueueList);
    if (this.state.selectAll === 0) {
      this.state.pluginQueueList.forEach((queueObj) => {
        console.log("select all queuee obj id", queueObj.id);
        tempSelectedQueueIds[queueObj.id] = queueObj;
      });
    }
    this.setState({
      selectedQueueIds: tempSelectedQueueIds,
      selectAll: this.state.selectAll === 0 ? 1 : 0,
    });
  }
  toggleRow = (queueObj) => {
    const { id } = queueObj;
    const tempSelectedQueueIds = this.state.selectedQueueIds;
    console.log("previously selected queue ids", tempSelectedQueueIds);
    console.log("check existence", tempSelectedQueueIds[id]);
    if (typeof tempSelectedQueueIds[id] === "undefined") {
      console.log("does not exist so adding ");
      tempSelectedQueueIds[id] = queueObj;
    } else {
      delete tempSelectedQueueIds[id];
      console.log("found and removing ");
    }
    this.setState({ selectedQueueIds: tempSelectedQueueIds });
    console.log("resulting tempSelectedQueueIds ", tempSelectedQueueIds);
  };
  definePluginsQueueTableColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 30,
        minResizeWidth: 20,
        Header: (x) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selectAll === 1}
              ref={(input) => {
                if (input) {
                  input.indeterminate = this.state.selectAll === 2;
                }
              }}
              onChange={() => this.toggleSelectAll()}
            />
          );
        },
        Cell: (data) => {
          const { id } = data.original;
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selectedQueueIds[id]}
              onChange={() => this.toggleRow(data.original)}
            />
          );
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "containername",
        Header: "container",
        minWidth: 110,
        minResizeWidth: 50,
        Cell: (data) => {
          const queueId = data.original.id;
          return <div>epadplugin_{queueId}</div>;
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "plugin",
        Header: "plugin",
        minWidth: 150,
        minResizeWidth: 50,
        Cell: (data) => {
          const pluginName = data.original.plugin.name;
          return <div>{pluginName}</div>;
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "aims",
        Header: "aims",
        minWidth: 70,
        minResizeWidth: 20,
        Cell: (data) => {
          const aims = data.original.aim_uid;
          const aimHtmlArray = [];
          let cnt = 0;
          for (let [key, value] of Object.entries(aims)) {
            console.log(`${key}: ${value}`);
            cnt = cnt + 1;
            aimHtmlArray.push(<div key={cnt}>{value.name}</div>);
          }
          return aimHtmlArray;
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "projects",
        Header: "project",
        minWidth: 70,
        minResizeWidth: 20,
        Cell: (data) => {
          const projectName = data.original.project.name;
          return <div>{projectName}</div>;
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "paramtype",
        Header: "param type",
        accessor: "plugin_parametertype",
        sortable: true,
        resizable: true,
        minWidth: 100,
        minResizeWidth: 20,
      },
      {
        id: "runtimeparams",
        Header: "runtime params",
        minWidth: 120,
        minResizeWidth: 20,
        Cell: (data) => {
          const paramsHtml = data.original.runtime_params;
          let resultHtml = "";
          if (Object.keys(paramsHtml).length !== 0) {
            return (
              <div onClick={() => this.showRuntimeParamsForNonZero(paramsHtml)}>
                <FaEye className="menu-clickable" />
              </div>
            );
          } else {
            return <div>-</div>;
          }

          console.log("paramters : ", data.original.runtime_params);
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "status",
        Header: "status",
        accessor: "status",
        sortable: true,
        resizable: true,
        minWidth: 60,
        minResizeWidth: 20,
      },
      {
        id: "starttime",
        Header: "starttime",
        minWidth: 200,
        minResizeWidth: 20,
        Cell: (data) => {
          const processStartTime = new Date(data.original.starttime);
          if (processStartTime.getFullYear() <= 1970) {
            return <div>-</div>;
          } else {
            return (
              <div>
                {processStartTime.toDateString() +
                  " - " +
                  processStartTime.getHours() +
                  ":" +
                  processStartTime.getMinutes() +
                  ":" +
                  processStartTime.getSeconds()}
              </div>
            );
          }
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "endtime",
        Header: "endtime",
        minWidth: 200,
        minResizeWidth: 20,
        Cell: (data) => {
          const processEndTime = new Date(data.original.endtime);
          if (processEndTime.getFullYear() <= 1970) {
            return <div>-</div>;
          } else {
            return (
              <div>
                {" "}
                {processEndTime.toDateString() +
                  " - " +
                  processEndTime.getHours() +
                  ":" +
                  processEndTime.getMinutes() +
                  ":" +
                  processEndTime.getSeconds()}
              </div>
            );
          }
        },
        sortable: true,
        resizable: true,
      },
      {
        id: "opbuttons",
        minWidth: 150,
        minResizeWidth: 20,
        Header: "",
        sortable: true,
        resizable: true,
        Cell: (data) => {
          return (
            <div className="plugintracktoolbar">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <button
                        variant="primary"
                        className="btn btn-sm btn-outline-light"
                        onClick={() => {
                          this.handleGetContainerLog(data.original);
                        }}
                      >
                        <FaEnvelopeOpenText className="menu-clickable" />
                      </button>
                    </td>
                    <td>
                      <button
                        variant="primary"
                        className="btn btn-sm btn-outline-light"
                        onClick={() => {
                          this.handleStartOne(data.original.id);
                        }}
                      >
                        <FaPlay className="menu-clickable" />
                      </button>
                    </td>
                    <td>
                      <button
                        variant="primary"
                        className="btn btn-sm btn-outline-light"
                        onClick={() => {
                          this.handleStopOne(data.original.id);
                        }}
                      >
                        <FaStop className="menu-clickable" />
                      </button>
                    </td>
                    <td>
                      <div>
                        <button
                          variant="primary"
                          className="btn btn-sm btn-outline-light"
                          onClick={() => {
                            this.handleDownloadresult(data.original);
                          }}
                        >
                          <FaDownload className="menu-clickable" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div>
                        <button
                          variant="primary"
                          className="btn btn-sm btn-outline-light"
                          onClick={() =>
                            this.deleteOneFromQueue(data.original.id)
                          }
                        >
                          <FaTrash className="menu-clickable" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        },
      },
    ];
  };

  pluginWindowClickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  render() {
    return (
      <div>
        <div className="tools menu-display" id="template">
          <div className="topButtons">
            <button
              variant="primary"
              className="btn btn-sm btn-outline-light cursorHand"
              onClick={this.handleRunQueue}
            >
              <FaPlay className="menu-clickable" />
            </button>
            <button
              variant="primary"
              className="btn btn-sm btn-outline-light cursorHand"
              onClick={this.handleStopMultiple}
            >
              <FaStop className="menu-clickable" />
            </button>
            <button
              variant="primary"
              className="btn btn-sm btn-outline-light cursorHand"
              onClick={this.handleDeleteMultiple}
            >
              <FaTrash className="menu-clickable" />
            </button>
          </div>

          <ReactTable
            className="pro-table"
            data={this.state.pluginQueueList}
            columns={this.definePluginsQueueTableColumns()}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={10}
          />
        </div>

        {this.state.showParamsNonZero && (
          <div>
            <div className="tools menu-display" id="template">
              <Modal.Dialog className="create-plugin__modal">
                <Modal.Header>
                  <Modal.Title>Runtime Parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body className="create-user__modal--body">
                  {this.state.tempParamsHtmlnonZero}
                </Modal.Body>

                <Modal.Footer className="create-user__modal--footer">
                  <div className="create-user__modal--buttons">
                    <button
                      variant="secondary"
                      className="btn btn-sm btn-outline-light"
                      onClick={() => {
                        this.setState({ showParamsNonZero: false });
                      }}
                    >
                      close
                    </button>
                  </div>
                </Modal.Footer>
              </Modal.Dialog>
            </div>
          </div>
        )}

        {this.state.showContainerLog && (
          <Draggable
            onClick={this.pluginWindowClickHandler}
            onMouseDown={this.pluginWindowClickHandler}
            onMouseMove={this.pluginWindowClickHandler}
          >
            <div
              className="pluginlogpopup"
              id="pluginlogpopup"
              onClick={this.pluginWindowClickHandler}
              onMouseDown={this.pluginWindowClickHandler}
              onMouseMove={this.pluginWindowClickHandler}
            >
              <div className="pluginCloseButtonHeader">
                <FaWindowClose
                  className="pluginCloseButton"
                  onClick={() => {
                    this.handlerStopContainerLogging();
                  }}
                />
              </div>
              <div>
                <textarea
                  className="pluginLogTextArea"
                  value={this.state.containerLogData}
                  rows={15}
                  cols={150}
                ></textarea>
              </div>
            </div>
          </Draggable>
        )}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  const { uploadedPid, lastEventId, refresh } = state.annotationsListReducer;
  return { refresh, uploadedPid, lastEventId };
};
export default connect(mapStateToProps)(TrackTab);
