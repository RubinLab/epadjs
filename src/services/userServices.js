import http from './httpService';
import { apiUrl } from '../config.json';

export async function getUser(username) {
  return http.get(apiUrl + '/users/' + username);
}

export async function getUsers() {
  return http.get(apiUrl + '/users/');
}
