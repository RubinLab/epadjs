import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FaCogs, FaCaretDown } from "react-icons/fa";
import logo from "../images/logo.png";
import { connect } from "react-redux";

const NavBar = ({ user, openGearMenu, loading }) => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <Link className="navbar-brand-right nounderline pr-3 " to="#">
          <img src={logo} alt={"logo"} width="25px" />
          ePAD
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarColor01"
          aria-controls="navbarColor01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse pl-0" id="navbarColor01">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/search">
                Search
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/display">
                Display
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/anotate">
                Annotate
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/progress">
                Progress
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/tools">
                Tools
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/edit">
                Edit
              </NavLink>
            </li>{" "}
          </ul>
          <ul className="navbar-nav ml-auto">
            {!user && (
              <li className="nav-item pull-right">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>
            )}
            {user && (
              <React.Fragment>
                <li className="nav-item pull-right">
                  <div
                    className="nav-link"
                    style={{ cursor: "pointer" }}
                    onClick={openGearMenu}
                  >
                    <FaCogs style={{ fontSize: "1.25rem" }} />
                    <FaCaretDown style={{ fontSize: "1rem" }} />
                  </div>
                </li>
                <li className="nav-item pull-right">
                  <NavLink className="nav-link" to="/profile">
                    {user.displayname}
                  </NavLink>
                </li>
                <li className="nav-item-right pull-right">
                  <NavLink className="nav-link" to="/logout">
                    Logout
                  </NavLink>
                </li>
              </React.Fragment>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    loading: state.annotationsListReducer.loading
  };
};
export default connect(mapStateToProps)(NavBar);
