#!/bin/bash

# =============================================================================
# VPS Deployment Script for Jibreel Electronic E-commerce Admin Dashboard
# =============================================================================
# 
# This script automatically deploys the enhanced admin dashboard from GitHub
# to your VPS at 31.97.72.28
#
# Usage: ./deploy.sh
# 
# Prerequisites:
# - SSH access to your VPS (ssh root@31.97.72.28)
# - PostgreSQL installed and configured
# - Node.js 18+ installed
# - PM2 installed globally
#
# =============================================================================

set -e  # Exit on any error

# Configuration
VPS_IP="31.97.72.28"
VPS_USER="root"
REPO_URL="https://github.com/3mo-falafel/jibreel-electrinic.git"
APP_NAME="studo-admin"
APP_DIR="/var/www/jibreel-electrinic"
DOMAIN_OR_IP="$VPS_IP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Function to run commands on VPS
run_remote() {
    ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    scp -o StrictHostKeyChecking=no -r "$1" "$VPS_USER@$VPS_IP:$2"
}

# Main deployment function
deploy() {
    log_step "Starting VPS Deployment"
    
    # Test SSH connection
    log_info "Testing SSH connection to $VPS_IP..."
    if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "echo 'SSH connection successful'"; then
        log_error "Cannot connect to VPS. Please check your SSH access."
        exit 1
    fi
    log_success "SSH connection established"
    
    # Update system packages
    log_step "Updating System Packages"
    run_remote "apt update && apt upgrade -y"
    log_success "System packages updated"
    
    # Install Node.js if not installed
    log_step "Checking Node.js Installation"
    if ! run_remote "node --version >/dev/null 2>&1"; then
        log_info "Installing Node.js 18..."
        run_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
        run_remote "apt-get install -y nodejs"
        log_success "Node.js installed"
    else
        NODE_VERSION=$(run_remote "node --version")
        log_success "Node.js already installed: $NODE_VERSION"
    fi
    
    # Install PM2 if not installed
    log_step "Checking PM2 Installation"
    if ! run_remote "pm2 --version >/dev/null 2>&1"; then
        log_info "Installing PM2..."
        run_remote "npm install -g pm2"
        log_success "PM2 installed"
    else
        PM2_VERSION=$(run_remote "pm2 --version")
        log_success "PM2 already installed: $PM2_VERSION"
    fi
    
    # Install PostgreSQL if not installed
    log_step "Checking PostgreSQL Installation"
    if ! run_remote "psql --version >/dev/null 2>&1"; then
        log_info "Installing PostgreSQL..."
        run_remote "apt install -y postgresql postgresql-contrib"
        run_remote "systemctl start postgresql"
        run_remote "systemctl enable postgresql"
        log_success "PostgreSQL installed and started"
        
        # Create database and user
        log_info "Setting up database..."
        run_remote "sudo -u postgres psql -c \"CREATE DATABASE studo_db;\" || true"
        run_remote "sudo -u postgres psql -c \"CREATE USER studo_user WITH ENCRYPTED PASSWORD 'StrongPassword123!';\" || true"
        run_remote "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE studo_db TO studo_user;\" || true"
        run_remote "sudo -u postgres psql -c \"ALTER USER studo_user CREATEDB;\" || true"
        log_success "Database setup completed"
    else
        PSQL_VERSION=$(run_remote "psql --version")
        log_success "PostgreSQL already installed: $PSQL_VERSION"
    fi
    
    # Create application directory
    log_step "Setting Up Application Directory"
    run_remote "mkdir -p $APP_DIR"
    run_remote "mkdir -p $APP_DIR/logs"
    log_success "Application directory created"
    
    # Clone or update repository
    log_step "Deploying Application Code"
    if run_remote "[ -d '$APP_DIR/.git' ]"; then
        log_info "Updating existing repository..."
        run_remote "cd $APP_DIR && git fetch origin && git reset --hard origin/master"
    else
        log_info "Cloning repository..."
        run_remote "cd /var/www && rm -rf jibreel-electrinic || true"
        run_remote "cd /var/www && git clone $REPO_URL"
    fi
    log_success "Code deployed successfully"
    
    # Install dependencies
    log_step "Installing Dependencies"
    run_remote "cd $APP_DIR && npm install --production"
    log_success "Dependencies installed"
    
    # Create environment file
    log_step "Configuring Environment"
    run_remote "cd $APP_DIR && cp .env.example .env"
    
    # Update environment variables
    log_info "Setting up environment variables..."
    run_remote "cd $APP_DIR && sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"postgresql://studo_user:StrongPassword123!@localhost:5432/studo_db\"|' .env"
    run_remote "cd $APP_DIR && sed -i 's|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=\"Admin123!$(date +%s)\"|' .env"
    run_remote "cd $APP_DIR && echo 'NODE_ENV=production' >> .env"
    log_success "Environment configured"
    
    # Generate Prisma client and push schema
    log_step "Setting Up Database Schema"
    run_remote "cd $APP_DIR && npx prisma generate"
    run_remote "cd $APP_DIR && npx prisma db push"
    log_success "Database schema deployed"
    
    # Build application
    log_step "Building Application"
    run_remote "cd $APP_DIR && npm run build"
    log_success "Application built successfully"
    
    # Set proper permissions
    log_step "Setting File Permissions"
    run_remote "chown -R www-data:www-data $APP_DIR"
    run_remote "chmod -R 755 $APP_DIR"
    run_remote "mkdir -p $APP_DIR/public/uploads/banners"
    run_remote "chmod -R 777 $APP_DIR/public/uploads"
    log_success "File permissions set"
    
    # Stop existing PM2 process if running
    log_step "Managing PM2 Process"
    run_remote "pm2 delete $APP_NAME || true"
    
    # Start application with PM2
    log_info "Starting application..."
    run_remote "cd $APP_DIR && pm2 start ecosystem.config.js"
    run_remote "pm2 save"
    run_remote "pm2 startup systemd -u root --hp /root || true"
    log_success "Application started with PM2"
    
    # Install and configure Nginx
    log_step "Configuring Nginx"
    if ! run_remote "nginx -v >/dev/null 2>&1"; then
        log_info "Installing Nginx..."
        run_remote "apt install -y nginx"
        run_remote "systemctl start nginx"
        run_remote "systemctl enable nginx"
    fi
    
    # Create Nginx configuration
    log_info "Creating Nginx configuration..."
    run_remote "cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name $DOMAIN_OR_IP;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Handle static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control \"public, max-age=31536000, immutable\";
    }
    
    # Handle uploads
    location /uploads/ {
        alias $APP_DIR/public/uploads/;
        add_header Cache-Control \"public, max-age=86400\";
    }
}
EOF"
    
    # Enable site
    run_remote "ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/"
    run_remote "rm -f /etc/nginx/sites-enabled/default"
    run_remote "nginx -t"
    run_remote "systemctl reload nginx"
    log_success "Nginx configured and reloaded"
    
    # Configure firewall
    log_step "Configuring Firewall"
    run_remote "ufw allow 22/tcp || true"
    run_remote "ufw allow 80/tcp || true"
    run_remote "ufw allow 443/tcp || true"
    run_remote "ufw --force enable || true"
    log_success "Firewall configured"
    
    # Final verification
    log_step "Deployment Verification"
    sleep 5  # Wait for services to start
    
    # Check if application is running
    if run_remote "pm2 list | grep -q $APP_NAME"; then
        log_success "PM2 process is running"
    else
        log_warning "PM2 process may not be running properly"
    fi
    
    # Check if Nginx is serving
    if run_remote "curl -f -s http://localhost >/dev/null"; then
        log_success "Application is responding through Nginx"
    else
        log_warning "Application may not be responding through Nginx"
    fi
    
    # Display admin credentials
    log_step "Deployment Complete!"
    
    ADMIN_PASS=$(run_remote "cd $APP_DIR && grep ADMIN_PASSWORD .env | cut -d'=' -f2 | tr -d '\"'")
    
    echo -e "\n${GREEN}🎉 Deployment Successful!${NC}\n"
    echo -e "${YELLOW}Access Information:${NC}"
    echo -e "  • Website URL: ${BLUE}http://$VPS_IP${NC}"
    echo -e "  • Admin Dashboard: ${BLUE}http://$VPS_IP/admin${NC}"
    echo -e "  • Admin Username: ${GREEN}admin${NC}"
    echo -e "  • Admin Password: ${GREEN}$ADMIN_PASS${NC}"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo -e "  • View logs: ${BLUE}ssh $VPS_USER@$VPS_IP 'pm2 logs $APP_NAME'${NC}"
    echo -e "  • Restart app: ${BLUE}ssh $VPS_USER@$VPS_IP 'pm2 restart $APP_NAME'${NC}"
    echo -e "  • Update app: ${BLUE}./deploy.sh${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "  1. Test the admin dashboard at http://$VPS_IP/admin"
    echo -e "  2. Add your first products and categories"
    echo -e "  3. Upload promotional banners"
    echo -e "  4. Consider setting up SSL certificate"
    echo ""
}

# Error handling
trap 'log_error "Deployment failed at line $LINENO. Check the logs above for details."' ERR

# Check if script is run with bash
if [ -z "$BASH_VERSION" ]; then
    log_error "This script must be run with bash"
    exit 1
fi

# Main execution
echo -e "${BLUE}"
echo "============================================="
echo "   VPS Deployment Script"
echo "   Jibreel Electronic E-commerce Platform"
echo "============================================="
echo -e "${NC}"

log_info "Starting deployment to $VPS_IP..."
log_info "Repository: $REPO_URL"
log_info "Application: $APP_NAME"
echo ""

# Ask for confirmation
read -p "Continue with deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Deployment cancelled by user"
    exit 0
fi

# Run deployment
deploy

exit 0