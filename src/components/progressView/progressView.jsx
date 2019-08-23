import React from "react";
import ReactTable from "react-table";
import { projectData } from "./data";

class Users extends React.Component {
  state = { projectData: [] };
  componentDidMount = () => {
    this.setState({ projectData });
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
    return [];
  };

  render = () => {
    console.log();
    return (
      <>
        <ReactTable
          className="pro-table"
          data={this.state.data}
          columns={this.defineColumns()}
        />
      </>
    );
  };
}

export default Users;
