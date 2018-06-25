import React, { Component } from 'react';
import styles from './login.css';
import { createSession, recoverPassword } from './duck/actions';
import { connect } from 'react-redux';
import LoginComponent from './LoginComponent';


class LoginContainer extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.token !== nextProps.token) {
      console.log(this.props.token);
      return true;
    }
    return true;
  }
  render() {
    console.log(this.props.token);
    return(<LoginComponent {...this.props}/>);
  }
}

const mapStateToProps = state => {
  return { 
    token: state.login.token,
    loading: state.login.loading,
    error: state.login.error
  }
}

const mapDispatchToProps = dispatch => {
  return { createSession: (username, password) => {
    dispatch(createSession(username, password))
  },
  recoverPassword: (username) => {
    dispatch(recoverPassword(username))
   }
  }
  }


export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);
