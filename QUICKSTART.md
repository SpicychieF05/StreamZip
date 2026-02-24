# StreamZip - Quick Start Guide

This is a **3-minute quick start** to get StreamZip running locally.

## Prerequisites ✅

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Redis** - See installation below

### Installing Redis

#### Windows:
```powershell
# Option 1: Download installer
# https://github.com/tporadowski/redis/releases

# Option 2: Via Chocolatey
choco install redis-64

# Option 3: Via WSL (recommended)
wsl --install
wsl -d Ubuntu
sudo apt update
sudo apt install redis-server
redis-server
```

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

## Quick Start 🚀

### Option 1: Automated Script (Recommended)

#### Windows:
```powershell
# Double-click start.bat
# OR in PowerShell/CMD:
start.bat
```

#### macOS/Linux:
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Start Redis (if not running)
redis-server

# 4. Start application (in new terminal)
npm run dev
```

## Access the App 🌐

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Test It Out 🎬

1. Open http://localhost:3001
2. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Click "Analyze"
4. Click "Download Video" or "Download Audio"
5. Wait for processing (30-60 seconds)
6. Download your file!

## Troubleshooting 🔧

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not, start Redis:
redis-server
```

### Port Already in Use
```bash
# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux: Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

## What's Next? 📚

- **Full Setup Guide**: [SETUP.md](./SETUP.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Compliance**: [COMPLIANCE.md](./COMPLIANCE.md)

## Project Structure 📁

```
YouThub/
├── backend/          # Express.js API server
├── frontend/         # Next.js React app
├── temp/            # Downloaded files (auto-cleaned)
├── start.bat        # Windows quick start
├── start.sh         # macOS/Linux quick start
└── README.md        # This file
```

## Features ✨

- ✅ Download YouTube videos (MP4, 720p)
- ✅ Download audio (M4A)
- ✅ Real-time progress tracking
- ✅ Mobile-first responsive design
- ✅ Rate limiting (10 downloads/hour)
- ✅ Auto file cleanup (1 hour)

## Tech Stack 🛠️

- **Frontend**: Next.js, React, CSS Modules
- **Backend**: Node.js, Express, BullMQ
- **Queue**: Redis + BullMQ
- **Downloader**: ytdl-core

## Known Limitations ⚠️

- Playlist support requires yt-dlp (not included in MVP)
- Files are deleted after 1 hour
- Rate limited to 10 downloads per hour per IP

## Support 💬

Having issues?
1. Check the troubleshooting section above
2. Review [SETUP.md](./SETUP.md) for detailed instructions
3. Check logs: `pm2 logs` (if using PM2)

## License 📄

MIT License - Free to use for personal projects

---

**Made with ❤️ for the StreamZip project**

*Last updated: February 24, 2026*
