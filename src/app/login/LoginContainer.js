import React, { Component } from 'react';
import styles from './login.css';
import { createSession } from './duck/actions';
import { connect } from 'react-redux';
import LoginComponent from './LoginComponent';


export class LoginContainer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return(<LoginComponent />);
  }
}

const mapStateToProps = state => ({
  token: state.token,
  loading: state.loading,
  error: state.login.error
});

const mapDispatchToProps = dispatch => ({
  createSession: (username, password) => {
    dispatch(createSession(username, password))
  }
})


export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);;
