# NovaLink X Poster Backend

This backend application demonstrates generating and posting content to X (formerly Twitter) using OAuth 2.0 with PKCE authentication flow.

## Features

- OAuth 2.0 authentication with PKCE (Proof Key for Code Exchange)
- Post generation with customizable topic, tone, and length
- Direct posting to X/Twitter
- Test endpoint for quick posting
- Browser-based authorization callback handling

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret (optional for PKCE)
REDIRECT_URI=http://localhost:3000/callback
PORT=3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Authentication Flow

#### `GET /auth/url`
Generates an OAuth authorization URL for X authentication.

**Response:**
```json
{
  "url": "https://x.com/i/oauth2/authorize?...",
  "code_verifier": "generated_verifier",
  "state": "random_state"
}
```

#### `GET /callback`
Browser redirect endpoint after X authorization. Displays the authorization code in a user-friendly HTML page.

**Query Parameters:**
- `code` - Authorization code from X
- `state` - State parameter for CSRF protection
- `error` - Error message (if authorization failed)

#### `POST /auth/callback`
Exchanges the authorization code for access tokens.

**Request Body:**
```json
{
  "code": "authorization_code",
  "code_verifier": "verifier_from_auth_url",
  "redirect_uri": "http://localhost:3000/callback" (optional)
}
```

**Response:**
```json
{
  "ok": true,
  "tokens": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 7200
  }
}
```

### Content Generation

#### `POST /generate`
Generates post content based on provided parameters.

**Request Body:**
```json
{
  "topic": "AI in Healthcare",
  "tone": "professional",
  "length": "short"
}
```

**Parameters:**
- `topic` (string): Topic for the post
- `tone` (string): Either "professional" or "casual"
- `length` (string): "short", "medium", or "long"

**Response:**
```json
{
  "post": "About AI in Healthcare: Quick thoughts on AI in Healthcare. (1/13/2026) Comments welcome. #AIinHealthcare"
}
```

### Posting to X

#### `POST /post`
Posts custom text to X. Requires prior authentication.

**Request Body:**
```json
{
  "text": "Your tweet content here"
}
```

**Response:**
```json
{
  "ok": true,
  "result": {
    "data": {
      "id": "tweet_id",
      "text": "Your tweet content here"
    }
  }
}
```

#### `POST /test-post`
Posts a predefined sample message to X. Useful for testing authentication and posting functionality.

**Response:**
```json
{
  "ok": true,
  "message": "Posted successfully!",
  "result": {
    "data": {
      "id": "tweet_id",
      "text": "..."
    }
  }
}
```

### Health Check

#### `GET /`
Returns server status.

**Response:**
```json
{
  "ok": true,
  "msg": "X poster backend running"
}
```

## Authentication Flow Example

1. Call `GET /auth/url` to get the authorization URL and code verifier
2. Open the returned URL in a browser to authorize with X
3. After authorization, X redirects to `/callback` with the authorization code
4. Copy the code from the callback page
5. Send a POST request to `/auth/callback` with the code and code_verifier
6. The server stores the access token in memory
7. Now you can use `/generate`, `/post`, or `/test-post` endpoints

## Project Structure

```
NovaLink_Linkedin/
├── src/
│   ├── server.js      # Main Express server with all endpoints
│   ├── xClient.js     # X API client (token exchange & posting)
│   └── generator.js   # Post content generation logic
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (not in repo)
└── README.md         # This file
```

## Security Notes

⚠️ **Important:** This is a prototype application with the following limitations:

- **In-Memory Token Storage**: Access tokens are stored in memory and will be lost on server restart. For production, implement secure persistent storage (database with encryption).
- **Single User**: Currently supports only one authenticated user at a time. The last authenticated user's tokens will overwrite previous ones.
- **No Token Refresh**: Implement token refresh logic for production use.
- **Environment Variables**: Never commit your `.env` file or expose your client credentials.

## Dependencies

- **express**: Web framework
- **axios**: HTTP client for X API calls
- **cors**: Enable CORS for frontend integration
- **dotenv**: Environment variable management
- **crypto**: Built-in Node.js module for PKCE challenge generation

## Development

For development with auto-reload on file changes:

```bash
npm run dev
```

## API References

- [X API Documentation](https://docs.x.com/)
- [X OAuth 2.0 Guide](https://docs.x.com/fundamentals/authentication/overview)
- [X API v2 Endpoints](https://developer.twitter.com/en/docs/api-reference-index)

## License

ISC
