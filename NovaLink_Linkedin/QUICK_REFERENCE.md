# 🚀 LinkedIn NovaLink - Quick Reference Card

## Server Control

### Start Development Server
```powershell
cd c:\Users\pashi\Downloads\linkedin-novalink
npm run dev
```
**Server URL**: http://localhost:3000

### Build for Production
```powershell
npm run build
npm start
```

---

## Essential API Calls

### 1️⃣ Check if Server is Running
```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

### 2️⃣ Test LinkedIn Connection
```powershell
Invoke-RestMethod http://localhost:3000/api/linkedin/test/connection
```

### 3️⃣ Get Your Profile
```powershell
Invoke-RestMethod http://localhost:3000/api/linkedin/profile
```

### 4️⃣ Post to LinkedIn (Simple)
```powershell
$body = '{"text":"Hello LinkedIn!","visibility":"PUBLIC"}' | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/linkedin/post/text -Method Post -Body $body -ContentType "application/json"
```

### 5️⃣ Share Article
```powershell
$body = @{
    text = "Check this out!"
    articleUrl = "https://example.com"
    articleTitle = "Great Article"
} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/linkedin/post/article -Method Post -Body $body -ContentType "application/json"
```

---

## Complete Test Suite
```powershell
.\test-api.ps1
```

---

## Your LinkedIn Credentials

**Client Name**: NovaLink  
**Client ID**: 784ic7sj8htldg  
**User**: Vishal Dharmini  
**Email**: vishal.d@atyuttama.com  
**Status**: ✅ Active & Connected

---

## All API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Server health |
| `/api/linkedin/test/connection` | GET | Test connection |
| `/api/linkedin/test/post` | POST | Validate post |
| `/api/linkedin/auth/verify` | GET | Verify token |
| `/api/linkedin/auth/refresh` | POST | Refresh token |
| `/api/linkedin/profile` | GET | Get profile |
| `/api/linkedin/post/text` | POST | Text post |
| `/api/linkedin/post/image` | POST | Image post |
| `/api/linkedin/post/article` | POST | Article post |

---

## Troubleshooting

### Server won't start?
```powershell
npm install
npm run build
```

### Token expired?
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/linkedin/auth/refresh -Method Post
```

### See server logs?
Check the terminal where `npm run dev` is running

---

## File Locations

**Configuration**: `.env`  
**Documentation**: `README.md`, `API_TESTING_GUIDE.md`  
**Test Script**: `test-api.ps1`  
**Source Code**: `src/`  
**Postman Collection**: `postman_collection.json`

---

## Next Steps

1. ✅ Server is running - Ready to use!
2. 🧪 Run tests: `.\test-api.ps1`
3. 📮 Post to LinkedIn using the API
4. 📚 Read `API_TESTING_GUIDE.md` for details
5. 🔧 Customize for your needs

---

## Example: Create Your First Post

```powershell
# Simple text post
$post = @{
    text = "🎉 Just integrated LinkedIn API with NovaLink! #API #LinkedIn"
    visibility = "PUBLIC"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/linkedin/post/text `
    -Method Post `
    -Body $post `
    -ContentType "application/json"
```

**Response**: Post ID and confirmation

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Support**: See documentation files in project root

---

*Save this file for quick reference!*
