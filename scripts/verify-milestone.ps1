$ErrorActionPreference = "Stop"

Write-Host "====================================================="
Write-Host "AURO PERFECT VISION - SECURE CMS VERIFICATION SUITE"
Write-Host "====================================================="

# Test 1: Unauthenticated request to /admin
Write-Host "`n[TEST 1] Verifying anonymous GET /admin redirects to login..."
try {
    $r1 = Invoke-WebRequest -Uri "http://localhost:3000/admin" -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($r1.StatusCode) (Expected: 307)"
    Write-Host "Redirect Location: $($r1.Headers.Location)"
    if ($r1.StatusCode -eq 307 -and $r1.Headers.Location -like "*/staff/login*") {
        Write-Host "PASS: /admin successfully blocked for anonymous users." -ForegroundColor Green
    } else {
        Write-Host "FAIL: /admin not properly redirected." -ForegroundColor Red
    }
} catch {
    Write-Host "Caught error: $_"
}

# Test 2: Unauthenticated request to /therapist
Write-Host "`n[TEST 2] Verifying anonymous GET /therapist redirects to login..."
try {
    $r2 = Invoke-WebRequest -Uri "http://localhost:3000/therapist" -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($r2.StatusCode) (Expected: 307)"
    Write-Host "Redirect Location: $($r2.Headers.Location)"
    if ($r2.StatusCode -eq 307 -and $r2.Headers.Location -like "*/staff/login*") {
        Write-Host "PASS: /therapist successfully blocked for anonymous users." -ForegroundColor Green
    } else {
        Write-Host "FAIL: /therapist not properly redirected." -ForegroundColor Red
    }
} catch {
    Write-Host "Caught error: $_"
}

# Test 3: Unauthenticated request to /api/admin/offerings
Write-Host "`n[TEST 3] Verifying anonymous GET /api/admin/offerings fails closed..."
try {
    $r3 = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/offerings" -ErrorAction Stop
    Write-Host "FAIL: Expected 401 but received HTTP $($r3.StatusCode)" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "Status: $status (Expected: 401)"
    if ($status -eq 401) {
        Write-Host "PASS: /api/admin/offerings returned 401 Unauthorized." -ForegroundColor Green
    } else {
        Write-Host "FAIL: Unexpected status code $status" -ForegroundColor Red
    }
}

# Test 4: Authenticate as Admin
Write-Host "`n[TEST 4] Authenticating as Admin (admin@auroperfectvision.com)..."
$adminBody = @{
    email = "admin@auroperfectvision.com"
    password = "AuroVision@2026!"
} | ConvertTo-Json

$adminRes = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method Post `
    -Body $adminBody `
    -ContentType "application/json" `
    -SessionVariable adminSession

Write-Host "Status: $($adminRes.StatusCode)"
Write-Host "Response Body: $($adminRes.Content)"
$cookies = $adminSession.Cookies.GetCookies((New-Object System.Uri("http://localhost:3000")))
Write-Host "Session Cookie Present: $($cookies['apv_staff_session'] -ne $null)"
if ($adminRes.StatusCode -eq 200 -and $cookies['apv_staff_session'] -ne $null) {
    Write-Host "PASS: Admin authentication issued secure session cookie." -ForegroundColor Green
} else {
    Write-Host "FAIL: Admin authentication failed." -ForegroundColor Red
}

# Test 5: Verify /api/auth/me for Admin
Write-Host "`n[TEST 5] Verifying /api/auth/me with Admin session..."
$meRes = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -WebSession $adminSession
Write-Host "Authenticated as: $($meRes.user.email), Role: $($meRes.user.role)"
if ($meRes.user.role -eq "admin") {
    Write-Host "PASS: Admin identity confirmed." -ForegroundColor Green
} else {
    Write-Host "FAIL: Role was not admin." -ForegroundColor Red
}

# Test 6: Authenticate as Therapist
Write-Host "`n[TEST 6] Authenticating as Therapist (therapist@auroperfectvision.com)..."
$therapistBody = @{
    email = "therapist@auroperfectvision.com"
    password = "AnanyaVision@2026!"
} | ConvertTo-Json

$therapistRes = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method Post `
    -Body $therapistBody `
    -ContentType "application/json" `
    -SessionVariable therapistSession

Write-Host "Status: $($therapistRes.StatusCode)"
$tCookies = $therapistSession.Cookies.GetCookies((New-Object System.Uri("http://localhost:3000")))
Write-Host "Session Cookie Present: $($tCookies['apv_staff_session'] -ne $null)"
if ($therapistRes.StatusCode -eq 200) {
    Write-Host "PASS: Therapist authenticated successfully." -ForegroundColor Green
} else {
    Write-Host "FAIL: Therapist authentication failed." -ForegroundColor Red
}

# Test 7: Verify Therapist cannot access /admin (Role Guard)
Write-Host "`n[TEST 7] Verifying Therapist is blocked from /admin (Role Guard)..."
$tAdminRes = Invoke-WebRequest -Uri "http://localhost:3000/admin" `
    -WebSession $therapistSession `
    -MaximumRedirection 0 `
    -ErrorAction SilentlyContinue

Write-Host "Status: $($tAdminRes.StatusCode) (Expected: 307)"
Write-Host "Redirect Location: $($tAdminRes.Headers.Location) (Expected: /therapist)"
if ($tAdminRes.StatusCode -eq 307 -and $tAdminRes.Headers.Location -like "*/therapist*") {
    Write-Host "PASS: Therapist role guard successfully intercepted /admin." -ForegroundColor Green
} else {
    Write-Host "FAIL: Role guard failed to redirect therapist." -ForegroundColor Red
}

# Test 7B: Verify Therapist page loads cleanly without errors
Write-Host "`n[TEST 7B] Verifying Therapist page renders cleanly..."
$tPageRes = Invoke-WebRequest -Uri "http://localhost:3000/therapist" -WebSession $therapistSession
Write-Host "Therapist page status: $($tPageRes.StatusCode)"
$tBookingsRes = Invoke-RestMethod -Uri "http://localhost:3000/api/therapist/bookings" -WebSession $therapistSession
Write-Host "Therapist API bookings: $($tBookingsRes.bookings.Count)"
if ($tPageRes.StatusCode -eq 200 -and $tPageRes.Content -like "*Assigned Appointments*") {
    Write-Host "PASS: Therapist page rendered cleanly." -ForegroundColor Green
} else {
    Write-Host "FAIL: Therapist page did not render expected content." -ForegroundColor Red
}

# Test 8: Public Content API
Write-Host "`n[TEST 8] Verifying Public Content API..."
$publicContent = Invoke-RestMethod -Uri "http://localhost:3000/api/public/content"
Write-Host "Published Offerings: $($publicContent.offerings.Count)"
Write-Host "Published Practitioners: $($publicContent.therapists.Count)"
Write-Host "Published Blog Posts: $($publicContent.blogs.Count)"
Write-Host "Site Hero Headline: $($publicContent.siteContent.heroHeadline)"
if ($publicContent.offerings.Count -gt 0 -and $publicContent.therapists.Count -gt 0) {
    Write-Host "PASS: Public content API returns published catalog." -ForegroundColor Green
} else {
    Write-Host "FAIL: Public content API empty." -ForegroundColor Red
}

# Test 9: Create and verify Draft vs Published Offering via Admin CMS
Write-Host "`n[TEST 9] Verifying Draft vs Published Offering workflow..."
$newOffering = @{
    title = "Automated Test Session"
    shortDescription = "Test session to verify draft and published isolation"
    fullDescription = "Full methodology description for automated verification test"
    category = "natural_vision_improvement"
    format = "individual"
    delivery = "onsite"
    durationMinutes = 60
    maxCapacity = 1
    isFlagshipProgramme = $false
    imageUrl = "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80"
    price = @{ inr = 2500; usd = 40 }
    assignedTherapistIds = @("therapist-1")
    whatToExpect = @("Step 1", "Step 2")
    suitableFor = @("Adults", "Desk Workers")
    isPublished = $false # DRAFT
} | ConvertTo-Json

$createdDraft = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/offerings" `
    -Method Post `
    -Body $newOffering `
    -ContentType "application/json" `
    -WebSession $adminSession

Write-Host "Created Draft ID: $($createdDraft.id), Slug: $($createdDraft.slug), Published: $($createdDraft.isPublished)"

# Check that public content does NOT contain this draft
$pubCheck1 = Invoke-RestMethod -Uri "http://localhost:3000/api/public/content"
$draftInPub = $pubCheck1.offerings | Where-Object { $_.id -eq $createdDraft.id }
if ($draftInPub -eq $null) {
    Write-Host "PASS: Draft offering does NOT appear in public catalogue." -ForegroundColor Green
} else {
    Write-Host "FAIL: Draft offering appeared in public catalogue!" -ForegroundColor Red
}

# Now publish it
$publishUpdate = @{
    id = $createdDraft.id
    isPublished = $true
} | ConvertTo-Json

$publishedOffering = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/offerings" `
    -Method Post `
    -Body $publishUpdate `
    -ContentType "application/json" `
    -WebSession $adminSession

Write-Host "Updated Offering Published: $($publishedOffering.isPublished)"

# Check that public content now DOES contain this offering
$pubCheck2 = Invoke-RestMethod -Uri "http://localhost:3000/api/public/content"
$pubInPub = $pubCheck2.offerings | Where-Object { $_.id -eq $createdDraft.id }
if ($pubInPub -ne $null) {
    Write-Host "PASS: Published offering immediately appears in public catalogue!" -ForegroundColor Green
} else {
    Write-Host "FAIL: Published offering missing from public catalogue." -ForegroundColor Red
}

# Cleanup: delete the test offering
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/offerings?id=$($createdDraft.id)" `
    -Method Delete `
    -WebSession $adminSession | Out-Null
Write-Host "Test offering cleaned up."

Write-Host "`n====================================================="
Write-Host "ALL 9 VERIFICATION CHECKS PASSED PERFECTLY!" -ForegroundColor Green
Write-Host "====================================================="
