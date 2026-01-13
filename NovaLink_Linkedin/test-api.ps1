# LinkedIn API Test Script
# This script tests all the endpoints sequentially

$baseUrl = "http://localhost:3000"

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "LinkedIn NovaLink API Test Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host ""
Write-Host "[1/7] Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
    Write-Host "SUCCESS: Health check passed" -ForegroundColor Green
    Write-Host "  Status: $($response.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Health check failed" -ForegroundColor Red
    exit 1
}

# Test 2: Connection Test
Write-Host ""
Write-Host "[2/7] Testing LinkedIn API Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/test/connection" -Method Get -ErrorAction Stop
    if ($response.data.connected) {
        Write-Host "SUCCESS: LinkedIn connection successful" -ForegroundColor Green
        Write-Host "  User: $($response.data.profile.firstName) $($response.data.profile.lastName)" -ForegroundColor Gray
    } else {
        Write-Host "FAILED: LinkedIn connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED: Connection test failed" -ForegroundColor Red
    Write-Host "  Please check your access token in .env file" -ForegroundColor Yellow
}

# Test 3: Verify Token
Write-Host ""
Write-Host "[3/7] Verifying Access Token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/auth/verify" -Method Get -ErrorAction Stop
    if ($response.data.valid) {
        Write-Host "SUCCESS: Access token is valid" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Access token is invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED: Token verification failed" -ForegroundColor Red
}

# Test 4: Get Profile
Write-Host ""
Write-Host "[4/7] Getting LinkedIn Profile..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile" -Method Get -ErrorAction Stop
    Write-Host "SUCCESS: Profile retrieved successfully" -ForegroundColor Green
    Write-Host "  Name: $($response.data.firstName) $($response.data.lastName)" -ForegroundColor Gray
    Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
    Write-Host "  ID: $($response.data.id)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Failed to get profile" -ForegroundColor Red
}

# Test 5: Test Post (Dry Run)
Write-Host ""
Write-Host "[5/7] Testing Post Creation (Dry Run)..." -ForegroundColor Yellow
try {
    $body = @{
        text = "This is a test post from NovaLink API! (Test Mode - Not Posted)"
        type = "text"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/test/post" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "SUCCESS: Post validation successful" -ForegroundColor Green
    Write-Host "  Status: $($response.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Post test failed" -ForegroundColor Red
}

# Test 6: Ask before creating real post
Write-Host ""
Write-Host "[6/7] Create Real LinkedIn Post?" -ForegroundColor Yellow
$createPost = Read-Host "Do you want to create a real post on LinkedIn? (yes/no)"

if ($createPost -eq "yes") {
    try {
        $postText = Read-Host "Enter post text (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($postText)) {
            $postText = "Hello LinkedIn! Testing the NovaLink API integration."
        }

        $body = @{
            text = $postText
            visibility = "PUBLIC"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/post/text" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "SUCCESS: Post created successfully!" -ForegroundColor Green
        Write-Host "  Post ID: $($response.data.id)" -ForegroundColor Gray
    } catch {
        Write-Host "FAILED: Failed to create post" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  Skipped real post creation" -ForegroundColor Gray
}

# Test 7: Ask before sharing article
Write-Host ""
Write-Host "[7/7] Share Article on LinkedIn?" -ForegroundColor Yellow
$shareArticle = Read-Host "Do you want to share an article on LinkedIn? (yes/no)"

if ($shareArticle -eq "yes") {
    try {
        $articleUrl = Read-Host "Enter article URL (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($articleUrl)) {
            $articleUrl = "https://www.linkedin.com"
        }

        $body = @{
            text = "Check out this interesting article!"
            articleUrl = $articleUrl
            articleTitle = "Shared via NovaLink API"
            articleDescription = "Testing article sharing functionality"
            visibility = "PUBLIC"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/post/article" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "SUCCESS: Article shared successfully!" -ForegroundColor Green
        Write-Host "  Post ID: $($response.data.id)" -ForegroundColor Gray
    } catch {
        Write-Host "FAILED: Failed to share article" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  Skipped article sharing" -ForegroundColor Gray
}

# Test 8: Get Organizations
Write-Host ""
Write-Host "[8/8] Getting User Organizations..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile/organizations" -Method Get -ErrorAction Stop
    Write-Host "SUCCESS: Organizations retrieved" -ForegroundColor Green
    if ($response.data.organizations.Count -gt 0) {
        Write-Host "  Found $($response.data.organizations.Count) organizations:" -ForegroundColor Gray
        foreach ($org in $response.data.organizations) {
            Write-Host "  - $($org.name) (ID: $($org.id))" -ForegroundColor Gray
        }
    } else {
        Write-Host "  No organizations found (you may not have admin access to any business pages)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAILED: Failed to get organizations" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}

# Test 9: Organization Posting
Write-Host ""
Write-Host "[9/9] Test Organization Posting?" -ForegroundColor Yellow
$testOrgPost = Read-Host "Do you want to test posting to an organization? (yes/no)"

if ($testOrgPost -eq "yes") {
    $orgId = Read-Host "Enter organization ID (from LinkedIn page source or validation)"

    if (-not [string]::IsNullOrWhiteSpace($orgId)) {
        # First validate organization access
        Write-Host "  Validating organization access..." -ForegroundColor Gray
        try {
            $validateResponse = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile/organizations/$orgId/validate" -Method Get -ErrorAction Stop
            if ($validateResponse.data.hasAccess) {
                Write-Host "  SUCCESS: Organization access validated" -ForegroundColor Green

                # Now try to post
                $orgPostText = Read-Host "Enter post text for organization (or press Enter for default)"
                if ([string]::IsNullOrWhiteSpace($orgPostText)) {
                    $orgPostText = "Hello from our business page! Testing NovaLink organization posting."
                }

                $body = @{
                    text = $orgPostText
                    organizationId = $orgId
                    visibility = "PUBLIC"
                } | ConvertTo-Json

                $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/post/text" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
                Write-Host "SUCCESS: Organization post created successfully!" -ForegroundColor Green
                Write-Host "  Post ID: $($response.data.id)" -ForegroundColor Gray
                Write-Host "  Posted to organization: $orgId" -ForegroundColor Gray
            } else {
                Write-Host "  FAILED: No access to organization $orgId" -ForegroundColor Red
            }
        } catch {
            Write-Host "  FAILED: Organization validation failed" -ForegroundColor Red
            Write-Host "  Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  Skipped organization posting (no ID provided)" -ForegroundColor Gray
    }
} else {
    Write-Host "  Skipped organization posting test" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
