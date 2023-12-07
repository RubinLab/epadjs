import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { BsArrowBarLeft, BsArrowBarRight } from "react-icons/bs";
import Collapsible from "react-collapsible";
import AnnotationList from "../annotationsList/annotationDock/newAnnotationList";
import AimEditor from "../aimEditor/aimEditor";
import MediaExport from "../MediaExport/MediaExport";

import "./RightsideBar.css";
import "../MediaExport/styles.css";

class Rightsidebar extends Component {
  constructor(props) {
    super(props);
    let x = window.matchMedia("(max-width: 1080px)");
    let rightDim = x.matches ? "320px" : "420px";
    this.state = {
      rightDim,
      width: "0px",
      marginRight: "0",
      buttonDisplay: "block",
      showMediaExport: false,
      open: false,
    };
  }

  componentDidMount() {
    // if mode is thick
    const encrypted = sessionStorage.getItem("encrypted");
    const mode = sessionStorage.getItem("mode");
    if (mode === "thick" && encrypted) {
      this.setState({
        open: false,
        width: "0px",
        marginRight: "0",
      });
    } else {
      this.setState({
        width: this.state.rightDim,
        marginRight: this.state.rightDim,
        open: true,
      });
    }
  }

  handleToggle = () => {
    const { rightDim, open } = this.state;
    if (open) {
      this.setState({
        width: "0px",
        marginRight: "0",
        open: false,
        showMediaExport: false,
      });
    } else {
      this.setState({
        width: rightDim,
        marginRight: rightDim,
        open: true,
      });
    }
  };

  showMediaExport = () => {
    if (!this.state.open) {
      this.handleToggle();
    }
    if (!this.state.showMediaExport || this.props.showAimEditor) {
      if (
        this.props.onCancel(
          true,
          "All unsaved annotation data will be lost! Do you want to continue?"
        ) == 1
      ) {
        if (!this.state.open) {
          this.handleToggle();
        }
        this.setState({ showMediaExport: true });
      }
    } else {
      this.setState({ showMediaExport: false });
    }
  };

  mediaExportTabClicked = () => {
    if (!this.state.showMediaExport || this.props.showAimEditor) {
      this.showMediaExport();
    }
  };

  annotationsTabClicked = () => {
    if (!this.state.open) {
      this.handleToggle();
    }
    this.setState({ showMediaExport: false });
  };

  //saveMediaData = (obj) => {
  //  this.state.mediaExportData = obj;
  //}
  saveMediaData = this.props.saveData;

  render() {
    const { selectedAim, showAimEditor } = this.props;
    const { open, width, marginRight } = this.state;
    return (
      <React.Fragment>
        <div>
          <div className="right-tab-menu" style={{ marginRight: marginRight }}>
            <div className="drawer-control" onClick={this.handleToggle}>
              {!open ? (
                <BsArrowBarLeft className="bi bi-arrow-bar-left" />
              ) : (
                <BsArrowBarRight className="bi bi-arrow-bar-left" />
              )}
            </div>
            {/*<div className='right-tabs'>Annotations</div>*/}
            <div className="right-tabs">
              <ul className="nav nav-tabs" id="myTab1" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={
                      this.state.showMediaExport
                        ? "nav-link"
                        : "nav-link active"
                    }
                    id="annotations-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#annotations-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="annotations-tab-pane"
                    aria-selected={!this.state.showMediaExport}
                    onClick={this.annotationsTabClicked}
                  >
                    Annotations
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={
                      this.state.showMediaExport
                        ? "nav-link active"
                        : "nav-link"
                    }
                    id="media-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#media-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="media-tab-pane"
                    aria-selected={this.state.showMediaExport}
                    onClick={this.mediaExportTabClicked}
                  >
                    Media Export
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* } */}
        <div id="mySidebar" className="rightsidenav" style={{ width: width }}>
          {!showAimEditor && this.state.showMediaExport && (
            <MediaExport
              data={this.props.savedData}
              saveData={this.saveMediaData}
              onClose={this.showMediaExport}
            />
          )}
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
            <AnnotationList
              updateTreeDataOnSave={this.props.updateTreeDataOnSave}
              onDelete={this.props.onCancel}
            />
          )}
        </div>
        <div
          className={this.state.open ? "mainView" : "mainView-closed"}
          style={{
            marginRight: open
              ? this.state.rightDim === "420px"
                ? "455px"
                : "355px"
              : "35px",
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
