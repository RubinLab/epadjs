import React from "react";
import { connect } from "react-redux";
import { isLite } from "../../config.json";
import About from "./about";
import Team from "./team";
import Admin from "./admin";
import Modal from "../management/common/customModal";
import Notifications from "./notifications";
import { FaExclamation } from "react-icons/fa";

class InfoMenu extends React.Component {
  state = {
    selection: "",
    isModalOpen: false,
    isAdmin: false
  };

  componentDidMount = async () => {
    this.updateDimensions();
    // console.log(this.props.user);
    if (!isLite) {
      if (this.props.user.admin) {
        this.setState({ isAdmin: true });
      }
    }
  };
  updateDimensions = () => {
    const icon = document.getElementsByClassName("info-icon")[0];
    const coordinate = icon.getBoundingClientRect().left;
    this.setState({ coordinate });
  };

  handleSelection = async e => {
    const selection = e.target.textContent;
    this.setState(state => {
      return { isModalOpen: !state.isModalOpen };
    });
    await this.setState({ selection });
  };

  handleCloseModal = e => {
    this.setState(state => {
      return { isModalOpen: !state.isModalOpen };
    });
    this.props.closeMenu(true);
  };

  selectDisplay = () => {
    switch (this.state.selection) {
      case "About":
        return <About onOK={this.handleCloseModal} />;
      case "Help":
        window.open(
          "https://epad.stanford.edu/documentation/user",
          "_blank",
          ""
        );
        return;
      case "What's New":
        window.open("https://epad.stanford.edu/", "_blank", "");
        return;
      case "Team":
        return <Team onOK={this.handleCloseModal} />;
      case "Admin":
        return (
          <Modal>
            <Admin onOK={this.handleCloseModal} />
          </Modal>
        );
      case "Notifications":
        return (
          <Notifications
            onOK={this.handleCloseModal}
            list={this.props.notifications}
            title="Notifications"
          />
        );
      default:
        return <div />;
    }
  };

  render() {
    const style = { left: this.state.coordinate };
    return (
      <>
        {!this.state.isModalOpen && (
          <div className="info-menu" style={style}>
            <div className="info-menu__option" onClick={this.handleSelection}>
              Notifications
              {this.props.notificationWarning ? (
                <FaExclamation
                  style={{ fontSize: "1rem", color: "orangered" }}
                  onClick={this.handleSelection}
                />
              ) : null}
            </div>
            <div className="info-menu__option" onClick={this.handleSelection}>
              Log
            </div>
            <div className="info-menu__break" />
            <div className="info-menu__option" onClick={this.handleSelection}>
              Shortcuts
            </div>
            <div className="info-menu__option" onClick={this.handleSelection}>
              Settings
            </div>
            <div className="info-menu__break" />
            <div className="info-menu__option" onClick={this.handleSelection}>
              About
            </div>
            <div className="info-menu__option" onClick={this.handleSelection}>
              Help
            </div>
            <div className="info-menu__option" onClick={this.handleSelection}>
              What's New
            </div>
            <div className="info-menu__option" onClick={this.handleSelection}>
              Team
            </div>
            {this.state.isAdmin && (
              <>
                <div className="info-menu__break" />
                <div
                  className="info-menu__option"
                  onClick={this.handleSelection}
                >
                  Admin
                </div>
              </>
            )}
          </div>
        )}
        {this.state.isModalOpen && this.selectDisplay()}
      </>
    );
  }
}

export default connect()(InfoMenu);
