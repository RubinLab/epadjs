import React from "react";
import ReactTable from "react-table";
import { connect } from "react-redux";
import {
  getPluginsQueue,
  runPluginsQueue,
} from "../../../../../services/pluginServices";
import { FaRegTrashAlt } from "react-icons/fa";
class TrackTab extends React.Component {
  constructor() {
    super();
    this.eventSource = null;
  }
  state = {
    pluginQueueList: [],
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
  deleteOneFromQueue = async (parameterdbid) => {
    // console.log("delete one called", parameterdbid);
    // const deleteParameterResponse = await deleteOneProjectParameter(
    //   parameterdbid
    // );
    // console.log("delete one parameter response :", deleteParameterResponse);
    // if (deleteParameterResponse.status === 200) {
    //   let tempDefaultParameterList = this.state.defaultParameterList.filter(
    //     (parameter) => {
    //       return parameter.id !== parameterdbid;
    //     }
    //   );
    //   this.setState({ defaultParameterList: tempDefaultParameterList });
    //   console.log("parameter deleted succesfully");
    // } else {
    //   alert("an error occourred while deleting project parameter");
    // }
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
        Header: "plugin_id",
        accessor: "plugin_id",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "aim_uid",
        accessor: "aim_uid",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "container_id",
        accessor: "container_id",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "container_name",
        accessor: "container_name",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
      {
        Header: "status",
        accessor: "status",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 100,
      },
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
    return (
      <div className="tools menu-display" id="template">
        <div className="create-user__modal--buttons">
          <button
            variant="primary"
            className="btn btn-sm btn-outline-light"
            onClick={this.handleRunQueue}
          >
            Run queue
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
    );
  }
}
const mapStateToProps = (state) => {
  const { uploadedPid, lastEventId, refresh } = state.annotationsListReducer;
  return { refresh, uploadedPid, lastEventId };
};
export default connect(mapStateToProps)(TrackTab);
