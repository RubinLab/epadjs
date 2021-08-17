import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import auth from '../../services/authService';
const mode = sessionStorage.getItem('mode');

const redirected = Object.keys(localStorage)
  .join(',')
  .includes('oidc');

const ProtectedRoute = ({
  path,
  component: Component,
  render,
  ...rest
}) => {

  const usermng = new auth.AuthService();
  return (
    <Route
      {...rest}
      render={props => {
        if (!usermng.isAuthenticated() && mode !== 'lite') {
          return <Redirect to="/login" />;
        }
        // } else if (!auth.getCurrentUser() &&mode  == "lite") {
        //   return <Redirect to="/list" />;
        // }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default ProtectedRoute;
