# TestGo Daily Auto-Sync Script
# Syncs test-related content (excluding prd/ and test-results/) to GitHub
# Runs via Windows Task Scheduler daily

$RepoPath = "D:\ATest\Test\AI\Project\Claude\TestGo"
$LogFile = "$RepoPath\scripts\sync.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Write-Log {
    param([string]$Message)
    "$Timestamp | $Message" | Out-File -Append -FilePath $LogFile -Encoding UTF8
}

Set-Location $RepoPath

# Check if there are any changes (respects .gitignore, so prd/ and test-results/ are excluded)
$status = git status --porcelain
if (-not $status) {
    Write-Log "No changes to sync."
    exit 0
}

Write-Log "Changes detected:"
Write-Log $status

# Stage all tracked changes (respects .gitignore)
git add -A

# Generate commit message with change summary
$added = (git diff --cached --name-only --diff-filter=A | Measure-Object).Count
$modified = (git diff --cached --name-only --diff-filter=M | Measure-Object).Count
$deleted = (git diff --cached --name-only --diff-filter=D | Measure-Object).Count

$parts = @()
if ($added -gt 0) { $parts += "${added} added" }
if ($modified -gt 0) { $parts += "${modified} modified" }
if ($deleted -gt 0) { $parts += "${deleted} deleted" }
$summary = $parts -join ", "

$commitMsg = "daily sync: $summary ($((Get-Date -Format 'yyyy-MM-dd')))"

git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Log "Commit failed."
    exit 1
}

git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Log "Push failed."
    exit 1
}

Write-Log "Sync completed: $commitMsg"
