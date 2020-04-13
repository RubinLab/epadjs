import React from "react";
class PluginNavBar extends React.Component {
  state = {};
  render() {
    return (
      <div className="pluginnavbar">
        <ul className="pluginform nav nav-tabs" id="myTab">
          <li className="pluginform nav-item ">
            <a
              href="#"
              className={
                this.props.manageTabActive === true
                  ? "pluginform nav-link active"
                  : "pluginform nav-link"
              }
              onClick={() => {
                this.props.handleTabClic("manageTabActive");
              }}
            >
              manage
            </a>
          </li>
          <li className="pluginform nav-item">
            <a
              href="#"
              className={
                this.props.trackTabActive === true
                  ? "pluginform nav-link active"
                  : "pluginform nav-link"
              }
              onClick={() => {
                this.props.handleTabClic("trackTabActive");
              }}
            >
              track
            </a>
          </li>
          <li className="pluginform nav-item">
            <a
              href="#"
              className={
                this.props.triggerTabActive === true
                  ? "pluginform nav-link active"
                  : "pluginform nav-link"
              }
              onClick={() => {
                this.props.handleTabClic("triggerTabActive");
              }}
            >
              trigger
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default PluginNavBar;
