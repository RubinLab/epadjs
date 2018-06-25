import React, { Component }from 'react';
import styles from './login.css';
import serializeForm from 'form-serialize';
import TermsModal from './TermsModal';


class LoginComponent extends Component {
  state = {
    agreeTerms: false,
    openTermsModal: false
  }
  handleSubmit = event => {
    event.preventDefault();
    if (!this.state.agreeTerms) {
      window.confirm('Please agree Terms and Conditions');
    }
    const values = serializeForm(this.form, { hash: true});
    this.props.createSession(values.user, values.password);
  }

  handleAgree = () => {
    const agreeTerms = !this.state.agreeTerms;
    this.setState({agreeTerms});
  }

  handlePasswordRecover = () => {
    const values = serializeForm(this.form, { hash: true});
    if (values.user !== '') {
      this.props.recoverPassword(values.user);
    } else {
      window.confirm('Please enter username');
    }
    
  }

  toggleTermsModal = () => {
    this.setState({ openTermsModal: !this.state.openTermsModal });
  }
  
  render() {
    return (
      <div className="card">
      <div className="card-body">
      <form className={styles.formSignin} 
      onSubmit={this.handleSubmit}
      ref={node => (this.form = node)}>
      <h5 className="card-title">Please sign in</h5>
      <label htmlFor="inputEmail" className="sr-only">Email address</label>
      <input name="user" type="text" id="inputUser" className="form-control" placeholder="Username" required autoFocus />
      <label htmlFor="inputPassword" className="sr-only">Password</label>
      <input name="password" type="password" id="inputPassword" className="form-control" placeholder="Password" />
      <div className="checkbox mb-3">
        <label>
          <input type="checkbox" value="remember-me" onClick={this.handleAgree}/> I agree to <a color="primary" href="#" onClick={this.toggleTermsModal}>Terms and Conditions</a>
        </label>
      </div>
      <button className="btn btn-primary" type="submit">Sign in</button>
      <p />
      <a href="#" onClick={this.handlePasswordRecover}>Forgot Password?</a>
    </form>
    <TermsModal show={this.state.openTermsModal} toggle={this.toggleTermsModal} />
    </div>
    </div>
    );
  }
  
}

export default LoginComponent;