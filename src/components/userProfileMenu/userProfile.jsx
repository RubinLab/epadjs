import React from "react";
import { Modal } from "react-bootstrap";
import { apiUrl } from "../../config.json";
import http from "../../services/httpService";
import { getCurrentUser } from "../../services/authService";
// import "../menuStyle.css";

class About extends React.Component {
  state = { data: {} };
  componentDidMount = () => {
    this.getData();
  };
  getData = () => {
    let user = getCurrentUser();
    const url = apiUrl + "/users/" + user;
    http.get(url).then(res => this.setState({ data: res.data }));
  };

  render = () => {
    return (
      <Modal.Dialog dialogClassName="user-profile__modal">
        <Modal.Header>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="user-profile__mbody">
          <div className="user-profile__desc">{this.state.data.username}</div>
          <div className="user-profile__buttonCont">
            <button className="user-profile__button">Update Password</button>
            <button className="user-profile__button">Update Email</button>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button variant="secondary" onClick={this.props.onOK}>
            OK
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

export default About;
