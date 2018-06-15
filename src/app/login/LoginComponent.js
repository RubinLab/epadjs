import React from 'react';
import styles from './login.css';


const LoginComponent = ({createSession}) => {
  console.log(createSession);

  return (
    <div className="card">
    <div className="card-body">
    <form className={styles.formSignin}>
    <h5 className="card-title">Please sign in</h5>
    <label htmlFor="inputEmail" className="sr-only">Email address</label>
    <input type="text" id="inputUser" className="form-control" placeholder="Username" required autoFocus />
    <label htmlFor="inputPassword" className="sr-only">Password</label>
    <input type="password" id="inputPassword" className="form-control" placeholder="Password" required />
    <div className="checkbox mb-3">
      <label>
        <input type="checkbox" value="remember-me" /> I agree to <a color="primary" href="#">Terms and Conditions</a>
      </label>
    </div>
    <button className="btn btn-primary" type="submit" onClick={ () => {createSession('sherylj', '3p4dt3st')}}>Sign in</button>
    <p />
    <a href="#">Forgot Password?</a>
  </form>
  </div>
  </div>
  );
}

export default LoginComponent;