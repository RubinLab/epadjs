import { Component } from "react";
import propTypes from "react-table-v6/lib/propTypes";
import auth from "../services/authService";

class Login extends Component {
  componentDidMount() {
    this.props.login();
  }
  render() {
    return null;
  }
}

export default Login;
