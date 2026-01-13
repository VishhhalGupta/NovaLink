# Organization Posting Test Script
# This script helps you post directly to a LinkedIn organization page

$baseUrl = "http://localhost:3000"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "LinkedIn Organization Posting Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if API is running
Write-Host ""
Write-Host "Checking API status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
    Write-Host "✓ API is running" -ForegroundColor Green
} catch {
    Write-Host "✗ API is not running. Please start the server first." -ForegroundColor Red
    exit 1
}

# Get organization ID from user
Write-Host ""
$orgId = Read-Host "Enter your organization ID (numeric ID from LinkedIn page)"

if ([string]::IsNullOrWhiteSpace($orgId)) {
    Write-Host "No organization ID provided. Exiting..." -ForegroundColor Yellow
    exit 1
}

# Validate organization access
Write-Host ""
Write-Host "Validating organization access..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile/organizations/$orgId/validate" -Method Get -ErrorAction Stop
    if ($response.data.hasAccess) {
        Write-Host "✓ Organization access validated!" -ForegroundColor Green
        Write-Host "  Organization ID: $orgId" -ForegroundColor Gray
    } else {
        Write-Host "✗ No access to this organization" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Organization validation failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "This could mean:" -ForegroundColor Yellow
    Write-Host "  - Invalid organization ID" -ForegroundColor Yellow
    Write-Host "  - No admin access to this organization" -ForegroundColor Yellow
    Write-Host "  - Organization doesn't exist" -ForegroundColor Yellow
    exit 1
}

# Get post content
Write-Host ""
$postType = Read-Host "What type of post? (text/image/article)"

switch ($postType.ToLower()) {
    "text" {
        $postText = Read-Host "Enter post text"
        if ([string]::IsNullOrWhiteSpace($postText)) {
            $postText = "Hello from our organization page! Posted via NovaLink API."
        }

        $body = @{
            text = $postText
            organizationId = $orgId
            visibility = "PUBLIC"
        } | ConvertTo-Json

        $endpoint = "$baseUrl/api/linkedin/post/text"
    }
    "image" {
        $imageUrl = Read-Host "Enter image URL"
        if ([string]::IsNullOrWhiteSpace($imageUrl)) {
            Write-Host "No image URL provided. Exiting..." -ForegroundColor Yellow
            exit 1
        }

        $postText = Read-Host "Enter post text (optional)"
        if ([string]::IsNullOrWhiteSpace($postText)) {
            $postText = "Check out this image!"
        }

        $body = @{
            text = $postText
            imageUrl = $imageUrl
            organizationId = $orgId
            visibility = "PUBLIC"
        } | ConvertTo-Json

        $endpoint = "$baseUrl/api/linkedin/post/image"
    }
    "article" {
        $articleUrl = Read-Host "Enter article URL"
        if ([string]::IsNullOrWhiteSpace($articleUrl)) {
            Write-Host "No article URL provided. Exiting..." -ForegroundColor Yellow
            exit 1
        }

        $postText = Read-Host "Enter post text"
        if ([string]::IsNullOrWhiteSpace($postText)) {
            $postText = "Check out this article!"
        }

        $body = @{
            text = $postText
            articleUrl = $articleUrl
            organizationId = $orgId
            visibility = "PUBLIC"
        } | ConvertTo-Json

        $endpoint = "$baseUrl/api/linkedin/post/article"
    }
    default {
        Write-Host "Invalid post type. Using text post..." -ForegroundColor Yellow
        $postText = Read-Host "Enter post text"
        if ([string]::IsNullOrWhiteSpace($postText)) {
            $postText = "Hello from our organization page! Posted via NovaLink API."
        }

        $body = @{
            text = $postText
            organizationId = $orgId
            visibility = "PUBLIC"
        } | ConvertTo-Json

        $endpoint = "$baseUrl/api/linkedin/post/text"
    }
}

# Create the post
Write-Host ""
Write-Host "Creating organization post..." -ForegroundColor Yellow
Write-Host "  Organization ID: $orgId" -ForegroundColor Gray
Write-Host "  Post Type: $postType" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ SUCCESS: Post created successfully!" -ForegroundColor Green
    Write-Host "  Post ID: $($response.data.id)" -ForegroundColor Gray
    Write-Host "  Posted to organization: $orgId" -ForegroundColor Gray
    Write-Host "  View post: https://www.linkedin.com/feed/update/$($response.data.id)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ FAILED: Failed to create post" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red

    # Try to extract more detailed error info
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "  Details: $errorContent" -ForegroundColor Red
    } catch {
        # Ignore if we can't get detailed error
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Organization Posting Complete" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan