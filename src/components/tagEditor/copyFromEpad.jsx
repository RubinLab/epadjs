import React from "react";
import ManualEditingForm from "./manualEditForm";
import { getAllSubjects } from "../../services/subjectServices";
import SeriesBrowser from "./seriesBrowser";

class CopyFromEpad extends React.Component {
  render = () => {
    return (
      <div className="copyFromEpad">
        <ManualEditingForm
          requirements={this.props.requirements}
          treeData={this.props.treeData}
          path={this.props.path}
          onTagInput={this.props.onTagInput}
        />
        <SeriesBrowser />
      </div>
    );
  };
}

export default CopyFromEpad;
