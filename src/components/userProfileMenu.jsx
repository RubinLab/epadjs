import React, { Component } from "react";

const userProfile = async props => {
  const element = document.getElementsByClassName("nav-link user-profile");
  var rect = element[0].getBoundingClientRect();
  console.log(props);
  fetch("/keycloak.json")
    .then(async res => {
      const data = await res.json();
      console.log(data);
      return (
        <div>
          <div className="userProfile-menu" style={{ left: rect.left }}>
            <div className="userProfile-menu__option"> My account</div>
            {props.admin ? (
              <div className="userProfile-menu__option">Manage users</div>
            ) : null}
          </div>
        </div>
      );
    })
    .catch(err => {
      console.log(err);
      return (
        <div>
          <div className="userProfile-menu" style={{ left: rect.left }}>
            <div className="userProfile-menu__option"> My account</div>
            {props.admin ? (
              <div className="userProfile-menu__option">Manage users</div>
            ) : null}
          </div>
        </div>
      );
    });
};

export default userProfile;
