import React, { Component } from 'react';
import { Navbar } from './common';
import { LoginContainer } from './login/LoginContainer';
import { connect } from 'react-redux';


class App extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div>
        <Navbar />
        <div className="row">
        	<div className="col-sm-4"/>
            <div className="col-sm-4">	
              <LoginContainer />
            </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  token: state.token,
  loading: state.loading,
  error: state.login.error
});

export default connect(mapStateToProps, null)(App);