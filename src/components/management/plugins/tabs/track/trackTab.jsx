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
  deleteFromPluginQueue,
} from "../../../../../services/pluginServices";

class TrackTab extends React.Component {
  state = {
    pluginQueueList: [],
    showParamsNonZero: false,
    tempParamsHtmlnonZero: [],
    selectedQueueIds: [],
  };

  componentWillMount = async () => {
    const tempPluginQueueList = await getPluginsQueue();
    console.log("track tab queue lists needs to show", tempPluginQueueList);
    this.setState({ pluginQueueList: tempPluginQueueList.data });
  };

  componentDidUpdate = async (prevProps) => {
    console.log("this.props for track tab :", this.props);
    try {
      const { refresh, lastEventId } = this.props;
      //   if (refresh && lastEventId !== prevProps.lastEventId) {
      //     await this.getTemplatesData();
      //   }
    } catch (err) {
      console.log(err);
    }
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
    const responseRunPluginsQueue = await runPluginsQueue("");
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
  handleStartOne = (dbid) => {
    console.log("start one ");
  };
  handleStartMultiple = (dbids) => {
    console.log("start multiple  ");
  };

  handleStopOne = (dbid) => {
    console.log("stop one ");
  };
  handleStopMultiple = (dbids) => {
    console.log("stop multiple ");
  };
  handleDeleteOne = (dbid) => {
    console.log("delete one ");
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
  definePluginsQueueTableColumns = () => {
    return [
      {
        Header: "id",
        accessor: "id",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70,
      },
      {
        Header: "plugin",
        Cell: (data) => {
          const pluginName = data.original.plugin.name;
          return <div>{pluginName}</div>;
        },
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
      },
      {
        Header: "project",
        Cell: (data) => {
          const projectName = data.original.project.name;
          return <div>{projectName}</div>;
        },
      },
      {
        Header: "parameter type",
        accessor: "plugin_parametertype",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "parameters",
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
      },
      {
        Header: "status",
        accessor: "status",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
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
        accessor: "starttime",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "endtime",
        accessor: "endtime",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        width: 300,
        Header: "",
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
                        onClick={this.handleStartOne}
                      >
                        <FaPlay className="menu-clickable" />
                      </button>
                    </td>
                    <td>
                      <button
                        variant="primary"
                        className="btn btn-sm btn-outline-light"
                        onClick={this.handleStopOne}
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
