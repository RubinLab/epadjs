import React, { Component } from "react";
import { connect } from "react-redux";
import SearchView from "./searchView/searchView";
import DisplayView from "./display/displayView";

class RootComponent extends Component {
  render() {
    return (
      <React.Fragment>
        {/* {this.props.display === "display" ? <DisplayView /> : null}
        {this.props.display === "search" ? ( */}
        <DisplayView />
        <SearchView
          key={this.props.match.params.pid}
          pid={this.props.match.params.pid}
        />
        {/* ) : null} */}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    display: state.searchViewReducer.display
  };
};
export default connect(mapStateToProps)(RootComponent);
