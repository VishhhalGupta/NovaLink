# Organization ID Finder Script
# This script helps you find your LinkedIn organization ID

$baseUrl = "http://localhost:3000"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "LinkedIn Organization ID Finder" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check if API is running
Write-Host "Checking API status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
    Write-Host "✓ API is running" -ForegroundColor Green
} catch {
    Write-Host "✗ API is not running. Please start the server first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Method 1: Try common organization ID patterns" -ForegroundColor Yellow
Write-Host "Testing common ID patterns..." -ForegroundColor Gray

# Try some common patterns
$potentialIds = @("123456789", "987654321", "100000000", "500000000", "800000000", "900000000")
$foundIds = @()

foreach ($id in $potentialIds) {
    Write-Host "  Testing ID: $id" -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile/organizations/$id/validate" -Method Get -ErrorAction Stop
        if ($response.data.hasAccess) {
            Write-Host " ✓ ACCESS GRANTED!" -ForegroundColor Green
            $foundIds += $id
        } else {
            Write-Host " ✗ No access" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Invalid/Non-existent" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Method 2: Manual ID entry" -ForegroundColor Yellow
$manualId = Read-Host "Enter organization ID you found from LinkedIn page (or press Enter to skip)"

if ($manualId) {
    Write-Host "  Testing manual ID: $manualId" -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile/organizations/$manualId/validate" -Method Get -ErrorAction Stop
        if ($response.data.hasAccess) {
            Write-Host " ✓ ACCESS GRANTED!" -ForegroundColor Green
            $foundIds += $manualId
        } else {
            Write-Host " ✗ No access" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Invalid/Non-existent" -ForegroundColor Red
    }
}

Write-Host ""
if ($foundIds.Count -gt 0) {
    Write-Host "SUCCESS: Found $($foundIds.Count) accessible organization(s):" -ForegroundColor Green
    foreach ($id in $foundIds) {
        Write-Host "  - Organization ID: $id" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "You can now use these IDs with the organization posting script!" -ForegroundColor Cyan
    Write-Host "Run: .\post-to-org.ps1" -ForegroundColor Cyan
} else {
    Write-Host "No accessible organizations found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To find your organization ID manually:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://www.linkedin.com/company/novalinktest" -ForegroundColor White
    Write-Host "2. Right-click > View Page Source (Ctrl+U)" -ForegroundColor White
    Write-Host "3. Search for 'organization:' in the source" -ForegroundColor White
    Write-Host "4. Look for: urn:li:organization:123456789" -ForegroundColor White
    Write-Host "5. The number is your organization ID" -ForegroundColor White
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Organization ID Search Complete" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan