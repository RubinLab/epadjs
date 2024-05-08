import React from "react";
import { connect } from "react-redux";
import Modal from "./common/customModal";
import Users from "./users";
import Projects from "./projects/projects";
import WorkLists from "./worklists/workLists";
import CsvUpload from "./upload/CsvModal";
import Annotations from "./annotations/annotations";
import Templates from "./templates";
import Plugins from "./plugins/main";
import Connections from "./connections";
import "./menuStyle.css";
import Header from "./common/managementHeader";
import { scanDataFolder } from "./dataFolderScan";
let mode;

const mapStateToProps = (state) => {
  return {
    templates: state.annotationsListReducer.templates,
  };
};

class MainMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: "",
      isModalOpen: false,
      coordinate: "50%",
      templateMap: {},
      isUploadOpen: false
    };
  }

  formTemplateMap = () => {
    const codes = Object.keys(this.props.templates)
    const obj = Object.values(this.props.templates)
    const templateMap = codes.reduce((all, item, index) => {
      all[item] = obj[index].TemplateContainer.Template[0].name;
      return all;
    }, {})
    this.setState({ templateMap })
  }

  componentDidMount = () => {
    mode = sessionStorage.getItem("mode");
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
    this.formTemplateMap();
  };

  updateDimensions = () => {
    const icon = document.getElementsByClassName("mng-icon")[0];
    const coordinate = icon.getBoundingClientRect().left;
    this.setState({ coordinate });
    // this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions);
  };

  handleSelection = e => {
    const selection = e.target.textContent;
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
            getProjectAdded={this.props.getProjectAdded}
          />
        );
      case "Worklists":
        return (
          <WorkLists
            selection={this.state.selection}
            onClose={this.handleCloseModal}
            updateProgress={this.props.updateProgress}
            templateMap={this.state.templateMap}
          />
        );
      // case "Annotations":
      //   return (
      //     <Annotations
      //       selection={this.state.selection}
      //       onClose={this.handleCloseModal}
      //       updateProgress={this.props.updateProgress}
      //       pid={this.props.pid}
      //       clearAllTreeData={this.props.clearAllTreeData}
      //     />
      //   );
      case "Templates":
        return (
          <Templates
            selection={this.state.selection}
            onClose={this.handleCloseModal}
            pid={this.props.pid}
            getProjectAdded={this.props.getProjectAdded}
          />
        );
      case "Plugins":
        return (
          <Plugins
            selection={this.state.selection}
            onClose={this.handleCloseModal}
          />
        );
      // case "Connections":
      //   return (
      //     <Connections
      //       selection={this.state.selection}
      //       onClose={this.handleCloseModal}
      //     />
      //   );
      default:
        return <div />;
    }
  };

  render() {
    const style = { left: this.state.coordinate };
    return (
      <div>
        {!this.state.isModalOpen && !this.state.isUploadOpen && (
          <div className="mng-menu" style={style}>
            <div
              className="mng-menu__option"
              onClick={() => { this.setState({ isUploadOpen: true, isModalOpen: !this.state.isModalOpen })}}
            >
              Aim Upload
            </div>
            <div className="mng-menu__option" onClick={this.handleSelection}>
              Users
            </div>
            {/* <div className="mng-menu__option" onClick={this.handleSelection}>
              Annotations
            </div> */}
            <div
              className="mng-menu__option"
              onClick={this.handleSelection}
            >
              Templates
            </div>
            {mode !== 'teaching' && (<div className="mng-menu__option" onClick={this.handleSelection}>
              Plugins
            </div>)}
            {false && (
              <div className="mng-menu__option" onClick={this.handleSelection}>
                Pluginstore
              </div>
            )}
            <div className="mng-menu__option" onClick={this.handleSelection}>
              Worklists
            </div>
            {this.props.admin && mode !== "teaching" && (
              <div
                className="mng-menu__option"
                onClick={() => {
                  scanDataFolder();
                  this.props.closeMenu();
                }}
              >
                Scan Data Folder
              </div>
            )}
            {mode !== "lite" && (
              <>
                <div
                  className="mng-menu__option"
                  onClick={this.handleSelection}
                >
                  Projects
                </div>
                {false && (
                  <div
                    className="mng-menu__option"
                    onClick={this.handleSelection}
                  >
                    Tools
                  </div>
                )}
                {false && (
                  <div
                    className="mng-menu__option"
                    onClick={this.handleSelection}
                  >
                    Pluginstore
                  </div>
                )}
                {/* <div
                  className="mng-menu__option"
                  onClick={this.handleSelection}
                >
                  Connections
                </div> */}
                {false && (
                  <div
                    className="mng-menu__option"
                    onClick={this.handleSelection}
                  >
                    Queries
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {this.state.isModalOpen && !this.state.isUploadOpen && (
          <Modal>
            <Header
              selection={this.state.selection}
              onClose={this.handleCloseModal}
            />
            {this.selectDisplay()}
          </Modal>
        )}
        {this.state.isUploadOpen && (
          <CsvUpload onCancel={() => this.setState({ isUploadOpen: false })}/>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(MainMenu);
