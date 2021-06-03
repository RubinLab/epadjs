import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import auth from '../../services/authService';
const mode = sessionStorage.getItem('mode');

const redirected = Object.keys(localStorage)
  .join(',')
  .includes('oidc');

const ProtectedRoute = ({ path, component: Component, render, ...rest }) => {
  console.log(' ----> auth getCureent user');
  console.log(auth.getCurrentUser());
  const usermng = new auth.AuthService();
  return (
    <Route
      {...rest}
      render={props => {
        if (!usermng.isAuthenticated() && mode !== 'lite') {
          // if (redirected) {
          //   return <Redirect to="/loading" />
          // }
          return <Redirect to="/login" />;
        }
        // } else if (!auth.getCurrentUser() &&mode  == "lite") {
        //   return <Redirect to="/search" />;
        // }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default ProtectedRoute;
