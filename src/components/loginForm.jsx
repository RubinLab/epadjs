import React from 'react';
import Joi from 'joi-browser';
import Form from './common/form';
import auth from '../services/authService';

class LoginForm extends Form {
  constructor(props) {
    super(props);
    this.state = {
      data: { username: '', password: '', agreement: 'false' },
      errors: {},
      modalShow: false,
      passwordShow: false,
      authService: null
    };
  }

  componentDidMount = () => {
    const authService = new auth.AuthService();
    this.setState({ authService });
    authService.signinRedirect({});
  };

  schema = {
    username: Joi.string()
      .required()
      .label('Username'),
    password: Joi.string()
      .required()
      .label('Password'),
    agreement: Joi.boolean()
      .invalid(false)
      .label('Licence Agreement')
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      // deprecated login
      // await auth.login(data.username, data.password);
      window.location = "/";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return <div></div>;
  }
}

export default LoginForm;
