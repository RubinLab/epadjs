import React from "react";
import ReactTable from "react-table";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import {
  FaRegEye,
  FaCommentsDollar,
  FaPlay,
  FaStop,
  FaDownload,
  FaEye,
  FaTrash,
} from "react-icons/fa";

import {
  getPluginsQueue,
  runPluginsQueue,
  stopPluginsQueue,
  deleteFromPluginQueue,
  downloadPluginResult,
} from "../../../../../services/pluginServices";
import "./../../css/plugin.css";
class TrackTab extends React.Component {
  state = {
    pluginQueueList: [],
    showParamsNonZero: false,
    tempParamsHtmlnonZero: [],
    selectedQueueIds: {},
    selectAll: 0,
  };

  componentWillMount = async () => {
    const tempPluginQueueList = await getPluginsQueue();
    console.log("track tab queue lists needs to show", tempPluginQueueList);
    this.setState({ pluginQueueList: tempPluginQueueList.data });
  };

  componentDidUpdate = async () => {
    console.log("++++++++++++++++++++++++++++++++++++++++ : update queuee");
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
    // try {
    //   const { refresh, lastEventId } = this.props;
    //   //   if (refresh && lastEventId !== prevProps.lastEventId) {
    //   //     await this.getTemplatesData();
    //   //   }
    // } catch (err) {
    //   console.log(err);
    // }
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
      let tempPluginQueueList = this.state.pluginQueueList.filter(
        (queueObj) => {
          //return queueObj.id !== queuedbid;
          return !idsToDelete.includes(queueObj.id);
        }
      );
      this.setState({ pluginQueueList: tempPluginQueueList });
      console.log("plugin process deleted succesfully");
    } else {
      alert("an error occourred while deleting plugin process");
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
    // for (const eachQueueObj of tempPluginQueueList) {
    //   console.log("calling backend queue for obj :", eachQueueObj.id);
    //   const responseRunPluginsQueue = await runPluginsQueue(eachQueueObj);
    //   if (responseRunPluginsQueue.status === 200) {
    //     console.log("eachQueueObj", eachQueueObj);
    //   } else {
    //     console.log("error happened while running queue");
    //   }
    // }
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

    // const queuelist = [];
    // queuelist.push(dbid);
    // const responseRunPluginsQueue = await stopPluginsQueue(queuelist);
    // if (responseRunPluginsQueue.status === 202) {
    //   console.log("queue is stopping");
    // } else {
    //   console.log("error happened while stopping queue");
    // }
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
      //this.setState({ selectedQueueIds: tempSelectedQueueIds });
    }
    this.setState({
      selectedQueueIds: tempSelectedQueueIds,
      selectAll: this.state.selectAll === 0 ? 1 : 0,
    });

    // let newSelected = {};
    // if (this.state.selectAll === 0) {
    //   this.state.templates.forEach((temp) => {
    //     let tempID = temp.Template[0].templateUID;
    //     let projectID = temp.projectID ? temp.projectID : "lite";
    //     newSelected[tempID] = projectID;
    //   });
    // }
    // this.setState({
    //   selected: newSelected,
    //   selectAll: this.state.selectAll === 0 ? 1 : 0,
    // });
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
    // tempSelectedQueueIds.push(id);
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
        Header: "container name",
        width: 70,
        minResizeWidth: 20,
        Cell: (data) => {
          const queueId = data.original.id;
          return <div>epadplugin_{queueId}</div>;
        },
        sortable: true,
        resizable: true,
      },
      {
        Header: "plugin",
        width: 50,
        minResizeWidth: 20,
        Cell: (data) => {
          const pluginName = data.original.plugin.name;
          return <div>{pluginName}</div>;
        },
        sortable: true,
        resizable: true,
      },
      {
        Header: "aims",
        width: 70,
        minResizeWidth: 20,
        Cell: (data) => {
          const aims = data.original.aim_uid;
          const aimHtmlArray = [];
          //const rowdata = original.row.checkbox;
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
        Header: "project",
        width: 70,
        minResizeWidth: 20,
        Cell: (data) => {
          const projectName = data.original.project.name;
          return <div>{projectName}</div>;
        },
        sortable: true,
        resizable: true,
      },
      {
        Header: "params type",
        accessor: "plugin_parametertype",
        sortable: true,
        resizable: true,
        width: 200,
        minResizeWidth: 20,
      },
      {
        Header: "runtime params",
        width: 100,
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
          //const rowdata = original.row.checkbox;
          //return { resultHtml };
        },
        sortable: true,
        resizable: true,
      },
      {
        Header: "status",
        accessor: "status",
        sortable: true,
        resizable: true,
        width: 100,
        minResizeWidth: 20,
      },
      // {
      //   Header: "runtime paramters",
      //   accessor: "runtime_params",
      //   sortable: true,
      //   resizable: true,
      //   minResizeWidth: 50,
      //   width: 100,
      // },
      {
        Header: "starttime",
        width: 200,
        minResizeWidth: 20,
        Cell: (data) => {
          const processStartTime = new Date(data.original.starttime);
          if (processStartTime.getFullYear() === 1970) {
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
        Header: "endtime",
        width: 200,
        minResizeWidth: 20,
        Cell: (data) => {
          const processEndTime = new Date(data.original.endtime);
          if (processEndTime.getFullYear() === 1970) {
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
        width: 300,
        minResizeWidth: 20,
        Header: "",
        sortable: true,
        resizable: true,
        Cell: (data) => {
          //const rowdata = original.row.checkbox;
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
                      <div
                        onClick={() =>
                          this.deleteOneFromQueue(data.original.id)
                        }
                      >
                        <FaTrash className="menu-clickable" />
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
            //   getTdProps={(state, rowInfo, column, instance) => ({
            //     onClick: () => {
            //       if (column.Header != "") {
            //         if (typeof rowInfo !== "undefined") {
            //           this.handleShowEditParameterWindow(rowInfo);
            //         }
            //       }
            //     },
            //   })}
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
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  const { uploadedPid, lastEventId, refresh } = state.annotationsListReducer;
  return { refresh, uploadedPid, lastEventId };
};
export default connect(mapStateToProps)(TrackTab);
