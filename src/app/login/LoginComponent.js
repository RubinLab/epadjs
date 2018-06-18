import React, { Component }from 'react';
import styles from './login.css';
import serializeForm from 'form-serialize';


class LoginComponent extends Component {

  handleSubmit = event => {
    event.preventDefault();
    console.log('hi');
    console.log(this.form);
    const values = serializeForm(this.form, { hash: true});
    this.props.createSession(values.user, values.password);
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
      <input name="password" type="password" id="inputPassword" className="form-control" placeholder="Password" required />
      <div className="checkbox mb-3">
        <label>
          <input type="checkbox" value="remember-me" /> I agree to <a color="primary" href="#">Terms and Conditions</a>
        </label>
      </div>
      <button className="btn btn-primary" type="submit">Sign in</button>
      <p />
      <a href="#">Forgot Password?</a>
    </form>
    </div>
    </div>
    );
  }
  
}

export default LoginComponent;