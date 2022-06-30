import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { BsArrowBarLeft, BsArrowBarRight } from "react-icons/bs";
import Collapsible from "react-collapsible";
import AnnotationList from "../annotationsList/annotationDock/annotationList";
import AimEditor from "../aimEditor/aimEditor";

import "./RightsideBar.css";

class Rightsidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: "420px",
      marginRight: "420px",
      buttonDisplay: "block",
      open: true,
    };
  }

  async componentDidMount() { }

  handleToggle = () => {
    if (this.state.open) {
      this.setState({
        width: "0px",
        marginRight: "0",
        open: false,
      });
    } else {
      this.setState({
        width: "420px",
        marginRight: "420px",
        open: true,
      });
    }
  };

  render() {
    const { selectedAim, showAimEditor } = this.props;
    const { open, width, marginRight } = this.state;
    return (
      <React.Fragment>
        <div>
          <div className="right-tab-menu" style={{ marginRight: marginRight }}>
            <div className="drawer-control" onClick={this.handleToggle}>{!open ? (<BsArrowBarLeft className="bi bi-arrow-bar-left" />) : (<BsArrowBarRight className="bi bi-arrow-bar-left" />)}</div>
            <div className="right-tabs">Annotations</div>
          </div>
        </div>
        {/* } */}
        <div
          id="mySidebar"
          className="rightsidenav"
          style={{ width: width }}
        >
          {showAimEditor && (
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
          )}
          {!showAimEditor && (
            <AnnotationList updateTreeDataOnSave={this.props.updateTreeDataOnSave} onDelete={this.props.onCancel} />
          )}
        </div>
        <div
          className={this.state.open ? "mainView" : "mainView-closed"}
          style={{
            marginRight: (open ? '455px' : '35px'),
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
