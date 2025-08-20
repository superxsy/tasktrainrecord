#!/bin/bash

# Quick setup script for Mouse Training Tracker
# Run this script on your Ubuntu server

set -e

echo "🐭 Mouse Training Tracker - Server Setup"
echo "========================================"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "Unable to detect IP")
echo "📍 Server IP: $SERVER_IP"

# Create application directory
APP_DIR="/home/ubuntu/mouse-training-app"
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Check if files exist
if [ ! -f "matrix-version.html" ] || [ ! -f "server.js" ] || [ ! -f "package.json" ]; then
    echo "❌ Required files not found in current directory!"
    echo "Please ensure these files are present:"
    echo "  - matrix-version.html"
    echo "  - server.js" 
    echo "  - package.json"
    echo ""
    echo "Upload them using: scp *.html *.js *.json ubuntu@$SERVER_IP:$APP_DIR/"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 process manager..."
    sudo npm install -g pm2
fi

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 3000/tcp
sudo ufw --force enable

# Start application
echo "🚀 Starting application..."
pm2 delete mouse-training-tracker 2>/dev/null || true
pm2 start server.js --name "mouse-training-tracker"
pm2 save
pm2 startup ubuntu -u ubuntu --hp /home/ubuntu

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Your application is running at:"
echo "   http://$SERVER_IP:3000"
echo ""
echo "🔑 Login password: shogolab"
echo ""
echo "📋 Management commands:"
echo "   pm2 status                    - Check status"
echo "   pm2 logs mouse-training-tracker - View logs"
echo "   pm2 restart mouse-training-tracker - Restart app"
echo ""