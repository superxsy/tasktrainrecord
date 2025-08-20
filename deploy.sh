#!/bin/bash

# Mouse Training Tracker Deployment Script
# This script sets up the application on Ubuntu server

echo "🚀 Starting deployment of Mouse Training Tracker..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js and npm if not already installed
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Create application directory
APP_DIR="/home/ubuntu/mouse-training-app"
echo "📁 Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# Install dependencies
echo "📦 Installing application dependencies..."
npm install

# Install PM2 for process management
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# Create PM2 ecosystem file
echo "📝 Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mouse-training-tracker',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Set up firewall rules
echo "🔥 Configuring firewall..."
sudo ufw allow 3000/tcp
sudo ufw --force enable

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application is now running at:"
echo "   http://$(curl -s ifconfig.me):3000"
echo ""
echo "🔑 Login password: shogolab"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View application logs"
echo "   pm2 restart all     - Restart application"
echo "   pm2 stop all        - Stop application"
echo ""