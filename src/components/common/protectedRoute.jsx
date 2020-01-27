import React from "react";
import { Route, Redirect } from "react-router-dom";
import auth from "../../services/authService";
const mode = sessionStorage.getItem("mode");

const ProtectedRoute = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.getCurrentUser() && mode !== "lite") {
          return <Redirect to={`${process.env.PUBLIC_URL}/login`} />;
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
