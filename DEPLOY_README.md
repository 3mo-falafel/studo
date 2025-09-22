# 🚀 One-Click VPS Deployment

This repository includes automated deployment scripts that will deploy your enhanced e-commerce admin dashboard to your VPS at `31.97.72.28` with a single command.

## 📋 Quick Deployment

### Option 1: Linux/Mac (Bash Script)
```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Option 2: Windows (PowerShell Script)
```powershell
# Run the deployment
.\deploy.ps1
```

## ✅ What the Script Does

The deployment script automatically:

1. **System Setup**
   - Updates VPS packages
   - Installs Node.js 18+ if needed
   - Installs PM2 process manager
   - Installs PostgreSQL database

2. **Database Configuration**
   - Creates `studo_db` database
   - Creates `studo_user` with secure password
   - Sets up proper permissions

3. **Application Deployment**
   - Clones latest code from GitHub
   - Installs dependencies
   - Configures environment variables
   - Runs database migrations
   - Builds production application

4. **Production Setup**
   - Starts app with PM2
   - Configures Nginx reverse proxy
   - Sets up firewall rules
   - Creates proper file permissions

5. **Security Configuration**
   - Generates secure admin password
   - Configures production environment
   - Sets up proper user permissions
   - Enables firewall protection

## 🔑 Access Information

After deployment, you'll receive:
- **Website URL**: `http://31.97.72.28`
- **Admin Dashboard**: `http://31.97.72.28/admin`
- **Admin Username**: `admin`
- **Admin Password**: (Auto-generated secure password)

## 📊 Post-Deployment Commands

### View Application Logs
```bash
ssh root@31.97.72.28 'pm2 logs studo-admin'
```

### Restart Application
```bash
ssh root@31.97.72.28 'pm2 restart studo-admin'
```

### Update Application (Re-run deployment)
```bash
./deploy.sh  # or .\deploy.ps1 on Windows
```

### Monitor Application Status
```bash
ssh root@31.97.72.28 'pm2 status'
```

## 🛠️ Manual Commands (if needed)

### Database Operations
```bash
# Connect to database
ssh root@31.97.72.28 'sudo -u postgres psql -d studo_db'

# Backup database
ssh root@31.97.72.28 'pg_dump -U studo_user -h localhost studo_db > backup.sql'

# View database tables
ssh root@31.97.72.28 'sudo -u postgres psql -d studo_db -c "\dt"'
```

### Nginx Operations
```bash
# Check Nginx status
ssh root@31.97.72.28 'systemctl status nginx'

# Reload Nginx configuration
ssh root@31.97.72.28 'systemctl reload nginx'

# View Nginx logs
ssh root@31.97.72.28 'tail -f /var/log/nginx/error.log'
```

### File Operations
```bash
# View application files
ssh root@31.97.72.28 'ls -la /var/www/jibreel-electrinic'

# Check environment variables
ssh root@31.97.72.28 'cat /var/www/jibreel-electrinic/.env'

# View upload directory
ssh root@31.97.72.28 'ls -la /var/www/jibreel-electrinic/public/uploads'
```

## 🔧 Prerequisites

Before running the deployment script, ensure:

1. **SSH Access**: You can connect to your VPS
   ```bash
   ssh root@31.97.72.28
   ```

2. **Git Repository**: Latest changes are pushed to GitHub

3. **Local Tools**: SSH client available on your machine
   - Linux/Mac: SSH is pre-installed
   - Windows: OpenSSH via Settings > Apps > Optional Features

## 🚨 Troubleshooting

### Common Issues and Solutions

**SSH Connection Failed**
```bash
# Test SSH connection manually
ssh root@31.97.72.28
```

**Database Connection Error**
```bash
# Check PostgreSQL status
ssh root@31.97.72.28 'systemctl status postgresql'
```

**Application Not Starting**
```bash
# Check PM2 logs for errors
ssh root@31.97.72.28 'pm2 logs studo-admin'
```

**Nginx 502 Error**
```bash
# Check if app is running on port 3000
ssh root@31.97.72.28 'netstat -tulpn | grep :3000'
```

**Permission Denied on Uploads**
```bash
# Fix upload permissions
ssh root@31.97.72.28 'chmod -R 777 /var/www/jibreel-electrinic/public/uploads'
```

## 🔄 Re-deployment

To update your application with new changes:

1. Push your changes to GitHub
2. Run the deployment script again
3. The script will automatically update the application

## 🎯 Next Steps After Deployment

1. **Test Admin Dashboard**
   - Visit `http://31.97.72.28/admin`
   - Login with provided credentials
   - Test all functionality

2. **Add Content**
   - Create product categories
   - Add your first products
   - Upload product images
   - Create promotional banners

3. **Configure for Production**
   - Set up SSL certificate (Let's Encrypt recommended)
   - Configure domain name (if applicable)
   - Set up regular backups
   - Monitor application performance

4. **Security Hardening**
   - Change default passwords
   - Configure additional firewall rules
   - Set up monitoring and alerts
   - Regular security updates

## 📞 Support

If you encounter any issues during deployment:

1. Check the script output for error messages
2. Review the troubleshooting section above
3. Check application logs using the provided commands
4. Ensure all prerequisites are met

The deployment script is designed to be robust and handle most common scenarios automatically.