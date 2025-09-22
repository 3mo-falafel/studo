# Quick fix script for deployment issues
$password = "Miskbo@12345"
$server = "root@31.97.72.28"

Write-Host "=== Quick Fix for Deployment Issues ===" -ForegroundColor Cyan

# Create a remote script that will fix everything
$remoteScript = @"
#!/bin/bash
set -e
cd /var/www/jibreel-electrinic

echo "=== Fixing Prisma Client ==="
npx prisma generate

echo "=== Pushing Database Schema ==="
npx prisma db push

echo "=== Rebuilding Application ==="
rm -rf .next
npm run build

echo "=== Restarting PM2 ==="
pm2 restart studo-admin

echo "=== Testing Application ==="
curl -s -o /dev/null -w "HTTP:%{http_code}\n" http://127.0.0.1:3002 || echo "Main app test failed"
curl -s -o /dev/null -w "HTTP:%{http_code}\n" http://127.0.0.1:3002/admin || echo "Admin app test failed"

echo "=== PM2 Status ==="
pm2 status

echo "=== Recent Logs ==="
pm2 logs studo-admin --lines 5
"@

# Write the script to a temporary file
$tempScript = "fix-deployment.sh"
$remoteScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "Uploading fix script to server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no $tempScript "${server}:/tmp/"

Write-Host "Running fix script on server..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no $server "chmod +x /tmp/$tempScript && /tmp/$tempScript"

Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item $tempScript -Force

Write-Host "=== Fix Complete ===" -ForegroundColor Green
Write-Host "Admin URL: http://31.97.72.28:3002/admin" -ForegroundColor Cyan
Write-Host "Username: admin" -ForegroundColor Cyan
Write-Host "Password: Admin123!" -ForegroundColor Cyan
