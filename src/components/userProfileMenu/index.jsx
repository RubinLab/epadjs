import React from "react";
import { connect } from "react-redux";
import UserProfile from "./userProfile";

class InfoMenu extends React.Component {
  state = {
    selection: "",
    isModalOpen: false
  };

  componentDidMount = async () => {
    this.updateDimensions();
  };

  updateDimensions = () => {
    const icon = document.getElementsByClassName("user-profile")[0];
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
    switch (this.state.selection) {
      case "User Profile":
        return <UserProfile onOK={this.handleCloseModal} />;
      default:
        return <div />;
    }
  };

  render() {
    const style = { left: this.state.coordinate };
    return (
      <>
        {!this.state.isModalOpen && (
          <div className="userProfile-menu" style={style}>
            <div
              className="userProfile-menu__option"
              onClick={this.handleSelection}
            >
              User Profile
            </div>
          </div>
        )}
        {this.state.isModalOpen && this.selectDisplay()}
      </>
    );
  }
}

export default connect()(InfoMenu);
