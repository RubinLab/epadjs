import React from "react";
import ReactTable from "react-table";
import _ from "lodash";
import { users } from "./userLevelData";

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
    return [
      {
        Header: "User",
        accessor: "userName"
      },
      {
        Header: "# of Patients",
        accessor: "patientname",
        aggregate: vals => vals.length,
        Aggregated: row => {
          return <span>{row.value}</span>;
        }
      },
      {
        Header: "Completion",
        accessor: "completion",
        aggregate: vals => _.round(_.mean(vals)),
        Aggregated: row => {
          return <span>{row.value}%</span>;
        }
      }
    ];
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
          className="pro-table"
          data={this.state.data}
          columns={this.defineColumns()}
          pivotBy={view === "User" ? ["userName"] : ["patientname"]}
          showPagination={false}
        />
      </>
    );
  };
}

export default Users;
