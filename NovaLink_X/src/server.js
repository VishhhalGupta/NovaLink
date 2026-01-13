require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const xClient = require('./xClient');
const { generatePost } = require('./generator');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory token store (for demo/prototype only)
let userTokens = null;

function base64url(buffer) {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateCodeChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

app.get('/auth/url', (req, res) => {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  if (!clientId || !redirectUri) return res.status(500).json({ error: 'Missing X_CLIENT_ID or REDIRECT_URI in env' });

  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = base64url(crypto.randomBytes(16));
  const scope = encodeURIComponent('tweet.read tweet.write users.read offline.access');

  const url = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  res.json({ url, code_verifier: codeVerifier, state });
});

// GET /callback - X redirects here after authorization
app.get('/callback', (req, res) => {
  const { code, state, error } = req.query;
  
  if (error) {
    return res.send(`<h2>Error during authorization</h2><p>${error}</p>`);
  }
  
  if (!code) {
    return res.send('<h2>No code received</h2><p>Authorization may have failed.</p>');
  }
  
  res.send(`
    <h2>Authorization Successful!</h2>
    <p><strong>Your authorization code:</strong></p>
    <pre style="background:#f4f4f4;padding:10px;word-wrap:break-word">${code}</pre>
    <p><strong>State:</strong> ${state}</p>
    <p>Copy the code above and use it in your Postman POST request to <code>/auth/callback</code></p>
  `);
});

app.post('/auth/callback', async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body;
  if (!code || !code_verifier) return res.status(400).json({ error: 'Missing code or code_verifier' });

  try {
    const tokenResp = await xClient.exchangeCodeForToken({
      code,
      codeVerifier: code_verifier,
      redirectUri: redirect_uri || process.env.REDIRECT_URI,
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET
    });
    userTokens = tokenResp;
    res.json({ ok: true, tokens: tokenResp });
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response ? err.response.data : undefined });
  }
});

app.post('/generate', (req, res) => {
  const { topic, tone, length } = req.body;
  try {
    const post = generatePost({ topic, tone, length });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/post', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });
  if (!userTokens || !userTokens.access_token) return res.status(400).json({ error: 'No access token. Authenticate first.' });

  try {
    const resp = await xClient.postTweet(userTokens.access_token, text);
    res.json({ ok: true, result: resp.data });
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response ? err.response.data : undefined });
  }
});

// Test endpoint to post the sample message
app.post('/test-post', async (req, res) => {
  const sampleText = "The most underrated skill in tech isn't coding faster — it's learning faster.\nFrameworks change, languages evolve, tools come and go… but the ability to adapt compounds forever.\n\nBuild systems for learning, not just stacks for shipping. 💡";
  
  if (!userTokens || !userTokens.access_token) {
    return res.status(400).json({ error: 'No access token. Authenticate first via /auth/callback' });
  }

  try {
    const resp = await xClient.postTweet(userTokens.access_token, sampleText);
    res.json({ ok: true, message: 'Posted successfully!', result: resp.data });
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response ? err.response.data : undefined });
  }
});

app.get('/', (req, res) => res.json({ ok: true, msg: 'X poster backend running' }));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
