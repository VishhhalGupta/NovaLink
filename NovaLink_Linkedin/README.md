# LinkedIn NovaLink Backend API

A robust and production-ready backend API for seamless LinkedIn integration. This Node.js/TypeScript application provides comprehensive LinkedIn OAuth 2.0 authentication and content publishing capabilities, including text posts, images, videos, articles, and organization page management.

---

## 🚀 Features

### Authentication & Authorization
- **OAuth 2.0 Authentication Flow** - Complete LinkedIn OAuth implementation
- **Token Management** - Automatic token refresh and validation
- **Access Token Verification** - Real-time token status checking

### Profile Management
- **User Profile Retrieval** - Get authenticated user's LinkedIn profile information
- **Organization Access** - Fetch and manage user's LinkedIn company pages
- **Organization Validation** - Verify posting permissions for specific organizations

### Content Publishing
- **Text Posts** - Create and publish text-only posts
- **Image Posts** - Share posts with images (URL-based or binary upload)
- **Video Posts** - Upload and share video content (binary upload)
- **Article Sharing** - Share external articles with rich preview
- **Organization Posting** - Post to company/organization pages
- **Visibility Control** - Configure post visibility (PUBLIC, CONNECTIONS)

### Media Upload
- **Binary File Upload** - Direct upload of image and video files
- **Large File Support** - Handles files up to 100MB
- **Multi-part Form Data** - Supports form-based file uploads
- **Automatic Media Registration** - Handles LinkedIn media asset registration

### Security & Performance
- **Rate Limiting** - Protects API from abuse with configurable limits
- **CORS Support** - Cross-origin resource sharing enabled
- **Helmet Security** - HTTP security headers
- **Error Handling** - Comprehensive error handling and logging
- **Request Validation** - Input validation middleware
- **Logging System** - Detailed request and error logging

---

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **LinkedIn Developer Account** - [Create one here](https://www.linkedin.com/developers/)
- **LinkedIn App** - Register your application and obtain API credentials

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd linkedin
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Update the `.env` file with your LinkedIn API credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# LinkedIn API Credentials
LINKEDIN_CLIENT_NAME="NovaLink"
LINKEDIN_CLIENT_ID="your_client_id_here"
LINKEDIN_CLIENT_SECRET="your_client_secret_here"
LINKEDIN_ACCESS_TOKEN="your_access_token_here"
LINKEDIN_REFRESH_TOKEN="your_refresh_token_here"

# LinkedIn API Configuration
LINKEDIN_API_VERSION=v2
LINKEDIN_AUTH_URL=https://www.linkedin.com/oauth/v2
LINKEDIN_API_BASE_URL=https://api.linkedin.com

# Token expiry (in seconds)
ACCESS_TOKEN_EXPIRY=5184000
```

### 4. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Build**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format

All API responses follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔌 API Endpoints

### Health Check

#### Get Health Status
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "status": "OK",
    "timestamp": "2026-01-12T10:30:00.000Z",
    "service": "LinkedIn NovaLink Backend"
  }
}
```

---

### Authentication Endpoints

#### 1. Get Authorization URL
```http
GET /api/linkedin/auth/url
```

**Query Parameters:**
- `redirectUri` (required) - OAuth redirect URI
- `state` (required) - CSRF protection state
- `scope` (optional) - OAuth scopes (default: "openid profile email w_member_social w_organization_social")

**Example:**
```bash
curl "http://localhost:3000/api/linkedin/auth/url?redirectUri=http://localhost:3000/callback&state=random_state_string"
```

#### 2. Handle OAuth Callback
```http
POST /api/linkedin/auth/callback
```

**Body:**
```json
{
  "code": "authorization_code_from_linkedin",
  "redirectUri": "http://localhost:3000/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access token obtained successfully",
  "data": {
    "access_token": "AQV...",
    "expires_in": 5184000,
    "refresh_token": "AQX..."
  }
}
```

#### 3. Refresh Access Token
```http
POST /api/linkedin/auth/refresh
```

**Response:**
```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "access_token": "new_access_token",
    "expires_in": 5184000
  }
}
```

#### 4. Verify Access Token
```http
GET /api/linkedin/auth/verify
```

**Response:**
```json
{
  "success": true,
  "message": "Access token is valid",
  "data": {
    "valid": true
  }
}
```

---

### Profile Endpoints

#### 1. Get User Profile
```http
GET /api/linkedin/profile
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "profilePicture": "https://..."
  }
}
```

#### 2. Get User Organizations
```http
GET /api/linkedin/profile/organizations
```

**Response:**
```json
{
  "success": true,
  "message": "Organizations retrieved successfully",
  "data": [
    {
      "id": "12345678",
      "name": "Company Name",
      "vanityName": "company-name",
      "localizedName": "Company Name"
    }
  ]
}
```

#### 3. Validate Organization Access
```http
GET /api/linkedin/profile/organizations/:organizationId/validate
```

**Example:**
```bash
curl http://localhost:3000/api/linkedin/profile/organizations/12345678/validate
```

---

### Post Endpoints

#### 1. Create Text Post
```http
POST /api/linkedin/post/text
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "text": "Hello LinkedIn! This is my first post via API.",
  "visibility": "PUBLIC",
  "organizationId": "12345678"
}
```

**Parameters:**
- `text` (required) - Post content
- `visibility` (optional) - "PUBLIC" or "CONNECTIONS" (default: "PUBLIC")
- `organizationId` (optional) - Post to organization page instead of personal profile

**Example:**
```bash
curl -X POST http://localhost:3000/api/linkedin/post/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Excited to share this update!",
    "visibility": "PUBLIC"
  }'
```

#### 2. Create Image Post (URL-based)
```http
POST /api/linkedin/post/image
```

**Body:**
```json
{
  "text": "Check out this amazing image!",
  "imageUrl": "https://example.com/image.jpg",
  "imageDescription": "Beautiful sunset",
  "visibility": "PUBLIC",
  "organizationId": "12345678"
}
```

**Parameters:**
- `text` (required) - Post caption
- `imageUrl` (required) - Public URL of the image
- `imageDescription` (optional) - Alt text for the image
- `visibility` (optional) - Post visibility
- `organizationId` (optional) - Organization ID to post to

#### 3. Upload Image Post (Binary)
```http
POST /api/linkedin/post/image/upload
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file, required) - Image file (JPEG, PNG, etc.)
- `text` (string, required) - Post caption
- `mediaDescription` (string, optional) - Image description
- `visibility` (string, optional) - Post visibility
- `organizationId` (string, optional) - Organization ID

**Example:**
```bash
curl -X POST http://localhost:3000/api/linkedin/post/image/upload \
  -F "image=@/path/to/image.jpg" \
  -F "text=Check out this photo!" \
  -F "visibility=PUBLIC" \
  -F "mediaDescription=A beautiful landscape"
```

**PowerShell Example:**
```powershell
curl -X POST http://localhost:3000/api/linkedin/post/image/upload `
  -F "image=@C:\path\to\image.jpg" `
  -F "text=Amazing photo!" `
  -F "visibility=PUBLIC"
```

#### 4. Upload Video Post (Binary)
```http
POST /api/linkedin/post/video/upload
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `video` (file, required) - Video file (MP4, MOV, etc., max 100MB)
- `text` (string, required) - Post caption
- `videoDescription` (string, optional) - Video description
- `visibility` (string, optional) - Post visibility
- `organizationId` (string, optional) - Organization ID

**Example:**
```bash
curl -X POST http://localhost:3000/api/linkedin/post/video/upload \
  -F "video=@/path/to/video.mp4" \
  -F "text=Watch this amazing video!" \
  -F "visibility=PUBLIC" \
  -F "videoDescription=Product demo video"
```

**PowerShell Example:**
```powershell
curl -X POST http://localhost:3000/api/linkedin/post/video/upload `
  -F "video=@C:\path\to\video.mp4" `
  -F "text=Exciting announcement!" `
  -F "visibility=PUBLIC"
```

#### 5. Share Article
```http
POST /api/linkedin/post/article
```

**Body:**
```json
{
  "text": "Great read on industry trends",
  "articleUrl": "https://example.com/article",
  "articleTitle": "The Future of Technology",
  "articleDescription": "An insightful article about...",
  "visibility": "PUBLIC",
  "organizationId": "12345678"
}
```

**Parameters:**
- `text` (required) - Your commentary on the article
- `articleUrl` (required) - URL of the article to share
- `articleTitle` (optional) - Custom title
- `articleDescription` (optional) - Custom description
- `visibility` (optional) - Post visibility
- `organizationId` (optional) - Organization ID

---

## 🔒 Rate Limiting

The API implements rate limiting to prevent abuse:

### API Rate Limits
- **General API**: 100 requests per 15 minutes per IP
- **Post Creation**: 20 requests per hour per IP
- **Authentication**: 5 requests per 15 minutes per IP

Exceeding these limits will result in a `429 Too Many Requests` response.

---

## 🏗️ Project Structure

```
linkedin/
├── src/
│   ├── config/
│   │   └── index.ts                 # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts       # Authentication logic
│   │   ├── profile.controller.ts    # Profile operations
│   │   └── post.controller.ts       # Post creation logic
│   ├── middleware/
│   │   ├── error.middleware.ts      # Error handling
│   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   └── validator.middleware.ts   # Request validation
│   ├── routes/
│   │   ├── auth.routes.ts           # Auth endpoints
│   │   ├── profile.routes.ts        # Profile endpoints
│   │   ├── post.routes.ts           # Post endpoints
│   │   └── index.ts                 # Route aggregation
│   ├── services/
│   │   └── linkedin.service.ts      # LinkedIn API integration
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── utils/
│   │   ├── logger.ts                # Logging utility
│   │   └── response.ts              # Response formatter
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── README.md                        # This file
```

---

## 🧪 Testing the API

### Quick Test Commands

**1. Health Check:**
```bash
curl http://localhost:3000/api/health
```

**2. Get User Profile:**
```bash
curl http://localhost:3000/api/linkedin/profile
```

**3. Create Text Post:**
```bash
curl -X POST http://localhost:3000/api/linkedin/post/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing the API!", "visibility": "PUBLIC"}'
```

**4. Upload Image:**
```bash
curl -X POST http://localhost:3000/api/linkedin/post/image/upload \
  -F "image=@image.jpg" \
  -F "text=Test image post"
```

---

## 🛡️ Security Features

- **Helmet.js** - Sets secure HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Prevents API abuse
- **Environment Variables** - Sensitive data protection
- **Input Validation** - Request payload validation
- **Error Handling** - Secure error messages (no stack traces in production)
- **Token Refresh** - Automatic token renewal

---

## 📦 Technology Stack

- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Language**: TypeScript
- **HTTP Client**: Axios
- **File Upload**: Multer
- **Security**: Helmet, CORS, Express-Rate-Limit
- **Logging**: Custom Logger
- **API**: LinkedIn API v2

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `LINKEDIN_CLIENT_ID` | LinkedIn App Client ID | Yes | - |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn App Client Secret | Yes | - |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn Access Token | Yes | - |
| `LINKEDIN_REFRESH_TOKEN` | LinkedIn Refresh Token | Yes | - |
| `LINKEDIN_API_VERSION` | LinkedIn API version | No | v2 |
| `ACCESS_TOKEN_EXPIRY` | Token expiry in seconds | No | 5184000 |

---

## 🐛 Error Handling

The API uses standardized error responses:

**Common Error Codes:**
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (invalid or expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (endpoint doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (server-side issue)

---

## 📝 Development

### Available Scripts

```bash
# Development mode with hot-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Run tests
npm test
```

### Adding New Features

1. Create service method in `src/services/linkedin.service.ts`
2. Add controller in `src/controllers/`
3. Define route in `src/routes/`
4. Update types in `src/types/index.ts`
5. Test the endpoint

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🆘 Troubleshooting

### Common Issues

**1. "Missing required environment variables" error**
- Ensure `.env` file exists and contains all required variables
- Copy from `.env.example` if needed

**2. "LinkedIn API Error: Unauthorized"**
- Verify your access token is valid
- Try refreshing the token using `/api/linkedin/auth/refresh`
- Check if token has required scopes

**3. File upload fails**
- Ensure file size is under 100MB
- Check `Content-Type` header is `multipart/form-data`
- Verify form field name matches endpoint requirements

**4. Rate limit errors**
- Wait for the rate limit window to reset
- Reduce request frequency
- Consider implementing request queuing

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review LinkedIn API documentation: https://docs.microsoft.com/en-us/linkedin/

---

**Built with ❤️ using Node.js, TypeScript, and the LinkedIn API**
