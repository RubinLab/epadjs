import React from "react";
import Table from "react-table";
import { Link } from "react-router-dom";
import { FaRegTrashAlt, FaRegEye } from "react-icons/fa";
import {
  getStudiesOfWorklist,
  deleteStudyFromWorklist
} from "../../services/worklistServices";
import { getProject } from "../../services/projectServices";
import DeleteAlert from "../management/common/alertDeletionModal";

const messages = {
  deleteSingle: "Remove study from the worklist? This cannot be undone.",
  deleteSelected:
    "Delete selected studies from the worklist? This cannot be undone."
};

class WorkList extends React.Component {
  state = {
    worklists: [],
    singleDeleteData: {},
    deleteSingleClicked: false,
    // commentClicked: false,
    clickedIndex: null,
    selectAll: 0,
    selected: {}
  };

  componentDidMount = async () => {
    this.getWorkListData();
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

    console.log(" ---- in page ");
    console.log(worklists);
    console.log(this.props);
    // for (let worklist of worklists) {
    //   const { data: projectDetails } = await getProject(worklist.projectID);
    //   worklist.projectName = projectDetails.name;
    // }
    this.setState({ worklists });
  };

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      error: "",
      deleteSingleClicked: false
    });
  };

  deleteStudyfromWorklist = async () => {
    const {
      worklist,
      projectID,
      subjectID,
      studyUID
    } = this.state.singleDeleteData;
    const body = [{ projectID, subjectID, studyUID }];
    deleteStudyFromWorklist(worklist, body)
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

  handleSingleDelete = (worklist, projectID, subjectID, studyUID) => {
    this.setState({
      deleteSingleClicked: true,
      singleDeleteData: { worklist, projectID, subjectID, studyUID }
    });
  };

  setWrapperRef = (node, id) => {
    this.wrapperRef = node;
  };

  toggleRow = async (worklist, project, subject, study) => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[study]) {
      delete newSelected[study];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[study] = { worklist, project, subject, study };
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.worklists.forEach(worklist => {
        const { workListID, projectID, subjectID, studyUID } = worklist;
        newSelected[worklist.studyUID] = {
          workListID,
          projectID,
          subjectID,
          studyUID
        };
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  defineColumns = () => {
    return [
      // {
      //   id: "checkbox",
      //   accessor: "",
      //   width: 40,
      //   Cell: ({ original }) => {
      //     console.log(original);
      //     return (
      //       <input
      //         type="checkbox"
      //         className="checkbox-cell"
      //         checked={this.state.selected[original.studyUID]}
      //         onChange={() => this.toggleRow(original.studyUID)}
      //       />
      //     );
      //   },
      //   Header: x => {
      //     return (
      //       <input
      //         type="checkbox"
      //         className="checkbox-cell"
      //         checked={this.state.selectAll === 1}
      //         ref={input => {
      //           if (input) {
      //             input.indeterminate = this.state.selectAll === 2;
      //           }
      //         }}
      //         onChange={() => this.toggleSelectAll()}
      //       />
      //     );
      //   }
      // },

      {
        id: "open",
        Header: "Open",
        width: 50,
        resizable: true,
        Cell: original => {
          return (
            <div onClick={this.props.onClose}>
              <FaRegEye className="menu-clickable" />
            </div>
          );
        }
      },
      {
        id: "desc",
        Header: "Study Description",
        sortable: true,
        resizable: true,
        Cell: original => {
          let studyDesc = this.clearCarets(
            original.row._original.studyDescription
          );
          studyDesc = studyDesc ? studyDesc : "Unnamed Study";
          return <div>{studyDesc}</div>;
        }
      },

      {
        id: "sb_name",
        Header: "Subject Name",
        sortable: true,
        resizable: true,

        Cell: original => {
          let subjectName = this.clearCarets(
            original.row._original.subjectName
          );
          subjectName = subjectName ? subjectName : "Unnamed Subject";
          return <div>{subjectName}</div>;
        }
      },
      {
        id: "pr_name",
        Header: "Project Name",
        accessor: "projectName",
        sortable: true,
        resizable: true,
        Cell: original => {
          let projectName = this.clearCarets(
            original.row._original.projectName
          );
          projectName = projectName ? projectName : "Unnamed Subject";
          return <div>{original.row._original.projectName}</div>;
        }
      },
      {
        id: "due",
        Header: "Due Date",
        sortable: true,
        resizable: true,
        accessor: "worklistDuedate"
      },
      {
        id: "studyUID",
        Header: "StudyUID",
        sortable: true,
        resizable: true,
        accessor: "studyUID"
      },
      {
        id: "delete",
        Header: "",
        width: 45,
        resizable: true,
        Cell: original => (
          <div
            onClick={() =>
              this.handleSingleDelete(
                original.row._original.workListID,
                original.row._original.projectID,
                original.row._original.subjectID,
                original.row._original.studyUID
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
    const selected = this.state.selectAll < 2;
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
            onDelete={this.deleteStudyfromWorklist}
            error={this.state.errorMessage}
          />
        )}
      </div>
    );
  };
}

export default WorkList;
