import React, { Component } from "react";

const userProfile = props => {
  const element = document.getElementsByClassName("nav-link user-profile");
  var rect = element[0].getBoundingClientRect();
  const url = sessionStorage.getItem("auth");
  const admin = "/admin/ePad/console/#/realms/ePad/users";
  const user = "/realms/ePad/account";
  return (
    <div>
      <div className="userProfile-menu" style={{ left: rect.left }}>
        <div
          className="userProfile-menu__option"
          onClick={() => {
            window.open(url + user, "_blank", "");
          }}
        >
          {" "}
          My account
        </div>
        {props.admin ? (
          <div
            className="userProfile-menu__option"
            onClick={() => {
              window.open(url + admin, "_blank", "");
            }}
          >
            Manage users
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default userProfile;
