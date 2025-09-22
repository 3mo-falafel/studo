# ============================================================================
# studo-quick-deploy.ps1
# Quick deployment: push local repo to GitHub, update VPS, rebuild, restart PM2
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\studo-quick-deploy.ps1 -Commit "your message"
# Optional params:
#   -VpsIp 31.97.72.28
#   -VpsUser root
#   -RepoUrl https://github.com/3mo-falafel/studo.git
#   -Branch main
#   -AppDir /var/www/jibreel-electrinic
#   -AppName studo-admin
# ============================================================================

param(
    [string]$Commit = "Quick deploy",
    [string]$VpsIp = "31.97.72.28",
    [string]$VpsUser = "root",
    [string]$RepoUrl = "https://github.com/3mo-falafel/studo.git",
    [string]$Branch = "main",
    [string]$AppDir = "/var/www/jibreel-electrinic",
    [string]$AppName = "studo-admin"
)

function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Message) Write-Host "[OK]  $Message" -ForegroundColor Green }
function Write-Warn { param([string]$Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Err  { param([string]$Message) Write-Host "[ERR] $Message" -ForegroundColor Red }

$ErrorActionPreference = 'Stop'

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "    Studo Quick Deploy (PowerShell)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1) Ensure local git repo, commit changes, push to origin
Write-Info "Preparing local repository..."
try {
    if (-not (Test-Path .git)) {
        Write-Warn ".git not found in current directory. Initializing new repo..."
        git init | Out-Null
    }

    # Ensure target branch exists and is checked out
    try { git rev-parse --verify $Branch 2>$null | Out-Null; git checkout $Branch | Out-Null } catch { git checkout -b $Branch | Out-Null }

    $status = git status --porcelain
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        Write-Info "Staging and committing local changes..."
        git add -A | Out-Null
        git commit -m $Commit | Out-Null
        Write-Ok "Committed changes"
    } else {
        Write-Info "No local changes to commit."
    }

    # Set/verify remote
    $remotes = git remote -v
    if ($remotes -notmatch [regex]::Escape($RepoUrl)) {
        try { git remote remove origin 2>$null | Out-Null } catch {}
        git remote add origin $RepoUrl | Out-Null
    }

    Write-Info "Pushing to $RepoUrl ($Branch)..."
    git push -u origin $Branch
    Write-Ok "Push completed"
}
catch {
    Write-Err "Git push failed: $($_.Exception.Message)"
    exit 1
}

# 2) Prepare remote deployment script content
$remoteScript = @'
set -e
REPO_URL="__REPO_URL__"
APP_DIR="__APP_DIR__"
APP_NAME="__APP_NAME__"
BRANCH="__BRANCH__"

# Ensure base tools
if ! command -v git >/dev/null 2>&1; then apt-get update -y && apt-get install -y git; fi
if ! command -v node >/dev/null 2>&1; then curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs; fi
if ! command -v pm2 >/dev/null 2>&1; then npm i -g pm2; fi

mkdir -p /var/www
# If APP_DIR is an absolute path, ensure parent exists and clone there
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/$BRANCH
else
  PARENT_DIR=$(dirname "$APP_DIR")
  BASENAME=$(basename "$APP_DIR")
  mkdir -p "$PARENT_DIR"
  cd "$PARENT_DIR"
  rm -rf "$BASENAME" 2>/dev/null || true
  git clone "$REPO_URL" "$BASENAME"
  cd "$BASENAME"
fi

# Install/build (safe to re-run)
npm install
npx prisma generate || true
npx prisma db push || true
npm run build

# Start or restart via PM2
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  PORT=
  # Preserve configured PORT if present in .env, default to 3002 otherwise
  if [ -f .env ]; then
    PORT=$(awk -F'=' '/^PORT=/{print $2}' .env | tr -d '\r')
  fi
  PORT=${PORT:-3002}
  NODE_ENV=production PORT=$PORT pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save

# Health check
curl -s -o /dev/null -w "HTTP:%{http_code}\n" http://127.0.0.1:${PORT:-3002} || true
'@

# Replace placeholders with actual values
$remoteScript = $remoteScript.Replace('__REPO_URL__', $RepoUrl)
$remoteScript = $remoteScript.Replace('__APP_DIR__', $AppDir)
$remoteScript = $remoteScript.Replace('__APP_NAME__', $AppName)
$remoteScript = $remoteScript.Replace('__BRANCH__', $Branch)

# Write to a local temp file, copy via scp, then run via ssh
$tmp = [System.IO.Path]::GetTempFileName()
Set-Content -LiteralPath $tmp -Value $remoteScript -Encoding ASCII

Write-Info "Deploying to $VpsUser@$VpsIp ... (you may be prompted for the server password)"
try {
    $remoteTarget = "{0}@{1}:/tmp/studo-quick-deploy.sh" -f $VpsUser, $VpsIp
    & scp -o StrictHostKeyChecking=no "$tmp" "$remoteTarget"
    & ssh -o StrictHostKeyChecking=no ("{0}@{1}" -f $VpsUser, $VpsIp) "bash -lc 'bash /tmp/studo-quick-deploy.sh && rm -f /tmp/studo-quick-deploy.sh'"
    Write-Ok "Remote update completed"
}
catch {
    Write-Err "Remote deployment failed: $($_.Exception.Message)"
    exit 1
}
finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
}

Write-Ok "All done. If you use Nginx, reload it if needed: sudo nginx -t && sudo systemctl reload nginx"
