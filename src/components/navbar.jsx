import React, { useCallback } from "react";
import { connect } from "react-redux";
import { Link, NavLink } from 'react-router-dom';
import { BsFillGearFill, BsInfoCircleFill, BsBoxArrowInRight } from 'react-icons/bs';
import { FaBell } from 'react-icons/fa';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { usePhiHotkey } from "./usePhiHotkey";
import logo from '../images/logo.png';
// import stella from '../images/stella-logo-temp-02.png';
import stella from '../images/stella-epad.png';
import stanford from '../images/stanford-rad-allwhite.png';
import { togglePHI } from './annotationsList/action';

const NavBar = (props) => {
  const {
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
    path, 
    showingPHI
  } = props;
  const mode = sessionStorage.getItem('mode');

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
     Hotkey: Cmd/Ctrl + Shift + H
    </Tooltip>
  );

  const changeShowHide = useCallback(() => {
    props.dispatch(togglePHI());
  }, [props.dispatch]);

  usePhiHotkey(changeShowHide);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {mode === 'teaching' && (<Link
          className="navbar-brand"
          to="#"
          id="epad-logo"
        >
          <img src={stella} style={{ maxHeight: '40px', textAlign: 'left' }} />
        </Link>)}
        {mode !== 'teaching' && (<Link
          className="navbar-brand"
          to="#"
          id="epad-logo"
        >
          <img src={logo} style={{ maxHeight: '40px', textAlign: 'left' }} />
          {mode === 'lite' && 'eLite'} {mode !== 'lite' && 'ePAD'}
        </Link>)}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {mode === 'teaching' && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item" >
                <a className={
                  path.includes('search') ? 'nav-link active' : 'nav-link'
                }
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSwitchView('search');
                  }} aria-current="page">Search</a>
              </li>
              <li className="nav-item" >
                {/* <NavLink className={
                  path.includes('flex') ? 'nav-link active' : 'nav-link'
                }
                  to={pid ? `/flex/${pid}` : `/flex`} aria-current="page">Study List</NavLink> */}
                <a className={
                  path.includes('flex') ? 'nav-link active' : 'nav-link'
                }
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSwitchView('flex');
                  }} aria-current="page">Study List</a>
              </li>
              <li className="nav-item" >
                <a className={
                  path.includes('display') ? 'nav-link active' : 'nav-link'
                }
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSwitchView('display');
                  }} aria-current="page">Display</a>
              </li>
            </ul>
          )}{/* END TEACHING */}
          {mode !== 'teaching' && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item" >
                <a className={
                  path.includes('list') ? 'nav-link active' : 'nav-link'
                } style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSearchViewClick();
                    onSwitchView('list', true);
                  }} aria-current="page">Patient List</a>
              </li>
              <li className="nav-item" >
                {/* <NavLink className={
                  path.includes('flex') ? 'nav-link active' : 'nav-link'
                }
                  to={pid ? `/flex/${pid}` : `/flex`} aria-current="page">Study List</NavLink> */}
                <a className={
                  path.includes('flex') ? 'nav-link active' : 'nav-link'
                }
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSwitchView('flex');
                  }} aria-current="page">Study List</a>
              </li>
              <li className="nav-item" >
                <a className={
                  path.includes('search') ? 'nav-link active' : 'nav-link'
                }
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSwitchView('search');
                  }} aria-current="page">Annotations</a>
              </li>
              <li className="nav-item" id="navbarReports">
                <a className={/*path.includes('flex') ? 'nav-link active' :*/ 'nav-link'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onReports();
                  }} aria-current="page">Analysis</a>
              </li>
              <li className="nav-item" >
                <a className={
                  path.includes('display') ? 'nav-link active' : 'nav-link'
                }
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSwitchView('display');
                  }} aria-current="page">Display</a>
              </li>
            </ul>
          )}
          <ul className="navbar-nav ms-auto">
            {!user && (
              <li className="nav-item pull-right">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>
            )}
            {user && mode === 'teaching' && (
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 50 }}
                overlay={renderTooltip}
              >
                <Button variant="outline-light" size="sm" onClick={changeShowHide}>{`${showingPHI ? `Hide` : `Show`} PHI`}</Button>
              </OverlayTrigger>
            )}
            {user && (
              <>
                <li className="nav-item" style={{ paddingRight: '0px' }}>
                  <a className="mng-icon nav-link" onClick={e => openGearMenu(e)} id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <BsFillGearFill />
                  </a>
                </li>
                <li className="nav-item" style={{ paddingRight: '0px' }}>
                  <a className="info-icon nav-link" onClick={e => { openInfoMenu(e) }} id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <BsInfoCircleFill />
                    {notificationWarning ? (
                      <FaBell className="notification-warning" style={{ paddingLeft: '5px' }} />
                    ) : null}
                  </a>
                </li>
                <li className="nav-item" style={{ paddingRight: '0px' }}><a className="user-profile nav-link" onClick={e => openUser(e)}>{user.displayname}</a></li>
                {/* logout is not working in teaching servers so disable the button for teaching mode */}
                {mode !== 'teaching' && (<li className="nav-item" style={{ paddingRight: '0px' }}>
                  <a className="nav-link" onClick={logout} style={{ paddingRight: '0px' }}>
                    <BsBoxArrowInRight /></a>
                </li>)}
              </>
            )}
            {mode === 'teaching' && (<li> <a className="navbar-brand" href="#"><img src={stanford} style={{ maxHeight: '40px', textAlign: 'right', paddingLeft: '1em' }} /></a></li>)}
          </ul>
        </div>
      </div>
    </nav >
  );
};

const mapStateToProps = state => {
  return {
    loading: state.annotationsListReducer.loading,
    showingPHI: state.annotationsListReducer.showingPHI
  };
};
export default connect(mapStateToProps)(NavBar);
