import React, { Component } from "react";
import Subjects from "./subjects";
import Toolbar from "./toolbar";
import { createDirectory } from "./downloadActions";
import "./searchView.css";

class SearchView extends Component {
  state = {};
  render() {
    return (
      <>
        <Toolbar onDownload={createDirectory} />
        <Subjects
          key={this.props.match.params.pid}
          pid={this.props.match.params.pid}
        />
      </>
    );
  }
}

export default SearchView;
