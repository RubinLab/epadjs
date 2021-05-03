export const IDENTITY_CONFIG = {
  //   authority: process.env.REACT_APP_AUTH_URL, //(string): The URL of the OIDC provider.
  authority: 'http://bds-c02xf0r0jhd5.local:8899/auth', // "/realms/ePad" add this to end of url
  client_id: 'epad-auth', //
  //   client_id: process.env.REACT_APP_IDENTITY_CLIENT_ID, //(string): Your client application's identifier as registered with the OIDC provider.
  //   redirect_uri: process.env.REACT_APP_REDIRECT_URL, //The URI of your client application to receive a response from the OIDC provider.
  // redirect_uri: 'http://bds-c02xf0r0jhd5.local:3000/*',
  redirect_uri: 'http://bds-c02xf0r0jhd5.local:3000',

  // responseType: 'code token',
  // response_mode:"query",
  response_type: 'code', //(string, default: 'id_token'): The type of response desired from the OIDC provider.
  //   scope: 'openid example.api', //(string, default: 'openid'): The scope being requested from the OIDC provider.
  scope: 'openid profile',
  silent_redirect_uri: 'http://bds-c02xf0r0jhd5.local:3000/*', //(string): The URL for the page containing the code handling the silent renew.
  automaticSilentRenew: true, //(boolean, default: false): Flag to indicate if there should be an automatic attempt to renew the access token prior to its expiration.
  /* --- */
  //   login: process.env.REACT_APP_AUTH_URL + '/login',
  loadUserInfo: true, //(boolean, default: true): Flag to control if additional identity data is loaded from the user info endpoint in order to populate the user's profile.
  //   silent_redirect_uri: process.env.REACT_APP_SILENT_REDIRECT_URL, //(string): The URL for the page containing the code handling the silent renew.
  // post_logout_redirect_uri: 'http://bds-c02xf0r0jhd5.local:3000/*', // (string): The OIDC post-logout redirect URI.
  post_logout_redirect_uri: 'http://bds-c02xf0r0jhd5.local:3000', // (string): The OIDC post-logout redirect URI.
  //   audience: 'https://example.com', //is there a way to specific the audience when making the jwt
  //   grantType: 'password',
  //   webAuthResponseType: 'id_token token'
};

export const METADATA_OIDC = {
  issuer: 'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad',
  authorization_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/auth',
  userinfo_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/userinfo',
  end_session_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/logout',
  jwks_uri:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/certs',
  /* --- */
  //   token_endpoint: process.env.REACT_APP_AUTH_URL + '/connect/token',
  token_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/token',
  // check_session_iframe:
  //   'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/login-status-iframe.html'
  //   check_session_iframe:
  //     process.env.REACT_APP_AUTH_URL + '/connect/checksession',
  //   revocation_endpoint: process.env.REACT_APP_AUTH_URL + '/connect/revocation',
  //   introspection_endpoint: process.env.REACT_APP_AUTH_URL + '/connect/introspect'
};

const setting = {
  issuer: 'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad',
  authorization_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/auth',
  token_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/token',
  token_introspection_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/token/introspect',
  userinfo_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/userinfo',
  end_session_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/logout',
  jwks_uri:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/certs',
  check_session_iframe:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/login-status-iframe.html',
  grant_types_supported: [
    'authorization_code',
    'implicit',
    'refresh_token',
    'password',
    'client_credentials'
  ],
  response_types_supported: [
    'code',
    'none',
    'id_token',
    'token',
    'id_token token',
    'code id_token',
    'code token',
    'code id_token token'
  ],
  subject_types_supported: ['public', 'pairwise'],
  id_token_signing_alg_values_supported: [
    'PS384',
    'ES384',
    'RS384',
    'HS256',
    'HS512',
    'ES256',
    'RS256',
    'HS384',
    'ES512',
    'PS256',
    'PS512',
    'RS512'
  ],
  id_token_encryption_alg_values_supported: ['RSA-OAEP', 'RSA1_5'],
  id_token_encryption_enc_values_supported: ['A128GCM', 'A128CBC-HS256'],
  userinfo_signing_alg_values_supported: [
    'PS384',
    'ES384',
    'RS384',
    'HS256',
    'HS512',
    'ES256',
    'RS256',
    'HS384',
    'ES512',
    'PS256',
    'PS512',
    'RS512',
    'none'
  ],
  request_object_signing_alg_values_supported: [
    'PS384',
    'ES384',
    'RS384',
    'ES256',
    'RS256',
    'ES512',
    'PS256',
    'PS512',
    'RS512',
    'none'
  ],
  response_modes_supported: ['query', 'fragment', 'form_post'],
  registration_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/clients-registrations/openid-connect',
  token_endpoint_auth_methods_supported: [
    'private_key_jwt',
    'client_secret_basic',
    'client_secret_post',
    'client_secret_jwt'
  ],
  token_endpoint_auth_signing_alg_values_supported: ['RS256'],
  claims_supported: [
    'aud',
    'sub',
    'iss',
    'auth_time',
    'name',
    'given_name',
    'family_name',
    'preferred_username',
    'email'
  ],
  claim_types_supported: ['normal'],
  claims_parameter_supported: false,
  scopes_supported: [
    'openid',
    'address',
    'email',
    'microprofile-jwt',
    'offline_access',
    'phone',
    'profile',
    'roles',
    'web-origins'
  ],
  request_parameter_supported: true,
  request_uri_parameter_supported: true,
  code_challenge_methods_supported: ['plain', 'S256'],
  tls_client_certificate_bound_access_tokens: true,
  introspection_endpoint:
    'http://bds-c02xf0r0jhd5.local:8899/auth/realms/ePad/protocol/openid-connect/token/introspect'
};
