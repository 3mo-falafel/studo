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
