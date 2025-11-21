# Quick Start - Push to GitHub

## Step 1: Create GitHub Repository

Go to https://github.com/new and create a new repository:
- **Name**: `ElizaTrade`
- **Visibility**: Public or Private (your choice)
- **DO NOT** check "Initialize with README" (we already have files)

## Step 2: Push Code

Run this PowerShell script (replace YOUR_USERNAME with your GitHub username):

```powershell
.\push-to-github.ps1 -GitHubUsername YOUR_USERNAME
```

Or manually:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/ElizaTrade.git
git push -u origin main
```

## That's it!

Your code will be pushed to: `https://github.com/YOUR_USERNAME/ElizaTrade`

