import React from "react";
import { connect } from "react-redux";
import Line from "./common/coloredLine";
import { getUsers } from "../../services/userServices";

class InfoMenu extends React.Component {
  state = {
    selection: "",
    isModalOpen: false
  };

  componentDidMount = async () => {
    this.updateDimensions();
    const users = await getUsers();
    console.log(users.data.ResultSet.Result);
  };
  updateDimensions = () => {
    const icon = document.getElementsByClassName("info-icon")[0];
    const coordinate = icon.getBoundingClientRect().left;
    this.setState({ coordinate });
    // this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  handleSelection = e => {
    const selection = e.target.textContent;
    // this.setState({ selection});
    this.setState(state => {
      return { isModalOpen: !state.isModalOpen };
    });
    // this.props.dispatch(managementItemSelected(selection));
    this.setState({ selection });
  };

  handleCloseModal = e => {
    this.setState(state => {
      return { isModalOpen: !state.isModalOpen };
    });
    this.props.closeMenu();
  };

  selectDisplay = () => {
    switch (this.state.selection) {
      case "Users":
        return <div />;
      default:
        return <div />;
    }
  };

  render() {
    const style = { left: this.state.coordinate };

    return (
      <div className="info-menu" style={style}>
        <div className="info-menu__option" onClick={this.handleSelection}>
          Notifications
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
        <div className="info-menu__break" />
        <div className="info-menu__option" onClick={this.handleSelection}>
          Admin
        </div>

        {this.state.isModalOpen && <div />}
      </div>
    );
  }
}

export default connect()(InfoMenu);
