# PowerShell script to push ElizaTrade to GitHub
# Make sure you've created the repository on GitHub first

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

$RepoName = "ElizaTrade"
$RemoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ElizaTrade GitHub Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -eq "y") {
        git remote set-url origin $RemoteUrl
        Write-Host "Remote updated to: $RemoteUrl" -ForegroundColor Green
    } else {
        Write-Host "Keeping existing remote" -ForegroundColor Yellow
        $RemoteUrl = $existingRemote
    }
} else {
    Write-Host "Adding remote repository..." -ForegroundColor Green
    git remote add origin $RemoteUrl
    Write-Host "Remote added: $RemoteUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Success! Repository pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Repository URL: $RemoteUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error pushing to GitHub" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. The repository 'ElizaTrade' exists on GitHub" -ForegroundColor Yellow
    Write-Host "2. You have push access to the repository" -ForegroundColor Yellow
    Write-Host "3. You're authenticated with GitHub (git credential helper)" -ForegroundColor Yellow
}

