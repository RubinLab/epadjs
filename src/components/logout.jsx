import { Component } from "react";
import propTypes from "react-table-v6/lib/propTypes";
import auth from "../services/authService";

class Logout extends Component {
  componentDidMount() {
    this.props.logout();
  }
  render() {
    return null;
  }
}

export default Logout;
