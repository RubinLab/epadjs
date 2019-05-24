import React from "react";
import { Route, Redirect } from "react-router-dom";
import auth from "../../services/authService";
import { isLite } from "../../config.json";

const ProtectedRoute = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.getCurrentUser() && !isLite) {
          console.log("in protected route");
          return <Redirect to="/login" />;
        }
        // } else if (!auth.getCurrentUser() && isLite) {
        //   return <Redirect to="/search" />;
        // }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default ProtectedRoute;
