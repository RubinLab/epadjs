import React from "react";
import Table from "react-table";
import { Link } from "react-router-dom";
import { FaRegTrashAlt, FaRegEye } from "react-icons/fa";
import {
  getStudiesOfWorklist,
  deleteWorklist
} from "../../services/worklistServices";
import { getProject } from "../../services/projectServices";
import DeleteAlert from "../management/common/alertDeletionModal";
import EditField from "./editField";
import { getUsers } from "../../services/userServices";

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
    clickedIndex: null,
    users: []
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
    const { data: worklists } = await getStudiesOfWorklist(
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
        Header: "Study Description",
        sortable: true,
        Cell: original => {
          let studyDesc = this.clearCarets(
            original.row._original.studyDescription
          );
          studyDesc = studyDesc ? studyDesc : "Unnamed Study";
          return <div>{studyDesc}</div>;
        }
      },

      {
        Header: "Subject Name",
        sortable: true,
        Cell: original => {
          let subjectName = this.clearCarets(
            original.row._original.subjectName
          );
          subjectName = subjectName ? subjectName : "Unnamed Subject";
          return <div>{subjectName}</div>;
        }
      },
      {
        Header: "Project Name",
        accessor: "projectName",
        sortable: true,
        Cell: original => {
          let projectName = this.clearCarets(
            original.row._original.projectName
          );
          projectName = projectName ? projectName : "Unnamed Subject";
          return <div>{original.row._original.projectName}</div>;
        }
      },
      {
        Header: "Due Date",
        sortable: true,
        accessor: "worklistDuedate"
      },
      {
        Header: "StudyUID",
        sortable: true,
        accessor: "studyUID"
      },

      {
        Header: "",
        width: 45,

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
    console.log(this.state);
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
