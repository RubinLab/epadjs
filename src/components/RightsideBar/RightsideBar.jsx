import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ToolMenu from "../ToolMenu/ToolMenu";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import Collapsible from "react-collapsible";
import AnnotationList from "../annotationsList/annotationDock/annotationList";
import AimEditor from "../aimEditor/aimEditor";

import "./RightsideBar.css";

class Rightsidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: "300px",
      marginRight: "300px",
      buttonDisplay: "block",
      open: true
    };
  }

  async componentDidMount() {}

  handleToggle = () => {
    if (this.state.open) {
      this.setState({
        width: "0",
        marginRight: "0",
        open: false
      });
    } else {
      this.setState({
        width: "300px",
        marginRight: "300px",
        open: true
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        {!this.state.open && (
          <div>
            <button className="openbtn" onClick={this.handleToggle}>
              <FaArrowAltCircleLeft />
            </button>
          </div>
        )}
        <div
          id="mySidebar"
          className="rightsidenav"
          style={{ width: this.state.width }}
        >
          {this.state.open && (
            <div>
              <button className="closebtn" onClick={this.handleToggle}>
                <FaArrowAltCircleRight />
              </button>
            </div>
          )}
          <Collapsible trigger={"Tools"} transitionTime={100}>
            <ToolMenu />
          </Collapsible>
          {this.props.showAimEditor && (
            <Collapsible
              trigger={"Aim Editor"}
              open={true}
              transitionTime={100}
              triggerOpenedClassName={"test"}
            >
              <div className="AimEditor-Wrapper">
                <AimEditor
                  aimId={this.props.selectedAim}
                  // onCancel={this.closeAimEditor}
                  hasSegmentation={this.props.hasSegmentation}
                />
              </div>
            </Collapsible>
          )}
          <Collapsible trigger={"Annotations"} transitionTime={100}>
            <AnnotationList />
          </Collapsible>
          <Collapsible trigger={"Message Center"} transitionTime={100}>
            <p>
              This is the collapsible message content. Messages will be shown
              here.
            </p>
            <p>No New Message!</p>
          </Collapsible>
        </div>
        <div
          className={this.state.open ? "mainView" : "mainView-closed"}
          style={{
            marginRight: this.state.marginRight,
            height: "calc(100% - 50px)"
          }}
        >
          {this.props.children}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { activePort, dockOpen } = state.annotationsListReducer;
  return {
    activePort,
    dockOpen
  };
};
export default withRouter(connect(mapStateToProps)(Rightsidebar));
