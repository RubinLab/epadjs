import React, { Component } from 'react';
import { Navbar } from './common';
import LoginContainer from './login/LoginContainer';
import { connect } from 'react-redux';


const App = () => {
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

export default App;