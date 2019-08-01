import React from "react";
import { connect } from "react-redux";
import Line from "./common/coloredLine";
import { getUsers } from "../../services/userServices";
import { getCurrentUser } from "../../services/authService";
import { isLite } from "../../config.json";
import About from "./about";
import Team from "./team";

class InfoMenu extends React.Component {
  state = {
    selection: "",
    isModalOpen: false,
    isAdmin: false
  };

  componentDidMount = async () => {
    this.updateDimensions();
    if (!isLite) {
      const currentUser = getCurrentUser();
      let users = await getUsers();
      users = users.data.ResultSet.Result;
      for (let user of users) {
        if (user.username === currentUser && user.admin) {
          this.setState({ isAdmin: true });
          break;
        }
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
    this.props.closeMenu();
  };

  selectDisplay = () => {
    let selection;
    switch (this.state.selection) {
      case "About":
        return <About onOK={this.handleCloseModal} />;
      case "Help":
        window.open(
          "https://epad.stanford.edu/documentation/user",
          "_blank",
          ""
        );
      case "What's New":
        window.open("https://epad.stanford.edu/", "_blank", "");
      case "Team":
        return <Team onOK={this.handleCloseModal} />;
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
