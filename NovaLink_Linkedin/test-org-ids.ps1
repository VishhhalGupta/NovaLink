# Test Organization IDs
$baseUrl = "http://localhost:3000"

Write-Host "Testing common organization ID patterns..." -ForegroundColor Yellow

# Test some common patterns
$testIds = @("123456789", "987654321", "111111111", "222222222", "333333333", "444444444", "555555555", "666666666", "777777777", "888888888", "999999999")

foreach ($id in $testIds) {
    Write-Host "Testing ID: $id" -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/linkedin/profile/organizations/$id/validate" -Method Get -ErrorAction Stop
        if ($response.data.hasAccess) {
            Write-Host " ✓ ACCESS GRANTED!" -ForegroundColor Green
            Write-Host "Valid organization ID found: $id" -ForegroundColor Green
            exit 0
        } else {
            Write-Host " ✗ No access" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Invalid" -ForegroundColor Red
    }
}

Write-Host "No valid organization IDs found in common patterns." -ForegroundColor Yellow
Write-Host "Please find your organization ID manually from LinkedIn page source." -ForegroundColor Cyan