# Mouse Training Tracker - Deployment Guide

A web-based application for tracking piano task training progress with password protection.

## Quick Deployment on Ubuntu Server

### Prerequisites
- Ubuntu 22.04 LTS server
- SSH access to the server
- Internet connection

### Step 1: Upload Files to Server

Upload these files to your Ubuntu server:
- `matrix-version.html`
- `server.js`
- `package.json`
- `deploy.sh`

```bash
# Example using scp (run from your local machine)
scp matrix-version.html server.js package.json deploy.sh ubuntu@YOUR_SERVER_IP:~/
```

### Step 2: Run Deployment Script

SSH into your server and run:

```bash
ssh ubuntu@YOUR_SERVER_IP
cd ~
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Access Your Application

1. Open your web browser
2. Navigate to: `http://YOUR_SERVER_IP:3000`
3. Enter password: `shogolab`
4. Start using the application!

## Manual Deployment (Alternative)

If you prefer manual setup:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create app directory
mkdir -p /home/ubuntu/mouse-training-app
cd /home/ubuntu/mouse-training-app

# Copy your files here
# Install dependencies
npm install

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start server.js --name "mouse-training-tracker"
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 3000/tcp
sudo ufw enable
```

## Application Features

- **Password Protection**: Access requires password "shogolab"
- **Data Persistence**: All data is stored in browser localStorage
- **Export/Import**: JSON data export and import functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Edit Mode**: Toggle editing capabilities
- **Drag & Drop**: Intuitive mouse assignment interface

## Server Management

### Check Application Status
```bash
pm2 status
```

### View Logs
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

## Security Notes

- The application uses session-based authentication
- Sessions expire after 24 hours of inactivity
- Password is currently hardcoded as "shogolab"
- For production use, consider:
  - Using environment variables for passwords
  - Implementing HTTPS
  - Adding rate limiting
  - Using a proper database instead of localStorage

## Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Check Server IP
```bash
curl ifconfig.me
```

### Firewall Issues
```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

### Node.js Issues
```bash
node --version
npm --version
```

## Domain Setup (After Deployment)

Once your application is running, you can:

1. Purchase a domain name
2. Point the domain to your server IP
3. Set up a reverse proxy with Nginx
4. Configure SSL with Let's Encrypt

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Support

For issues or questions, check the application logs:
```bash
pm2 logs mouse-training-tracker