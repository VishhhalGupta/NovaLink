# Quick Start Commands

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```

## Testing Endpoints

### 1. Check if server is running
```bash
curl http://localhost:3000/api/health
```

### 2. Test LinkedIn connection
```bash
curl http://localhost:3000/api/linkedin/test/connection
```

### 3. Verify your access token
```bash
curl http://localhost:3000/api/linkedin/auth/verify
```

### 4. Get your LinkedIn profile
```bash
curl http://localhost:3000/api/linkedin/profile
```

### 5. Test post creation (dry run - won't actually post)
```bash
curl -X POST http://localhost:3000/api/linkedin/test/post \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test!", "type": "text"}'
```

### 6. Create a real LinkedIn post
```bash
curl -X POST http://localhost:3000/api/linkedin/post/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from NovaLink API!", "visibility": "PUBLIC"}'
```

### 7. Share an article on LinkedIn
```bash
curl -X POST http://localhost:3000/api/linkedin/post/article \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Check this out!",
    "articleUrl": "https://example.com",
    "articleTitle": "Great Article",
    "visibility": "PUBLIC"
  }'
```

## PowerShell (Windows) Examples

### Test connection
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/linkedin/test/connection -Method Get
```

### Create a post
```powershell
$body = @{
    text = "Hello from PowerShell!"
    visibility = "PUBLIC"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/linkedin/post/text -Method Post -Body $body -ContentType "application/json"
```
