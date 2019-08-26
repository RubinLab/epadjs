import React from "react";
import Table from "react-table";
import { Link } from "react-router-dom";
import { FaRegTrashAlt, FaRegEye } from "react-icons/fa";
import { getWorklist, deleteWorklist } from "./../../services/worklistServices";
import { getProject } from "./../../services/projectServices";
import DeleteAlert from "./../management/common/alertDeletionModal";
import EditField from "../management/users/editField";

const messages = {
  deleteSingle: "Delete the worklist? This cannot be undone.",
  deleteSelected: "Delete selected worklists? This cannot be undone."
};

class WorkList extends React.Component {
  state = {
    worklists: [],
    singleDeleteData: {},
    deleteSingleClicked: false,
    commentClicked: false,
    clickedIndex: null
  };

  componentDidMount = async () => {
    this.getWorkListData();
    document.addEventListener("mousedown", this.handleClickOutside);
    document.addEventListener("keydown", this.escapeFieldInput);
  };

  componentWillUnmount = () => {
    document.removeEventListener("mousedown", this.handleClickOutside);
    document.removeEventListener("keydown", this.escapeFieldInput);
  };

  componentDidUpdate = prevProps => {
    if (prevProps.match.params.wid !== this.props.match.params.wid) {
      this.getWorkListData();
    }
  };
  getWorkListData = async () => {
    const {
      data: {
        ResultSet: { Result: worklists }
      }
    } = await getWorklist(
      sessionStorage.getItem("username"),
      this.props.match.params.wid
    );

    for (let worklist of worklists) {
      const { data: projectDetails } = await getProject(worklist.projectID);
      worklist.projectName = projectDetails.name;
    }
    this.setState({ worklists });
  };

  handleComment = index => {
    this.setState(state => ({
      commentClicked: !state.commentClicked,
      clickedIndex: index
    }));
  };

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      name: "",
      id: "",
      user: "",
      description: "",
      error: "",
      deleteSingleClicked: false
    });
  };

  deleteSingleWorklist = async () => {
    const { name, id } = this.state.singleDeleteData;
    deleteWorklist(name, id)
      .then(() => {
        this.setState({ deleteSingleClicked: false, singleDeleteData: {} });
        this.getWorkListData();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
      });
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string.trim();
    }
  };

  handleSingleDelete = (name, id) => {
    this.setState({
      deleteSingleClicked: true,
      singleDeleteData: { name, id }
    });
  };

  setWrapperRef = (node, id) => {
    this.wrapperRef = node;
  };

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleComment(null);
    }
  };

  escapeFieldInput = e => {
    if (e.key === "Escape") {
      this.handleComment(null);
    }
  };

  defineColumns = () => {
    return [
      {
        Header: "Open",
        minResizeWidth: 20,
        width: 50,
        Cell: original => {
          return (
            <div onClick={this.props.onClose}>
              <FaRegEye className="menu-clickable" />
            </div>
          );
        }
      },
      {
        Header: "Status",
        minResizeWidth: 20,
        width: 50,
        Cell: original => <div>20%</div>
      },
      {
        Header: "Subject",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          let subjectName = this.clearCarets(
            original.row._original.subjectName
          );
          subjectName = subjectName ? subjectName : "Unnamed Subject";
          return <div>{subjectName}</div>;
        }
      },
      {
        Header: "Project",
        accessor: "projectName",
        sortable: true,
        resizable: true,
        minWidth: 40,
        Cell: original => {
          let projectName = this.clearCarets(
            original.row._original.projectName
          );
          projectName = projectName ? projectName : "Unnamed Subject";
          return <div>{original.row._original.projectName}</div>;
        }
      },
      {
        Header: "Comment",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          // console.log(original.row._original);
          // console.log(original);
          const { commentClicked, clickedIndex } = this.state;
          return commentClicked && clickedIndex === original.index ? (
            <div ref={this.setWrapperRef} className="--commentInput">
              <EditField />
            </div>
          ) : (
            <div
              className="--commentCont"
              onClick={() => this.handleComment(original.index)}
            />
          );
        }
      },
      {
        Header: "",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => (
          <div
            onClick={() =>
              this.handleSingleDelete(
                original.row._original.username,
                original.row._original.workListID
              )
            }
          >
            <FaRegTrashAlt className="menu-clickable" />
          </div>
        )
      }
    ];
  };

  render = () => {
    return (
      <div className="worklist-page">
        <Table
          className="__table"
          data={this.state.worklists}
          columns={this.defineColumns()}
          pageSize={this.state.worklists.length}
          showPagination={false}
          NoDataComponent={() => null}
        />
        {this.state.deleteSingleClicked && (
          <DeleteAlert
            message={messages.deleteSingle}
            onCancel={this.handleCancel}
            onDelete={this.deleteSingleWorklist}
            error={this.state.errorMessage}
          />
        )}
      </div>
    );
  };
}

export default WorkList;
