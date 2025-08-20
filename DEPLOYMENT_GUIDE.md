# 🚀 Mouse Training Tracker - Complete Deployment Guide

## Overview
This guide will help you deploy your Mouse Training Tracker application to your Ubuntu server with password protection (password: `shogolab`).

## 📋 What You Have
- `matrix-version.html` - Your main application
- `server.js` - Node.js server with authentication
- `package.json` - Dependencies configuration
- `deploy.sh` - Full deployment script
- `setup-server.sh` - Quick setup script
- `README.md` - Documentation

## 🎯 Quick Deployment (Recommended)

### Step 1: Upload Files to Server
From your local machine, upload all files to your server:

```bash
# Replace YOUR_SERVER_IP with your actual server IP (172.31.11.214)
scp matrix-version.html server.js package.json setup-server.sh ubuntu@172.31.11.214:~/
```

### Step 2: SSH into Server and Run Setup
```bash
ssh ubuntu@172.31.11.214
chmod +x setup-server.sh
./setup-server.sh
```

### Step 3: Access Your Application
Open browser and go to: `http://172.31.11.214:3000`
Enter password: `shogolab`

## 🔧 Manual Deployment (Alternative)

If you prefer step-by-step manual setup:

### 1. Connect to Server
```bash
ssh ubuntu@172.31.11.214
```

### 2. Create Application Directory
```bash
mkdir -p /home/ubuntu/mouse-training-app
cd /home/ubuntu/mouse-training-app
```

### 3. Upload Your Files
Upload `matrix-version.html`, `server.js`, and `package.json` to this directory.

### 4. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

### 7. Configure Firewall
```bash
sudo ufw allow 3000/tcp
sudo ufw enable
```

### 8. Start Application
```bash
pm2 start server.js --name "mouse-training-tracker"
pm2 save
pm2 startup
```

## 🌐 Accessing Your Application

1. **URL**: `http://172.31.11.214:3000`
2. **Password**: `shogolab`
3. **Features Available**:
   - View and edit mouse training data
   - Drag and drop interface
   - Export/import functionality
   - Responsive design

## 🛠️ Server Management Commands

### Check Application Status
```bash
pm2 status
```

### View Application Logs
```bash
pm2 logs mouse-training-tracker
```

### Restart Application
```bash
pm2 restart mouse-training-tracker
```

### Stop Application
```bash
pm2 stop mouse-training-tracker
```

### Start Application
```bash
pm2 start mouse-training-tracker
```

## 🔍 Troubleshooting

### Application Won't Start
```bash
# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>

# Restart application
pm2 restart mouse-training-tracker
```

### Can't Access from Browser
```bash
# Check firewall status
sudo ufw status

# Ensure port 3000 is allowed
sudo ufw allow 3000/tcp

# Check if application is running
pm2 status
```

### Check Server IP
```bash
curl ifconfig.me
```

## 🔒 Security Features

- **Session-based authentication** with password protection
- **24-hour session timeout** for security
- **Firewall configuration** to allow only necessary ports
- **Process management** with PM2 for reliability

## 📊 Application Features

Your deployed application includes:

- **Matrix View**: Visual grid showing training steps and mouse assignments
- **Edit Mode**: Toggle editing capabilities on/off
- **Drag & Drop**: Intuitive mouse assignment interface
- **Data Persistence**: All data saved in browser localStorage
- **Export/Import**: JSON data backup and restore
- **Responsive Design**: Works on desktop and mobile
- **Color Coding**: Visual organization with customizable colors

## 🌍 Domain Setup (Optional)

After successful deployment, you can:

1. **Purchase a domain name**
2. **Point domain to your server IP** (172.31.11.214)
3. **Set up reverse proxy** with Nginx
4. **Configure SSL** with Let's Encrypt

Example domain configuration:
```bash
# Install Nginx
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/mouse-training

# Add this configuration:
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/mouse-training /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📞 Support

If you encounter issues:

1. **Check application logs**: `pm2 logs mouse-training-tracker`
2. **Verify server status**: `pm2 status`
3. **Check firewall**: `sudo ufw status`
4. **Test connectivity**: `curl http://localhost:3000/health`

## ✅ Success Checklist

- [ ] Files uploaded to server
- [ ] Node.js installed
- [ ] Dependencies installed
- [ ] PM2 process manager running
- [ ] Firewall configured
- [ ] Application accessible at http://172.31.11.214:3000
- [ ] Login works with password "shogolab"
- [ ] Can view and edit training data

Your Mouse Training Tracker is now ready for use! 🎉