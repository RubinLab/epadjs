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
} from "../../../../../services/pluginServices";

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

  componentDidUpdate = async (prevProps) => {
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
    console.log("delete one called", queuedbid);
    const idsToDelete = [];
    idsToDelete.push(queuedbid);
    const responseDeleteOneFromQueue = await deleteFromPluginQueue(idsToDelete);
    console.log("delete one parameter response :", responseDeleteOneFromQueue);
    if (responseDeleteOneFromQueue.status === 200) {
      let tempPluginQueueList = this.state.pluginQueueList.filter(
        (queueObj) => {
          return queueObj.id !== queuedbid;
        }
      );
      this.setState({ pluginQueueList: tempPluginQueueList });
      console.log("parameter deleted succesfully");
    } else {
      alert("an error occourred while deleting project parameter");
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

  handleStopOne = async (original) => {
    console.log("stop one ", original);
    const queuelist = [];
    if (original.status !== "running") {
      alert("plugin process is not running");
    } else {
      console.log("stopping plugin");
      queuelist.push(original.id);
      const responseStopPluginsQueue = await stopPluginsQueue(queuelist);
      if (responseStopPluginsQueue.status === 202) {
        console.log("plugin queue process waiting to be stoped");
      } else {
        console.log("error happened while stopping plugin queue");
      }
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
  handleStopMultiple = (dbids) => {
    console.log("stop multiple ");
  };

  handleDeleteMultiple = (dbids) => {
    console.log("delete multiple ");
  };

  handleDownloadresult = (dbids) => {
    console.log("download results");
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
        width: 50,
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
          console.log("xx", data);
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
        Cell: (data) => {
          const queueId = data.original.id;
          return <div>epadplugin_{queueId}</div>;
        },
        sortable: true,
        resizable: true,
        width: 70,
      },
      {
        Header: "plugin",
        Cell: (data) => {
          const pluginName = data.original.plugin.name;
          return <div>{pluginName}</div>;
        },
        sortable: true,
        resizable: true,
        width: 50,
      },
      {
        Header: "aims",
        Cell: (data) => {
          const aims = data.original.aim_uid;
          console.log("data", data);
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
        width: 70,
      },
      {
        Header: "project",
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
      },
      {
        Header: "runtime params",
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

        width: 100,
      },
      {
        Header: "status",
        accessor: "status",
        sortable: true,
        resizable: true,

        width: 100,
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
        Cell: (data) => {
          const processStartTime = data.original.starttime;

          return <div>{processStartTime.toLocaleString()}</div>;
        },
        sortable: true,
        resizable: true,

        width: 200,
      },
      {
        Header: "endtime",
        Cell: (data) => {
          const processEndTime = data.original.endtime;
          if (processEndTime === "1970-01-01T00:00:01.000Z") {
            return <div>-</div>;
          } else {
            return <div>{processEndTime}</div>;
          }
        },
        sortable: true,
        resizable: true,

        width: 200,
      },
      {
        width: 300,
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
                          this.handleStopOne(data.original);
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
                          onClick={this.handleDownloadresult}
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
          <div className="create-user__modal--buttons">
            <button
              variant="primary"
              className="btn btn-sm btn-outline-light"
              onClick={this.handleRunQueue}
            >
              <FaPlay className="menu-clickable" />
            </button>
            <button
              variant="primary"
              className="btn btn-sm btn-outline-light"
              onClick={this.handleStopMultiple}
            >
              <FaStop className="menu-clickable" />
            </button>
            <button
              variant="primary"
              className="btn btn-sm btn-outline-light"
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
