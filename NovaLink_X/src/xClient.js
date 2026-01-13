const axios = require('axios');
const qs = require('querystring');

const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWEET_URL = 'https://api.twitter.com/2/tweets';

async function exchangeCodeForToken({ code, codeVerifier, redirectUri, clientId, clientSecret }) {
  const params = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    client_id: clientId
  };

  // If client secret is provided, include it using Basic auth per OAuth2
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  let auth = undefined;
  if (clientSecret) {
    auth = { username: clientId, password: clientSecret };
  }

  const resp = await axios.post(TOKEN_URL, qs.stringify(params), { headers, auth });
  return resp.data;
}

async function postTweet(accessToken, text) {
  const body = { text };
  const headers = { Authorization: `Bearer ${accessToken}` };
  return axios.post(TWEET_URL, body, { headers });
}

module.exports = { exchangeCodeForToken, postTweet };
