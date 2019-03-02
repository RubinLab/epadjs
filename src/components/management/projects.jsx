import React from 'react';
import Table from 'react-table';
import { getUsers } from '../../services/userServices';

class Users extends React.Component {

  state = {
    data: []
  }


  render = () => {
    console.log('user data', this.state.data);
    // const col = 
    return (
      <div> 
        <p>{this.props.selection}</p>
      </div>
    );
  }
}

export default Users;
