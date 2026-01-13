# Simple Organization ID Finder
$baseUrl = "http://localhost:3000"

Write-Host "Finding your LinkedIn organization ID..." -ForegroundColor Cyan

# Check API
try {
    Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get | Out-Null
    Write-Host "API is running ✓" -ForegroundColor Green
} catch {
    Write-Host "API not running ✗" -ForegroundColor Red
    exit 1
}

# Get manual ID
$orgId = Read-Host "Enter organization ID from LinkedIn page source"

if ($orgId) {
    Write-Host "Testing organization ID: $orgId" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile/organizations/$orgId/validate" -Method Get
        if ($response.data.hasAccess) {
            Write-Host "SUCCESS: Organization access granted!" -ForegroundColor Green
            Write-Host "You can now post to organization $orgId" -ForegroundColor Green
            Write-Host "Run: .\post-to-org.ps1" -ForegroundColor Cyan
        } else {
            Write-Host "No access to this organization" -ForegroundColor Red
        }
    } catch {
        Write-Host "Invalid organization ID or no access" -ForegroundColor Red
    }
} else {
    Write-Host 'No ID provided. Find it from LinkedIn page source.' -ForegroundColor Yellow
}