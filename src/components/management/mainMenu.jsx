import React from "react";
import ReactModal from "react-modal-resizable-draggable";
import Modal from "./common/customModal";
// import Modal from '../common/rndBootModal';
import Users from "./users";
import Projects from "./projects/projects";
import WorkLists from "./worklists/workLists";
import Annotations from "./annotations/annotations";
import "./menuStyle.css";
import Header from "./common/managementHeader";
import { isLite } from "../../config.json";

class MainMenu extends React.Component {
  state = {
    selection: "",
    isModalOpen: false
  };

  handleSelection = e => {
    const selection = e.target.textContent;
    // this.setState({ selection});
    this.setState(state => {
      return { isModalOpen: !state.isModalOpen };
    });
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
      default:
        return <div />;
    }
  };

  render() {
    console.log(this.state);
    return (
      <div className="mng-menu">
        <div onClick={this.handleSelection}>Annotations</div>
        <div onClick={this.handleSelection}>Templates</div>
        {!isLite && (
          <>
            <div onClick={this.handleSelection}>Users</div>
            <div onClick={this.handleSelection}>Projects</div>
            <div onClick={this.handleSelection}>Worklists</div>
            <div onClick={this.handleSelection}>Tools</div>
            <div onClick={this.handleSelection}>Pluginstore</div>
            <div onClick={this.handleSelection}>Connections</div>
            <div onClick={this.handleSelection}>Queries</div>
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
        {/* <ReactModal
          initWidth={800}
          initHeight={400}
          onRequestClose={this.handleCloseModal}
          isOpen={this.state.isModalOpen}
          left={20}
        >
          {this.selectDisplay()}
        </ReactModal> */}
      </div>
    );
  }
}

export default MainMenu;
