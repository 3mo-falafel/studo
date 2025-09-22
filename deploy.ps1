# =============================================================================
# VPS Deployment Script for Jibreel Electronic E-commerce Admin Dashboard
# PowerShell Version for Windows
# =============================================================================
# 
# This script automatically deploys the enhanced admin dashboard from GitHub
# to your VPS at 31.97.72.28
#
# Usage: .\deploy.ps1
# 
# Prerequisites:
# - SSH client available (OpenSSH or PuTTY)
# - PowerShell 5.1 or higher
#
# =============================================================================

param(
    [string]$VpsIp = "31.97.72.28",
    [string]$VpsUser = "root",
    [string]$AppName = "studo-admin"
)

# Configuration
$RepoUrl = "https://github.com/3mo-falafel/jibreel-electrinic.git"
$AppDir = "/var/www/jibreel-electrinic"
$DomainOrIp = $VpsIp

# Colors for output
function Write-ColorText {
    param(
        [string]$Text,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    Write-Host $Text -ForegroundColor $Color
}

function Write-Info { param([string]$Message) Write-ColorText "[INFO] $Message" -Color Cyan }
function Write-Success { param([string]$Message) Write-ColorText "[SUCCESS] $Message" -Color Green }
function Write-Warning { param([string]$Message) Write-ColorText "[WARNING] $Message" -Color Yellow }
function Write-Error { param([string]$Message) Write-ColorText "[ERROR] $Message" -Color Red }
function Write-Step { param([string]$Message) Write-ColorText "`n=== $Message ===" -Color Yellow }

# Function to run SSH commands
function Invoke-SshCommand {
    param([string]$Command)
    
    try {
        $result = ssh -o StrictHostKeyChecking=no "$VpsUser@$VpsIp" $Command
        if ($LASTEXITCODE -ne 0) {
            throw "SSH command failed with exit code $LASTEXITCODE"
        }
        return $result
    }
    catch {
        Write-Error "Failed to execute SSH command: $Command"
        throw $_
    }
}

# Main deployment function
function Start-Deployment {
    try {
        Write-Step "Starting VPS Deployment"
        
        # Test SSH connection
        Write-Info "Testing SSH connection to $VpsIp..."
        try {
            $null = Invoke-SshCommand "echo 'SSH connection successful'"
            Write-Success "SSH connection established"
        }
        catch {
            Write-Error "Cannot connect to VPS. Please check your SSH access."
            Write-Info "Make sure you can run: ssh $VpsUser@$VpsIp"
            exit 1
        }
        
        # Update system packages
        Write-Step "Updating System Packages"
        Invoke-SshCommand "apt update && apt upgrade -y"
        Write-Success "System packages updated"
        
        # Install Node.js if not installed
        Write-Step "Checking Node.js Installation"
        try {
            $nodeVersion = Invoke-SshCommand "node --version 2>/dev/null || echo 'not_installed'"
            if ($nodeVersion -eq "not_installed") {
                Write-Info "Installing Node.js 18..."
                Invoke-SshCommand "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
                Invoke-SshCommand "apt-get install -y nodejs"
                Write-Success "Node.js installed"
            }
            else {
                Write-Success "Node.js already installed: $nodeVersion"
            }
        }
        catch {
            Write-Warning "Could not verify Node.js installation"
        }
        
        # Install PM2 if not installed
        Write-Step "Checking PM2 Installation"
        try {
            $pm2Version = Invoke-SshCommand "pm2 --version 2>/dev/null || echo 'not_installed'"
            if ($pm2Version -eq "not_installed") {
                Write-Info "Installing PM2..."
                Invoke-SshCommand "npm install -g pm2"
                Write-Success "PM2 installed"
            }
            else {
                Write-Success "PM2 already installed: $pm2Version"
            }
        }
        catch {
            Write-Warning "Could not verify PM2 installation"
        }
        
        # Install PostgreSQL if not installed
        Write-Step "Checking PostgreSQL Installation"
        try {
            $psqlVersion = Invoke-SshCommand "psql --version 2>/dev/null || echo 'not_installed'"
            if ($psqlVersion -eq "not_installed") {
                Write-Info "Installing PostgreSQL..."
                Invoke-SshCommand "apt install -y postgresql postgresql-contrib"
                Invoke-SshCommand "systemctl start postgresql"
                Invoke-SshCommand "systemctl enable postgresql"
                Write-Success "PostgreSQL installed and started"
                
                # Create database and user
                Write-Info "Setting up database..."
                Invoke-SshCommand "sudo -u postgres psql -c `"CREATE DATABASE studo_db;`" || true"
                Invoke-SshCommand "sudo -u postgres psql -c `"CREATE USER studo_user WITH ENCRYPTED PASSWORD 'StrongPassword123!';`" || true"
                Invoke-SshCommand "sudo -u postgres psql -c `"GRANT ALL PRIVILEGES ON DATABASE studo_db TO studo_user;`" || true"
                Invoke-SshCommand "sudo -u postgres psql -c `"ALTER USER studo_user CREATEDB;`" || true"
                Write-Success "Database setup completed"
            }
            else {
                Write-Success "PostgreSQL already installed: $psqlVersion"
            }
        }
        catch {
            Write-Warning "Could not verify PostgreSQL installation"
        }
        
        # Create application directory
        Write-Step "Setting Up Application Directory"
        Invoke-SshCommand "mkdir -p $AppDir"
        Invoke-SshCommand "mkdir -p $AppDir/logs"
        Write-Success "Application directory created"
        
        # Clone or update repository
        Write-Step "Deploying Application Code"
        try {
            Invoke-SshCommand "[ -d '$AppDir/.git' ]"
            Write-Info "Updating existing repository..."
            Invoke-SshCommand "cd $AppDir && git fetch origin && git reset --hard origin/master"
        }
        catch {
            Write-Info "Cloning repository..."
            Invoke-SshCommand "cd /var/www && rm -rf jibreel-electrinic || true"
            Invoke-SshCommand "cd /var/www && git clone $RepoUrl"
        }
        Write-Success "Code deployed successfully"
        
        # Install dependencies
        Write-Step "Installing Dependencies"
        Invoke-SshCommand "cd $AppDir && npm install --production"
        Write-Success "Dependencies installed"
        
        # Create environment file
        Write-Step "Configuring Environment"
        Invoke-SshCommand "cd $AppDir && cp .env.example .env"
        
        # Update environment variables
        Write-Info "Setting up environment variables..."
        $timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
        Invoke-SshCommand "cd $AppDir && sed -i 's|DATABASE_URL=.*|DATABASE_URL=`"postgresql://studo_user:StrongPassword123!@localhost:5432/studo_db`"|' .env"
        Invoke-SshCommand "cd $AppDir && sed -i 's|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=`"Admin123!$timestamp`"|' .env"
        Invoke-SshCommand "cd $AppDir && echo 'NODE_ENV=production' >> .env"
        Write-Success "Environment configured"
        
        # Generate Prisma client and push schema
        Write-Step "Setting Up Database Schema"
        Invoke-SshCommand "cd $AppDir && npx prisma generate"
        Invoke-SshCommand "cd $AppDir && npx prisma db push"
        Write-Success "Database schema deployed"
        
        # Build application
        Write-Step "Building Application"
        Invoke-SshCommand "cd $AppDir && npm run build"
        Write-Success "Application built successfully"
        
        # Set proper permissions
        Write-Step "Setting File Permissions"
        Invoke-SshCommand "chown -R www-data:www-data $AppDir"
        Invoke-SshCommand "chmod -R 755 $AppDir"
        Invoke-SshCommand "mkdir -p $AppDir/public/uploads/banners"
        Invoke-SshCommand "chmod -R 777 $AppDir/public/uploads"
        Write-Success "File permissions set"
        
        # Stop existing PM2 process if running
        Write-Step "Managing PM2 Process"
        try { Invoke-SshCommand "pm2 delete $AppName" } catch {}
        
        # Start application with PM2
        Write-Info "Starting application..."
        Invoke-SshCommand "cd $AppDir && pm2 start ecosystem.config.js"
        Invoke-SshCommand "pm2 save"
        try { Invoke-SshCommand "pm2 startup systemd -u root --hp /root" } catch {}
        Write-Success "Application started with PM2"
        
        # Install and configure Nginx
        Write-Step "Configuring Nginx"
        try {
            Invoke-SshCommand "nginx -v >/dev/null 2>&1"
        }
        catch {
            Write-Info "Installing Nginx..."
            Invoke-SshCommand "apt install -y nginx"
            Invoke-SshCommand "systemctl start nginx"
            Invoke-SshCommand "systemctl enable nginx"
        }
        
        # Create Nginx configuration
        Write-Info "Creating Nginx configuration..."
        $nginxConfig = @"
server {
    listen 80;
    server_name $DomainOrIp;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \`$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \`$host;
        proxy_set_header X-Real-IP \`$remote_addr;
        proxy_set_header X-Forwarded-For \`$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \`$scheme;
        proxy_cache_bypass \`$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /uploads/ {
        alias $AppDir/public/uploads/;
        add_header Cache-Control "public, max-age=86400";
    }
}
"@
        
        Invoke-SshCommand "cat > /etc/nginx/sites-available/$AppName << 'EOF'`n$nginxConfig`nEOF"
        
        # Enable site
        Invoke-SshCommand "ln -sf /etc/nginx/sites-available/$AppName /etc/nginx/sites-enabled/"
        Invoke-SshCommand "rm -f /etc/nginx/sites-enabled/default"
        Invoke-SshCommand "nginx -t"
        Invoke-SshCommand "systemctl reload nginx"
        Write-Success "Nginx configured and reloaded"
        
        # Configure firewall
        Write-Step "Configuring Firewall"
        try { Invoke-SshCommand "ufw allow 22/tcp" } catch {}
        try { Invoke-SshCommand "ufw allow 80/tcp" } catch {}
        try { Invoke-SshCommand "ufw allow 443/tcp" } catch {}
        try { Invoke-SshCommand "ufw --force enable" } catch {}
        Write-Success "Firewall configured"
        
        # Final verification
        Write-Step "Deployment Verification"
        Start-Sleep -Seconds 5  # Wait for services to start
        
        # Check if application is running
        try {
            $pm2Status = Invoke-SshCommand "pm2 list | grep -q $AppName && echo 'running' || echo 'not_running'"
            if ($pm2Status -eq "running") {
                Write-Success "PM2 process is running"
            }
            else {
                Write-Warning "PM2 process may not be running properly"
            }
        }
        catch {
            Write-Warning "Could not verify PM2 status"
        }
        
        # Check if Nginx is serving
        try {
            $nginxStatus = Invoke-SshCommand "curl -f -s http://localhost >/dev/null && echo 'ok' || echo 'failed'"
            if ($nginxStatus -eq "ok") {
                Write-Success "Application is responding through Nginx"
            }
            else {
                Write-Warning "Application may not be responding through Nginx"
            }
        }
        catch {
            Write-Warning "Could not verify Nginx status"
        }
        
        # Display admin credentials
        Write-Step "Deployment Complete!"
        
        try {
            $adminPass = Invoke-SshCommand "cd $AppDir && grep ADMIN_PASSWORD .env | cut -d'=' -f2 | tr -d '`"'"
        }
        catch {
            $adminPass = "Check .env file on server"
        }
        
        Write-ColorText "`n🎉 Deployment Successful!`n" -Color Green
        Write-ColorText "Access Information:" -Color Yellow
        Write-ColorText "  • Website URL: http://$VpsIp" -Color Cyan
        Write-ColorText "  • Admin Dashboard: http://$VpsIp/admin" -Color Cyan
        Write-ColorText "  • Admin Username: admin" -Color Green
        Write-ColorText "  • Admin Password: $adminPass" -Color Green
        Write-Host ""
        Write-ColorText "Useful Commands:" -Color Yellow
        Write-ColorText "  • View logs: ssh $VpsUser@$VpsIp 'pm2 logs $AppName'" -Color Cyan
        Write-ColorText "  • Restart app: ssh $VpsUser@$VpsIp 'pm2 restart $AppName'" -Color Cyan
        Write-ColorText "  • Update app: .\deploy.ps1" -Color Cyan
        Write-Host ""
        Write-ColorText "Next Steps:" -Color Yellow
        Write-ColorText "  1. Test the admin dashboard at http://$VpsIp/admin"
        Write-ColorText "  2. Add your first products and categories"
        Write-ColorText "  3. Upload promotional banners"
        Write-ColorText "  4. Consider setting up SSL certificate"
        Write-Host ""
    }
    catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        Write-Error "Check the logs above for details."
        exit 1
    }
}

# Main execution
Write-ColorText @"
=============================================
   VPS Deployment Script
   Jibreel Electronic E-commerce Platform
=============================================
"@ -Color Cyan

Write-Info "Starting deployment to $VpsIp..."
Write-Info "Repository: $RepoUrl"
Write-Info "Application: $AppName"
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Continue with deployment? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Info "Deployment cancelled by user"
    exit 0
}

# Check if SSH is available
try {
    $sshVersion = ssh -V 2>&1
    Write-Info "Using SSH: $sshVersion"
}
catch {
    Write-Error "SSH client not found. Please install OpenSSH or ensure it's in your PATH."
    Write-Info "You can install OpenSSH on Windows 10/11 via 'Settings > Apps > Optional Features'"
    exit 1
}

# Run deployment
Start-Deployment