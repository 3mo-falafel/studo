# Fix deployment script
$password = "Miskbo@12345"
$server = "root@31.97.72.28"

Write-Host "Fixing deployment issues..."

# Generate Prisma client
Write-Host "Generating Prisma client..."
$prismaCmd = "cd /var/www/jibreel-electrinic && npx prisma generate"
$prismaResult = echo y | plink -ssh -pw $password $server $prismaCmd
Write-Host "Prisma generate result: $prismaResult"

# Push database schema
Write-Host "Pushing database schema..."
$dbPushCmd = "cd /var/www/jibreel-electrinic && npx prisma db push"
$dbPushResult = echo y | plink -ssh -pw $password $server $dbPushCmd
Write-Host "DB push result: $dbPushResult"

# Rebuild application
Write-Host "Rebuilding application..."
$buildCmd = "cd /var/www/jibreel-electrinic && rm -rf .next && npm run build"
$buildResult = echo y | plink -ssh -pw $password $server $buildCmd
Write-Host "Build result: $buildResult"

# Restart PM2
Write-Host "Restarting PM2..."
$restartCmd = "cd /var/www/jibreel-electrinic && pm2 restart studo-admin"
$restartResult = echo y | plink -ssh -pw $password $server $restartCmd
Write-Host "Restart result: $restartResult"

# Test application
Write-Host "Testing application..."
$testCmd = "curl -s -o /dev/null -w 'HTTP:%{http_code}\n' http://127.0.0.1:3002"
$testResult = echo y | plink -ssh -pw $password $server $testCmd
Write-Host "Test result: $testResult"

# Test admin page
Write-Host "Testing admin page..."
$adminTestCmd = "curl -s -o /dev/null -w 'HTTP:%{http_code}\n' http://127.0.0.1:3002/admin"
$adminTestResult = echo y | plink -ssh -pw $password $server $adminTestCmd
Write-Host "Admin test result: $adminTestResult"

Write-Host "Deployment fix completed!"
