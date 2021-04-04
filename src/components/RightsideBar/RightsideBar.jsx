import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
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
      open: true,
    };
  }

  async componentDidMount() { }

  handleToggle = () => {
    if (this.state.open) {
      this.setState({
        width: "0",
        marginRight: "0",
        open: false,
      });
    } else {
      this.setState({
        width: "300px",
        marginRight: "300px",
        open: true,
      });
    }
  };

  render() {
    const { selectedAim } = this.props;
    let aimEditorHeader;
    selectedAim ? aimEditorHeader = "Aim Editor (Edit Mode)" : aimEditorHeader = "Aim Editor (Create Mode)"
    // const { projectID } = openSeries[activePort];
    console.log("aim is", this.props.selectedAim);
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
          {/* <Collapsible trigger={"Tools"} transitionTime={100}>
            <ToolMenu />
          </Collapsible> */}
          {this.props.showAimEditor && (
            <Collapsible
              trigger={aimEditorHeader}
              open={true}
              transitionTime={100}
              triggerOpenedClassName={"test"}
            >
              <div className="AimEditor-Wrapper">
                <AimEditor
                  aimId={this.props.selectedAim}
                  onCancel={this.props.onCancel}
                  // onCancel={this.closeAimEditor}
                  updateTreeDataOnSave={this.props.updateTreeDataOnSave}
                  updateProgress={this.props.updateProgress}
                  // projectID={projectID}
                  hasSegmentation={this.props.hasSegmentation}
                  activeLabelMapIndex={this.props.activeLabelMapIndex}
                  setAimDirty={this.props.setAimDirty}
                />
              </div>
            </Collapsible>
          )}
          <Collapsible trigger={"Annotations"} transitionTime={100} open={true}>
            <AnnotationList updateTreeDataOnSave={this.props.updateTreeDataOnSave} onDelete={this.props.onCancel} />
          </Collapsible>
        </div>
        <div
          className={this.state.open ? "mainView" : "mainView-closed"}
          style={{
            marginRight: this.state.marginRight,
            height: "calc(100% - 5px)",
          }}
        >
          {this.props.children}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { activePort, openSeries } = state.annotationsListReducer;
  return {
    activePort,
    openSeries,
  };
};
export default withRouter(connect(mapStateToProps)(Rightsidebar));
