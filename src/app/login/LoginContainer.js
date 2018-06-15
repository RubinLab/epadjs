import React, { Component } from 'react';
import styles from './login.css';
import { createSession } from './duck/actions';
import { connect } from 'react-redux';
import LoginComponent from './LoginComponent';


class LoginContainer extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  render() {
    console.log(this.props);
    return(<LoginComponent {...this.props}/>);
  }
}

const mapStateToProps = state => {
  return { 
    token: state.token,
    loading: state.loading,
    error: state.login.error
  }
}

const mapDispatchToProps = dispatch => {
  return { createSession: (username, password) => {
    dispatch(createSession(username, password))
  } }
  }


export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);;
