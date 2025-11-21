# Script to set up GitHub repository and push code
# Run this after creating the repository on GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

$RepoName = "ElizaTrade"
$RemoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "Setting up remote repository..." -ForegroundColor Green
git remote add origin $RemoteUrl

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "Done! Repository is now available at: $RemoteUrl" -ForegroundColor Green

