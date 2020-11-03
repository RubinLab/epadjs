import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaCogs, FaInfoCircle, FaBell } from 'react-icons/fa';
import logo from '../images/logo.png';
import { connect } from 'react-redux';
const mode = sessionStorage.getItem('mode');

const NavBar = ({
  user,
  openGearMenu,
  openInfoMenu,
  openUser,
  onReports,
  logout,
  onSearchViewClick,
  onSwitchView,
  notificationWarning,
  pid,
}) => {
  // handleClick = () => {
  //   openMenu();
  // };
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <Link className="navbar-brand-right nounderline pr-3 " to="#">
          <img id="epad-logo" src={logo} alt={'logo'} width="25px" />
          {mode === 'lite' && 'eLite'} {mode !== 'lite' && 'ePAD'}
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
            <li
              className="nav-item"
              onClick={() => {
                onSearchViewClick();
                onSwitchView('search');
              }}
            >
              <NavLink
                className="nav-link"
                to={pid ? `/search/${pid}` : '/search'}
              >
                Search
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/display">
                Display
              </NavLink>
            </li>
            {mode !== 'lite' && (
              <React.Fragment>
                {/* <li className="nav-item">
                  <NavLink className="nav-link" to="/anotate">
                    Annotate
                  </NavLink>
                </li>
                <li
                  className="nav-item"
                  onClick={() => {
                    onSwitchView("progress");
                  }}
                >
                  <NavLink className="nav-link" to="/progress">
                    Progress
                  </NavLink>
                </li> */}
                <li
                  className="nav-item"
                  id="navbarReports"
                  onClick={() => {
                    onReports();
                  }}
                >
                    Reports
                </li>
                {/* <li className="nav-item">
                  <NavLink className="nav-link" to="/edit">
                    Edit
                  </NavLink>
                </li>{' '} */}
                <li
                  className="nav-item"
                  onClick={() => {
                    onSwitchView('flex');
                  }}
                >
                  <NavLink
                    className="nav-link"
                    to={pid ? `/flex/${pid}` : `/flex`}
                  >
                    Flex
                  </NavLink>
                </li>{' '}
              </React.Fragment>
            )}
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
                <li className="nav-item pull-right" data-name="mng">
                  <div
                    className="nav-link mng-icon"
                    data-name="mng"
                    onClick={(e) => {
                      openGearMenu(e);
                    }}
                  >
                    <FaCogs style={{ fontSize: '1.5rem' }} data-name="mng" />
                  </div>
                </li>
                <li className="nav-item pull-right" data-name="info">
                  <div
                    className="nav-link info-icon"
                    data-name="info"
                    onClick={(e) => {
                      openInfoMenu(e);
                    }}
                  >
                    <FaInfoCircle
                      style={{ fontSize: '1.5rem', position: 'relative' }}
                      data-name="info"
                    />
                    {notificationWarning ? (
                      <FaBell className="notification-warning" />
                    ) : null}
                  </div>
                </li>
                <li className="nav-item pull-right" data-name="user">
                  <div
                    className="nav-link user-profile"
                    data-name="user"
                    onClick={(e) => {
                      openUser(e);
                    }}
                  >
                    {user.displayname}
                  </div>
                </li>
                <li className="nav-item-right pull-right">
                  <NavLink className="nav-link" to="/logout" onClick={logout}>
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

const mapStateToProps = (state) => {
  return {
    loading: state.annotationsListReducer.loading,
  };
};
export default connect(mapStateToProps)(NavBar);
