# VPS Deployment Guide

This guide will help you deploy the e-commerce admin dashboard to your VPS with IP `31.97.72.28`.

## Prerequisites

1. SSH access to your VPS: `ssh root@31.97.72.28`
2. Node.js 18+ installed on the VPS
3. PostgreSQL database installed and configured
4. PM2 (process manager) for production deployment

## Step 1: VPS Setup

```bash
# Connect to your VPS
ssh root@31.97.72.28

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install PostgreSQL (if not already installed)
apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE studo_db;
CREATE USER studo_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE studo_db TO studo_user;
\q
```

## Step 2: Deploy Application

```bash
# Navigate to your web directory
cd /var/www/

# Clone or upload your project
# If uploading via SCP:
# scp -r ./jibreel-electrinic root@31.97.72.28:/var/www/

# Install dependencies
cd jibreel-electrinic
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Update `.env` with:
```env
DATABASE_URL="postgresql://studo_user:your_secure_password@localhost:5432/studo_db"
ADMIN_PASSWORD="your-very-secure-admin-password"
NODE_ENV=production
```

## Step 3: Initialize Database

```bash
# Push database schema
npx prisma db push

# Build the application
npm run build
```

## Step 4: Configure PM2

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'studo-admin',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/jibreel-electrinic',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 5: Configure Nginx (Optional)

Install and configure Nginx as reverse proxy:

```bash
apt install nginx -y
```

Create `/etc/nginx/sites-available/studo-admin`:
```nginx
server {
    listen 80;
    server_name 31.97.72.28;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/studo-admin /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 6: Access Admin Dashboard

1. Open browser and go to: `http://31.97.72.28/admin`
2. Login with:
   - Username: `admin`
   - Password: (the one you set in ADMIN_PASSWORD env variable)

## Troubleshooting

### Common Issues:

1. **Database Connection Error**: Verify DATABASE_URL is correct and PostgreSQL is running
2. **Permission Issues**: Make sure files have proper ownership (`chown -R www-data:www-data /var/www/jibreel-electrinic`)
3. **Port Issues**: Check if port 3000 is available (`netstat -tulpn | grep :3000`)
4. **Build Errors**: Check Node.js version (`node --version`) should be 18+

### Logs:
```bash
# PM2 logs
pm2 logs studo-admin

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Restart Services:
```bash
pm2 restart studo-admin
systemctl restart nginx
systemctl restart postgresql
```

## Security Notes

1. Change default passwords immediately
2. Configure firewall to only allow necessary ports
3. Consider setting up SSL certificate with Let's Encrypt
4. Regularly backup your database
5. Keep system and dependencies updated

## Backup Database

```bash
# Create backup
pg_dump -U studo_user -h localhost studo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U studo_user -h localhost studo_db < backup_file.sql
```