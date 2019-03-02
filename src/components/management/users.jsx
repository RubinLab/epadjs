import React from 'react';
import Table from 'react-table';
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
      <div> 
        <p>{this.props.selection}</p>
        <Table data={this.state.data} columns={this.defineColumns()}/>
      </div>
    );
  }
}

export default Users;
