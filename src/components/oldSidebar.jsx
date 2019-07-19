import React, { Component } from "react";
import Sb from "react-sidebar";
import { getProjects } from "../services/projectsService";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      docked: true
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  async componentDidMount() {
    const {
      data: {
        ResultSet: { Result: projects }
      }
    } = await getProjects();
    this.setState({ projects });
  }

  onSetSidebarOpen(open) {
    this.setState({ docked: open });
  }

  render() {
    return (
      <React.Fragment>
        <Sb
          sidebar={
            <div>
              <button onClick={() => this.onSetSidebarOpen(false)}>
                Close sidebar
              </button>
              <ul className="list-unstyled">
                {this.state.projects.map(project => (
                  <li key={project.id}>{project.name} </li>
                ))}
              </ul>
            </div>
          }
          docked={this.state.docked}
          onSetOpen={this.onSetSidebarOpen}
          styles={{
            sidebar: { top: "55px", background: "darkgray", zIndex: 1 }
          }}
        >
          {this.props.children}
          {!this.state.docked && (
            <button onClick={() => this.onSetSidebarOpen(true)}>
              Open sidebar
            </button>
          )}
        </Sb>
      </React.Fragment>
    );
  }
}

export default Sidebar;
