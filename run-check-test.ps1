param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$JwtToken = "",
  [string]$PdfPath = "",
  [switch]$SkipPdf
)

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Pass($msg) { Write-Host "[PASS] $msg" -ForegroundColor Green }
function WarnMsg($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function FailMsg($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red }

function Test-Health([string]$url) {
  try {
    $resp = Invoke-RestMethod -Uri "$url/health" -Method GET -TimeoutSec 8 -StatusCodeVariable code
    return @{ ok = $true; code = $code; body = $resp }
  } catch {
    return @{ ok = $false; err = $_.Exception.Message }
  }
}

Write-Host "AdmissionTimes check-test" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl"

Step "Checking backend health"
$h = Test-Health -url $BaseUrl
if (-not $h.ok) {
  FailMsg "Backend not reachable at $BaseUrl/health"
  Write-Host $h.err
  Write-Host "Start backend first: pnpm --dir E:\fyp\admission-times-backend dev"
  exit 1
}
Pass "/health returned $($h.code)"

if (-not $JwtToken -or $JwtToken.Trim().Length -eq 0) {
  WarnMsg "No JwtToken provided. Protected endpoint tests skipped."
  Write-Host "Use -JwtToken \"<supabase_access_token>\" for full test."
  exit 0
}

$headers = @{ Authorization = "Bearer $JwtToken" }

Step "Testing GET /api/v1/ai/health"
try {
  $aiHealth = Invoke-RestMethod -Uri "$BaseUrl/api/v1/ai/health" -Method GET -Headers $headers -StatusCodeVariable aiHealthCode
  Pass "/api/v1/ai/health returned $aiHealthCode"
  $aiHealth | ConvertTo-Json -Depth 8
} catch {
  FailMsg "AI health failed"
  Write-Host $_.Exception.Message
  exit 1
}

Step "Testing POST /api/v1/ai/chat"
$chatBody = @{
  message = "CS admissions in Karachi"
  conversation_context = "Student Dashboard"
} | ConvertTo-Json

try {
  $chat = Invoke-RestMethod -Uri "$BaseUrl/api/v1/ai/chat" -Method POST -Headers $headers -ContentType "application/json" -Body $chatBody -StatusCodeVariable chatCode
  Pass "/api/v1/ai/chat returned $chatCode"
  $chat | ConvertTo-Json -Depth 10
} catch {
  FailMsg "AI chat failed"
  Write-Host $_.Exception.Message
  exit 1
}

if ($SkipPdf) {
  WarnMsg "Skipping PDF test (-SkipPdf used)."
  Pass "Done"
  exit 0
}

if (-not $PdfPath -or $PdfPath.Trim().Length -eq 0) {
  WarnMsg "PDF test skipped. Provide -PdfPath to test /api/v1/admissions/parse-pdf."
  Pass "Done with partial coverage"
  exit 0
}

if (-not (Test-Path -LiteralPath $PdfPath)) {
  FailMsg "PDF file not found: $PdfPath"
  exit 1
}

Step "Testing POST /api/v1/admissions/parse-pdf"
$fileBytes = [System.IO.File]::ReadAllBytes($PdfPath)
$fileName = [System.IO.Path]::GetFileName($PdfPath)
$boundary = [System.Guid]::NewGuid().ToString()
$lf = "`r`n"

$head = (
  "--$boundary",
  "Content-Disposition: form-data; name=\"file\"; filename=\"$fileName\"",
  "Content-Type: application/pdf",
  "",
  ""
) -join $lf
$tail = ("", "--$boundary--", "") -join $lf

$headBytes = [System.Text.Encoding]::UTF8.GetBytes($head)
$tailBytes = [System.Text.Encoding]::UTF8.GetBytes($tail)

$ms = New-Object System.IO.MemoryStream
$ms.Write($headBytes, 0, $headBytes.Length)
$ms.Write($fileBytes, 0, $fileBytes.Length)
$ms.Write($tailBytes, 0, $tailBytes.Length)
$bodyBytes = $ms.ToArray()
$ms.Dispose()

$uploadHeaders = @{
  Authorization = "Bearer $JwtToken"
  "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
  $pdfResp = Invoke-RestMethod -Uri "$BaseUrl/api/v1/admissions/parse-pdf" -Method POST -Headers $uploadHeaders -Body $bodyBytes -StatusCodeVariable pdfCode
  Pass "/api/v1/admissions/parse-pdf returned $pdfCode"
  $pdfResp | ConvertTo-Json -Depth 10
} catch {
  FailMsg "PDF parse test failed"
  Write-Host $_.Exception.Message
  exit 1
}

Pass "All checks completed"
