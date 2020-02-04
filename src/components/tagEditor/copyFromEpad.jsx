import React from "react";
import ManualEditingForm from "./manualEditForm";
import { getAllSubjects } from "../../services/subjectServices";
import SeriesBrowser from "./seriesBrowser";

class CopyFromEpad extends React.Component {
  state = {
    showBrowser: false
  };

  handleSeriesBrowse = () => {
    this.setState(state => ({ showBrowser: !state.showBrowser }));
  };
  render = () => {
    return (
      <>
        <input
          className="uploadWizard-define"
          onClick={this.handleSeriesBrowse}
          value="Browse Series in Epad"
          type="button"
        />
        <div className="copyFromEpad">
          <ManualEditingForm
            requirements={this.props.requirements}
            treeData={this.props.treeData}
            index={this.props.index}
            onTagInput={this.props.onTagInput}
          />
          {this.state.showBrowser && (
            <SeriesBrowser onClose={this.handleSeriesBrowse} />
          )}
        </div>
      </>
    );
  };
}

export default CopyFromEpad;
