# StreamZip - Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passed (see TESTING.md)
- [ ] Environment variables configured
- [ ] Redis production instance ready
- [ ] Domain name registered
- [ ] SSL certificate obtained
- [ ] Monitoring set up
- [ ] Backup strategy defined

## Deployment Options

### Option 1: VPS/Dedicated Server (Recommended)

#### Supported Platforms
- DigitalOcean Droplet
- AWS EC2
- Google Cloud Compute Engine
- Linode
- Vultr
- Hetzner

#### Server Requirements
- **Minimum**: 1 vCPU, 1GB RAM, 10GB SSD
- **Recommended**: 2 vCPU, 2GB RAM, 50GB SSD
- **OS**: Ubuntu 22.04 LTS

### Option 2: Platform-as-a-Service

- Heroku (with Redis add-on)
- Render.com
- Railway.app
- Fly.io

### Option 3: Container-based

- Docker + Docker Compose
- Kubernetes
- AWS ECS/Fargate

## Deployment Steps (Ubuntu Server)

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be 18.x
npm --version

# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: maxmemory 512mb
# Set: maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify Redis
redis-cli ping  # Should return PONG

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Deploy Application

```bash
# Create app user
sudo adduser streamzip
sudo usermod -aG sudo streamzip
su - streamzip

# Clone or upload code
cd /home/streamzip
# Upload code via Git, SCP, or FTP

# Install dependencies
cd /home/streamzip/YouThub
npm install

# Configure environment
cd backend
cp .env.example .env
nano .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=production
REDIS_HOST=localhost
REDIS_PORT=6379
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_PLAYLIST_MAX=3
TEMP_DIR=/home/streamzip/temp
MAX_VIDEO_PLAYLIST_SIZE=8
MAX_AUDIO_PLAYLIST_SIZE=15
FRONTEND_URL=https://yourdomain.com
```

```bash
# Create temp directory
mkdir -p /home/streamzip/temp
chmod 755 /home/streamzip/temp

# Configure frontend
cd ../frontend
cp .env.local.example .env.local
nano .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Build Application

```bash
# Build frontend
cd /home/streamzip/YouThub/frontend
npm run build

# Test backend
cd ../backend
node src/server.js
# Ctrl+C to stop
```

### 4. Configure PM2

```bash
cd /home/streamzip/YouThub

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Paste:
```javascript
module.exports = {
  apps: [
    {
      name: 'streamzip-backend',
      cwd: './backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'streamzip-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Enable PM2 startup
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs
```

### 5. Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/streamzip
```

Paste:
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

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

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/streamzip /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. Configure SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Configure Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

### 8. Set Up Monitoring

```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs streamzip-backend
pm2 logs streamzip-frontend
```

## Docker Deployment (Alternative)

### 1. Create Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

### 2. Create Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["npm", "start"]
```

### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - FRONTEND_URL=https://yourdomain.com
    volumes:
      - ./backend/.env:/app/.env
      - temp-files:/app/temp
    depends_on:
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    depends_on:
      - backend

volumes:
  redis-data:
  temp-files:
```

### 4. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check services
curl https://api.yourdomain.com/health
# Should return: {"status":"ok","timestamp":"..."}

# Check frontend
curl https://yourdomain.com
# Should return HTML

# Check Redis
redis-cli ping
```

### 2. Set Up Monitoring

#### Install Monitoring Tools
```bash
# Option 1: PM2 Plus (free tier)
pm2 link <secret> <public>

# Option 2: Custom monitoring
# Set up Prometheus + Grafana
# Set up Uptime Kuma
```

### 3. Configure Backups

```bash
# Create backup script
sudo nano /home/streamzip/backup.sh
```

Paste:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/streamzip/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup Redis
redis-cli SAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup code
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /home/streamzip/YouThub

# Delete backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /home/streamzip/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/streamzip/backup.sh
```

### 4. Configure Analytics

Add Google Analytics or Plausible to `frontend/pages/_document.js`:

```javascript
// For Plausible
<script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
></script>
```

## Maintenance

### Update Application

```bash
# Pull latest code
cd /home/streamzip/YouThub
git pull

# Install dependencies
npm install

# Rebuild frontend
cd frontend
npm run build

# Restart services
pm2 restart all

# Check status
pm2 status
```

### Monitor Logs

```bash
# View all logs
pm2 logs

# View specific app
pm2 logs streamzip-backend
pm2 logs streamzip-frontend

# Clear logs
pm2 flush
```

### Check Performance

```bash
# System resources
htop

# Disk usage
df -h

# Redis stats
redis-cli INFO

# PM2 stats
pm2 monit
```

### Cleanup Temp Files

```bash
# Manual cleanup
cd /home/streamzip/temp
find . -type f -mtime +1 -delete

# Add to crontab (hourly)
crontab -e
# Add: 0 * * * * find /home/streamzip/temp -type f -mtime +1 -delete
```

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs streamzip-backend --lines 100

# Common issues:
# - Redis not running: sudo systemctl start redis
# - Port in use: lsof -i :3000
# - Environment variables: check backend/.env
```

### Frontend Not Building
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run build

# Check Node version
node --version  # Should be 18+
```

### Redis Connection Issues
```bash
# Check Redis
redis-cli ping

# Check Redis config
redis-cli CONFIG GET bind

# Restart Redis
sudo systemctl restart redis
```

### High CPU Usage
```bash
# Check processes
htop

# Limit worker concurrency (backend/src/services/jobService.js)
# Set concurrency: 2 in Worker options
```

### Disk Space Issues
```bash
# Check disk usage
df -h

# Clean temp files
cd /home/streamzip/temp
rm -rf *

# Clean PM2 logs
pm2 flush
```

## Scaling Strategies

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Adjust PM2 instances
- Increase Redis memory

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Run multiple backend instances
- Shared Redis instance
- Shared file storage (NFS, S3)

### CDN Integration
- Serve static files via CDN
- Cache video thumbnails
- Reduce server bandwidth

## Security Checklist

- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] Rate limiting active
- [ ] Redis password set (if exposed)
- [ ] File permissions correct (755 for dirs, 644 for files)
- [ ] Environment files not committed to Git
- [ ] Regular security updates
- [ ] Fail2ban installed (optional)

## Cost Estimation

### Infrastructure (Monthly)
- **VPS**: $5-20 (DigitalOcean, Vultr)
- **Domain**: $1-2/month ($12-24/year)
- **SSL**: Free (Let's Encrypt)
- **Bandwidth**: Included (usually 1TB+)

### Tools (Free Tier)
- PM2 Plus: Free tier available
- Plausible Analytics: $9/month (or self-hosted free)
- Uptime monitoring: Free options available

**Total**: ~$10-30/month for 100 users/day

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check logs for errors
- [ ] Weekly: Review disk usage
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review analytics
- [ ] Quarterly: Security audit
- [ ] Yearly: Backup restoration test

## Rollback Plan

If deployment fails:

```bash
# Stop services
pm2 stop all

# Restore previous version
cd /home/streamzip/YouThub
git reset --hard <previous-commit>

# Reinstall dependencies
npm install

# Rebuild frontend
cd frontend
npm run build

# Restart services
pm2 restart all
```

## Contact & Support

For deployment issues:
- Check logs first
- Review TROUBLESHOOTING section
- Check Redis connectivity
- Verify environment variables

---

**Deployment Complete! 🚀**

Access your app at: https://yourdomain.com
