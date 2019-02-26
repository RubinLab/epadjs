import React, { Component } from "react";
import Subjects from "./subjects";

class SearchView extends Component {
  state = {};
  render() {
    return (
      <Subjects
        key={this.props.match.params.pid}
        pid={this.props.match.params.pid}
      />
    );
  }
}

export default SearchView;
