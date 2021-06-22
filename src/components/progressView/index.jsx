import React from "react";
import ReactTable from "react-table-v6";
import _ from "lodash";
import Badge from "react-bootstrap/Badge";
import ReactTooltip from "react-tooltip";
import { GrCalculator, GrManual } from "react-icons/gr";
import { getWorklistProgress } from "../../services/worklistServices";
import "./proView.css";

class ProgressView extends React.Component {
  state = { data: [], view: "User" };
  componentDidMount = async () => {
    this.getWorkListData();
  };

  componentDidUpdate = prevProps => {
    if (this.props.match.params.wid !== prevProps.match.params.wid) {
      this.getWorkListData();
    }
  };

  getWorkListData = async () => {
    const { data } = await getWorklistProgress(this.props.match.params.wid);
    data.forEach(el => (el.subject_name = this.clearCarets(el.subject_name)));
    this.setState({ data });
  };

  componentWillUnmount = () => {};

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string;
    }
  };

  toggleRow = async username => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[username]) {
      delete newSelected[username];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[username] = true;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.data.forEach(users => {
        newSelected[users.username] = true;
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  defineColumns = () => {
    const userHeader =
      this.state.view === "User" ? "  Assignee (#)" : "List of Users";
    const patientHeader =
      this.state.view === "Patient" ? "  Patient (#)" : "List of Patients";
    let columns = [
      {
        Header: userHeader,
        accessor: "assignee",
        aggregate: vals => _.join(Array.from(new Set(vals)), ", "),
        Aggregated: row => {
          return (
            <div className="--aggregated">
              <span>{row.value}</span>
            </div>
          );
        }
      },
      {
        Header: patientHeader,
        accessor: "subject_name",
        aggregate: vals => _.join(Array.from(new Set(vals)), ", "),
        Aggregated: row => {
          return (
            <div className="--aggregated">
              <span>{row.value}</span>
            </div>
          );
        }
      },
      // {
      //   Header: "Study Description",
      //   accessor: "study_desc",
      //   Aggregated: row => {
      //     return (
      //       <div className="--aggregated">
      //         <span>{row.value}</span>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Study UID",
        accessor: "study_uid",
        Aggregated: row => {
          return (
            <div className="--aggregated">
              <span>{row.value}</span>
            </div>
          );
        }
      },
      {
        Header: "Requirement",
        accessor: "worklist_requirement_desc",
        width: 120,
        Aggregated: row => {
          return (
            <div className="--aggregated">
              <span>{row.value}</span>
            </div>
          );
        }
      },
      {
        width: 25,
        resizable: false,
        accessor: "type",
        Aggregated: row => <div />,
        Cell: row => {
          const isAuto = row.value === "AUTO";
          const variant = isAuto ? "info" : "light";
          const text = isAuto ? <GrCalculator /> : <GrManual />;
          const tooltipText = isAuto
            ? "Progress by annotations"
            : "Progress manually";
          return (
            <div>
              <Badge
                data-tip
                data-for={`progressType-badge${row.index}`}
                variant={variant}
              >
                {text}
              </Badge>
              <ReactTooltip
                id={`progressType-badge${row.index}`}
                place="left"
                type="light"
                delayShow={1000}
              >
                <span>{tooltipText}</span>
              </ReactTooltip>
            </div>
          );
        }
      },
      {
        Header: "Completion(%)",
        accessor: "completeness",
        style: { textAlign: "center" },
        width: 120,
        aggregate: vals => _.round(_.mean(vals)),
        Cell: row => {
          return (
            <div className="--aggregated">
              <span>{row.value}</span>
            </div>
          );
        }
      }
    ];

    if (this.state.view === "User") {
      columns[0] = { ...columns[0], width: 300 };
    } else {
      columns[1] = { ...columns[1], width: 300 };
    }

    return columns;
  };

  switchTableView = () => {
    if (this.state.view === "User") {
      this.setState({ view: "Patient" });
    } else {
      this.setState({ view: "User" });
    }
  };
  render = () => {
    const { view } = this.state;
    return (
      <>
        <button onClick={this.switchTableView} style={{ color: "black" }}>
          Show {this.state.view} Based View{" "}
        </button>
        <ReactTable
          NoDataComponent={() => null}
          className="progressView"
          data={this.state.data}
          columns={this.defineColumns()}
          pageSize={this.defineColumns().length}
          pivotBy={view === "User" ? ["assignee"] : ["subject_name"]}
          showPagination={false}
        />
      </>
    );
  };
}

export default ProgressView;
