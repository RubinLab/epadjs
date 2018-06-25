const config = require('../../config');
import { Base64 } from 'js-base64';
import { CREATE_SESSION_BEGIN, CREATE_SESSION_SUCCESS, CREATE_SESSION_FAILURE,
RECOVER_PASSWORD_BEGIN, RECOVER_PASSWORD_SUCCESS, RECOVER_PASSWORD_FAILURE} from './types.js';
import { connect } from 'react-redux';

export function createSession(username, password) {
  return dispatch => {
    dispatch(createSessionBegin());
    var request = new Request(`${config.host}/epad/session/`, {
      method: 'POST',
      headers: new Headers({
        'Authorization': 'Basic ' + Base64.encode(username + ':' + password)
      })
    });
    return fetch(request)
    .then(handleErrors)
    .then(res => {
      return res.text();
    })
    .then(text => {
      dispatch(createSessionSuccess(text));
    })
    .catch(error => dispatch(createSessionFailure(error)));
  };
}

export function recoverPassword(username) {
  return dispatch => {
    dispatch(recoverPasswordBegin());
    const encodeUser = encodeURI(username);
    var request = new Request(`${config.host}/epad/v2/users/${encodeUser}/sendnewpassword/`, {
      method: 'PUT'
    });
    return fetch(request)
    .then(handleErrors)
    .then(res => {
      return res.text();
    })
    .then(text => {
      window.confirm('Please check email for changing password');
      dispatch(recoverPasswordSuccess(text));
    })
    .catch(error => dispatch(recoverPasswordFailure(error)));
  };
}

// Handle HTTP errors since fetch doesn't handle it
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export const createSessionBegin = () => ({
  type: CREATE_SESSION_BEGIN
});

export const createSessionSuccess = token => ({
  type: CREATE_SESSION_SUCCESS,
  payload: { token }
});

export const createSessionFailure = error => ({
  type: CREATE_SESSION_FAILURE,
  payload: { error }
});

export const recoverPasswordBegin = () => ({
  type: RECOVER_PASSWORD_BEGIN
});

export const recoverPasswordSuccess = text => ({
  type: RECOVER_PASSWORD_SUCCESS,
  payload: { text }
});

export const recoverPasswordFailure = error => ({
  type: RECOVER_PASSWORD_FAILURE,
  payload: { error }
});