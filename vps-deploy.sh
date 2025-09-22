#!/bin/bash

# =============================================================================
# Simple VPS Deployment Script for Jibreel Electronic E-commerce Admin
# =============================================================================
# 
# Copy this entire script to your VPS:
# 1. ssh root@31.97.72.28
# 2. nano deploy.sh
# 3. Paste this script content
# 4. Press Ctrl+X, then Y, then Enter to save
# 5. chmod +x deploy.sh
# 6. ./deploy.sh
#
# For redeployment, just run: ./deploy.sh
# =============================================================================

set -e  # Exit on any error

# Configuration
REPO_URL="https://github.com/3mo-falafel/jibreel-electrinic.git"
APP_NAME="studo-admin"
APP_DIR="/var/www/jibreel-electrinic"
DB_NAME="studo_db"
DB_USER="studo_user"
DB_PASS="StrongPassword123!"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "\n${YELLOW}=== $1 ===${NC}"; }

# Check if this is first deployment or redeployment
if [ -d "$APP_DIR" ]; then
    DEPLOYMENT_TYPE="REDEPLOYMENT"
else
    DEPLOYMENT_TYPE="FIRST_DEPLOYMENT"
fi

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}   Jibreel Electronic Deployment Script${NC}"
echo -e "${BLUE}   Type: $DEPLOYMENT_TYPE${NC}"
echo -e "${BLUE}=============================================${NC}"

if [ "$DEPLOYMENT_TYPE" = "FIRST_DEPLOYMENT" ]; then
    log_step "First Deployment - Installing Dependencies"
    
    # Update system
    log_info "Updating system packages..."
    apt update && apt upgrade -y
    log_success "System updated"
    
    # Install Node.js
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        log_success "Node.js installed: $(node --version)"
    else
        log_success "Node.js already installed: $(node --version)"
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        log_info "Installing PM2..."
        npm install -g pm2
        log_success "PM2 installed"
    else
        log_success "PM2 already installed: $(pm2 --version)"
    fi
    
    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_info "Installing PostgreSQL..."
        apt install -y postgresql postgresql-contrib
        systemctl start postgresql
        systemctl enable postgresql
        log_success "PostgreSQL installed"
        
        # Setup database
        log_info "Creating database and user..."
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || true
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" || true
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || true
        sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;" || true
        log_success "Database setup completed"
    else
        log_success "PostgreSQL already installed: $(psql --version | head -1)"
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        log_info "Installing Nginx..."
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
        log_success "Nginx installed"
    else
        log_success "Nginx already installed: $(nginx -v 2>&1)"
    fi
    
else
    log_step "Redeployment - Updating Application"
fi

# Stop existing application
log_info "Stopping existing application..."
pm2 delete $APP_NAME || true
pm2 kill || true

# Deploy application code
log_step "Deploying Application Code"
if [ -d "$APP_DIR" ]; then
    log_info "Updating existing code..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/master
else
    log_info "Cloning repository..."
    cd /var/www
    git clone $REPO_URL
    cd $APP_DIR
fi
log_success "Code updated"

# Create environment file
log_step "Configuring Environment"
if [ ! -f ".env" ]; then
    cp .env.example .env
    log_info "Created .env from example"
fi

# Update environment variables
log_info "Setting environment variables..."
sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME\"|" .env
sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=\"Admin123!$(date +%s)\"|" .env
echo "NODE_ENV=production" >> .env
log_success "Environment configured"

# Install dependencies
log_step "Installing Dependencies"
npm install --production
log_success "Dependencies installed"

# Setup database
log_step "Setting Up Database"
npx prisma generate
npx prisma db push
log_success "Database schema updated"

# Build application
log_step "Building Application"
npm run build
log_success "Application built"

# Set permissions
log_info "Setting file permissions..."
mkdir -p public/uploads/banners
chmod -R 755 .
chmod -R 777 public/uploads
chown -R www-data:www-data .
log_success "Permissions set"

# Start application
log_step "Starting Application"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root || true
log_success "Application started"

# Configure Nginx (only for first deployment)
if [ "$DEPLOYMENT_TYPE" = "FIRST_DEPLOYMENT" ]; then
    log_step "Configuring Nginx"
    
    cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 50M;
    
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /uploads/ {
        alias /var/www/jibreel-electrinic/public/uploads/;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx
    log_success "Nginx configured"
    
    # Configure firewall
    log_step "Configuring Firewall"
    ufw allow 22/tcp || true
    ufw allow 80/tcp || true
    ufw allow 443/tcp || true
    ufw --force enable || true
    log_success "Firewall configured"
fi

# Final verification
log_step "Verifying Deployment"
sleep 5

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Check PM2 status
if pm2 list | grep -q $APP_NAME; then
    log_success "PM2 process is running"
else
    log_warning "PM2 process may not be running"
fi

# Check if app responds
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "Application is responding"
else
    log_warning "Application may not be responding"
fi

# Get admin password
ADMIN_PASS=$(grep ADMIN_PASSWORD .env | cut -d'=' -f2 | tr -d '"')

# Success message
log_step "Deployment Complete!"
echo -e "\n${GREEN}🎉 Deployment Successful!${NC}\n"
echo -e "${YELLOW}Access Information:${NC}"
echo -e "  • Website: ${BLUE}http://$SERVER_IP${NC}"
echo -e "  • Admin Dashboard: ${BLUE}http://$SERVER_IP/admin${NC}"
echo -e "  • Username: ${GREEN}admin${NC}"
echo -e "  • Password: ${GREEN}$ADMIN_PASS${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  • View logs: ${BLUE}pm2 logs $APP_NAME${NC}"
echo -e "  • Restart app: ${BLUE}pm2 restart $APP_NAME${NC}"
echo -e "  • Redeploy: ${BLUE}./deploy.sh${NC}"
echo -e "  • Check status: ${BLUE}pm2 status${NC}"
echo ""
echo -e "${YELLOW}To redeploy updates from GitHub:${NC}"
echo -e "  Just run: ${GREEN}./deploy.sh${NC}"
echo ""

# Create a quick status script
cat > status.sh << 'EOF'
#!/bin/bash
echo "=== Application Status ==="
echo "PM2 Status:"
pm2 status
echo ""
echo "Application Response:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000
echo ""
echo "Nginx Status:"
systemctl status nginx --no-pager -l
echo ""
echo "Database Status:"
systemctl status postgresql --no-pager -l
EOF
chmod +x status.sh

echo -e "Created ${BLUE}status.sh${NC} - run ${GREEN}./status.sh${NC} to check system status"
echo ""

log_success "All done! Your e-commerce admin dashboard is ready!"