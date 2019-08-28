import React from "react";
import ReactTable from "react-table";
import _ from "lodash";
import { users } from "./userLevelData";
import "./proView.css";

class Users extends React.Component {
  state = { data: [], view: "User" };
  componentDidMount = () => {
    this.setState({ data: users });
  };

  componentWillUnmount = () => {};

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
      this.state.view === "User" ? "  User (#)" : "List of Users";
    const patientHeader =
      this.state.view === "Patient" ? "  Patient (#)" : "List of Patients";
    let columns = [
      {
        Header: userHeader,
        accessor: "userName",
        aggregate: vals => _.join(vals, ", "),
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
        accessor: "patientname",
        aggregate: vals => _.join(vals, ", "),
        Aggregated: row => {
          return (
            <div className="--aggregated">
              <span>{row.value}</span>
            </div>
          );
        }
      },
      {
        Header: "Completion(%)",
        accessor: "completion",
        width: 150,
        style: { textAlign: "center" },
        aggregate: vals => _.round(_.mean(vals)),
        Aggregated: row => {
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
          className="progressView"
          data={this.state.data}
          columns={this.defineColumns()}
          pageSize={this.defineColumns().length}
          pivotBy={view === "User" ? ["userName"] : ["patientname"]}
          showPagination={false}
        />
      </>
    );
  };
}

export default Users;
