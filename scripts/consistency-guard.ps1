param(
  [switch]$RunTypeChecks
)

$ErrorActionPreference = 'Stop'

function Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Pass($msg) { Write-Host "[PASS] $msg" -ForegroundColor Green }
function FailMsg($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red }

$frontendPath = 'E:\fyp\admission-times-frontend'
$backendPath = 'E:\fyp\admission-times-backend'
$mobilePath = 'E:\fyp\AdmissionTimes-MobileApp'

if (-not (Test-Path $frontendPath)) { throw "Frontend path not found: $frontendPath" }

$checks = @(
  @{
    Name = 'Legacy officialLinks direct-only read path'
    Pattern = 'requirements\?\.officialLinks\?\.\[0\]'
    Roots = @("$frontendPath\src", "$mobilePath\src")
    SimpleMatch = $false
  },
  @{
    Name = 'Legacy fee parseFloat write path'
    Pattern = 'application_fee\s*:\s*parseFloat|tuition_fee\s*:\s*parseFloat'
    Roots = @("$frontendPath\src")
    SimpleMatch = $false
  },
  @{
    Name = 'Legacy degree empty fallback (ManageAdmissions)'
    Pattern = "degreeType: existingAdmission?.degreeType || ''"
    Roots = @("$frontendPath\src")
    SimpleMatch = $true
  },
  @{
    Name = 'Legacy parsed location as department in ManageAdmissions'
    Pattern = "department: parsed.location || ''"
    Roots = @("$frontendPath\src")
    SimpleMatch = $true
  }
)

$foundIssues = @()

foreach ($check in $checks) {
  Info "Scanning: $($check.Name)"

  foreach ($root in $check.Roots) {
    if (-not (Test-Path $root)) { continue }

    if ($check.SimpleMatch) {
      $matches = Get-ChildItem -Path $root -Recurse -File -Include *.ts,*.tsx |
        Select-String -Pattern $check.Pattern -SimpleMatch -AllMatches -ErrorAction SilentlyContinue
    } else {
      $matches = Get-ChildItem -Path $root -Recurse -File -Include *.ts,*.tsx |
        Select-String -Pattern $check.Pattern -AllMatches -ErrorAction SilentlyContinue
    }

    foreach ($m in $matches) {
      $foundIssues += [pscustomobject]@{
        Check = $check.Name
        File = $m.Path
        Line = $m.LineNumber
        Snippet = $m.Line.Trim()
      }
    }
  }
}

if ($foundIssues.Count -eq 0) {
  Pass 'No legacy mismatch signatures found.'
} else {
  FailMsg "Found $($foundIssues.Count) potential mismatch signatures:"
  $foundIssues | Format-Table -AutoSize | Out-String | Write-Host
  exit 1
}

if ($RunTypeChecks) {
  Info 'Running frontend type-check'
  Push-Location $frontendPath
  try {
    pnpm -s tsc --noEmit
  } finally {
    Pop-Location
  }

  if (Test-Path $backendPath) {
    Info 'Running backend type-check'
    Push-Location $backendPath
    try {
      pnpm -s tsc --noEmit
    } finally {
      Pop-Location
    }
  }

  if (Test-Path $mobilePath) {
    Info 'Running mobile type-check'
    Push-Location $mobilePath
    try {
      pnpm -s tsc --noEmit
    } finally {
      Pop-Location
    }
  }

  Pass 'All requested type-checks completed.'
}

Pass 'Consistency guard completed successfully.'
