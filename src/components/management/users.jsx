import React from 'react';
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

  render = () => {
    console.log('user data', this.state.data);
    return (
      <div> Users here</div>
    );
  }
}

export default Users;
