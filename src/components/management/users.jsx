import React from 'react';
import Table from 'react-table';
import './menuStyle.css';
import { getUsers } from '../../services/userServices';

class Users extends React.Component {

  state = {
    data: []
  }

  componentDidMount = () => {
    this.getUserData();
  } 

  getUserData = async () => {
    const result = await getUsers();
    this.setState({ data: result.data.ResultSet.Result });
  }

  defineColumns = () => {
    return [
      {
        id: "checkbox",
          accessor: "",
          Cell: ({ original }) => {
            return (
              <input
                type="checkbox"
                className="checkbox"
                // checked={this.state.selected[original.firstName] === true}
                // onChange={() => this.toggleRow(original.firstName)}
              />
            );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              // checked={this.state.selectAll === 1}
            //   ref={input => {
            //     if (input) {
            //       input.indeterminate = this.state.selectAll === 2;
            //     }
            //   }}
            //   onChange={() => this.toggleSelectAll()}
            />
          );
        },
        sortable: false,
        width: 45
      },
      {
        Header: 'First',
        accessor: 'firstname'
      }, {
        Header: 'Last',
        accessor: 'lastname'
      }, {
        Header: 'Email',
        accessor: 'email'
      }, {
        Header: 'Color',
        accessor: 'colorpreference'
      }, {
        Header: 'Projects',
        accessor: 'projects'
      }, {
        Header: 'Admin',
        accessor: 'admin'
      }, {
        Header: 'Permissions',
        accessor: 'permissions'

      }, {
        Header: 'Enable',
        accessor: 'enabled'
      }, {
        Header: 'Password',
      },
    ];
  }

  render = () => {
    console.log('user data', this.state.data);
    // const col = 
    return (
      <div className="users-display"> 
        <Table data={this.state.data} columns={this.defineColumns()}/>
      </div>
    );
  }
}

export default Users;
