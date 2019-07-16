import React from "react";
import { connect } from "react-redux";
import Modal from "./common/customModal";
import Users from "./users";
import Projects from "./projects/projects";
import WorkLists from "./worklists/workLists";
import Annotations from "./annotations/annotations";
import Templates from "./templates";
import Tools from "./tools";
import Connections from "./connections";
import "./menuStyle.css";
import Header from "./common/managementHeader";
import { isLite } from "../../config.json";
import { managementItemSelected } from "./action";

class MainMenu extends React.Component {
  state = {
    selection: "",
    isModalOpen: false,
    coordinate: "50%"
  };

  componentDidMount = () => {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  };

  updateDimensions = () => {
    const icon = document.getElementsByClassName("mng-icon")[0];
    const coordinate = icon.getBoundingClientRect().left;
    this.setState({ coordinate });
    // this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  componentWillMount = () => {
    this.updateDimensions();
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions);
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
        return (
          <Users
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      case "Projects":
        return (
          <Projects
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      case "Worklists":
        return (
          <WorkLists
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      case "Annotations":
        return (
          <Annotations
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      case "Templates":
        return (
          <Templates
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      case "Tools":
        return (
          <Tools
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      case "Connections":
        return (
          <Connections
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      default:
        return <div />;
    }
  };

  render() {
    const style = { left: this.state.coordinate };

    return (
      <div className="mng-menu" style={style}>
        <div className="mng-menu__option" onClick={this.handleSelection}>
          Annotations
        </div>
        <div className="mng-menu__option" onClick={this.handleSelection}>
          Templates
        </div>
        {!isLite && (
          <>
            <div className="mng-menu__option" onClick={this.handleSelection}>
              Users
            </div>
            <div className="mng-menu__option" onClick={this.handleSelection}>
              Projects
            </div>
            <div className="mng-menu__option" onClick={this.handleSelection}>
              Worklists
            </div>
            {false && (
              <div className="mng-menu__option" onClick={this.handleSelection}>
                Tools
              </div>
            )}
            {false && (
              <div className="mng-menu__option" onClick={this.handleSelection}>
                Pluginstore
              </div>
            )}
            <div className="mng-menu__option" onClick={this.handleSelection}>
              Connections
            </div>
            {false && (
              <div className="mng-menu__option" onClick={this.handleSelection}>
                Queries
              </div>
            )}
          </>
        )}
        {this.state.isModalOpen && (
          <Modal>
            <Header
              selection={this.state.selection}
              onClose={this.handleCloseModal}
            />
            {this.selectDisplay()}
          </Modal>
        )}
      </div>
    );
  }
}

export default connect()(MainMenu);
