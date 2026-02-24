# StreamZip Setup Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js 18+** installed
- **Redis server** installed and running
- **npm** or **yarn** package manager

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Configure Environment Variables

#### Backend (.env)
Already created at `backend/.env` with default values:
```env
PORT=3000
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_PLAYLIST_MAX=3
TEMP_DIR=./temp
MAX_VIDEO_PLAYLIST_SIZE=8
MAX_AUDIO_PLAYLIST_SIZE=15
FRONTEND_URL=http://localhost:3001
```

#### Frontend (.env.local)
Already created at `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Redis Server

#### Windows (using chocolatey or manual installation):
```bash
redis-server
```

#### macOS (using Homebrew):
```bash
brew services start redis
```

#### Linux:
```bash
sudo systemctl start redis
# or
redis-server
```

### 4. Run the Application

#### Development Mode (Both servers):
```bash
npm run dev
```

This will start:
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

#### Or run separately:

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## Testing the Application

1. **Test Single Video Download:**
   - Paste a YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
   - Click "Analyze"
   - Click "Download Video (MP4)" or "Download Audio (M4A)"
   - Wait for processing
   - Download the file

2. **Test Rate Limiting:**
   - Try downloading more than 10 videos in an hour
   - You should see a rate limit error

## Production Build

### Build both frontend and backend:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

## Troubleshooting

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check Redis host/port in `.env`

### Port Already in Use
- Change PORT in `backend/.env` and `frontend/.env.local`
- Or stop the process using the port

### ytdl-core Issues
- If you encounter YouTube download errors, ytdl-core may need updates
- Consider using yt-dlp as an alternative (requires Python)

### File Download Not Working
- Check that `temp/` directory exists and is writable
- Ensure backend is serving static files from `/files`

## Project Structure

```
YouThub/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── routes/            # API routes
│   │   │   ├── analyze.js
│   │   │   ├── download.js
│   │   │   └── job.js
│   │   ├── services/          # Business logic
│   │   │   ├── youtubeService.js
│   │   │   └── jobService.js
│   │   ├── middleware/        # Express middleware
│   │   │   └── rateLimiter.js
│   │   └── utils/             # Helper functions
│   │       ├── errorHandler.js
│   │       └── urlValidator.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── pages/
│   │   ├── _app.js           # App wrapper
│   │   ├── _document.js      # HTML document
│   │   ├── index.js          # Home page
│   │   └── 404.js            # Error page
│   ├── components/           # React components
│   │   ├── VideoPreview.js
│   │   ├── JobProgress.js
│   │   └── DownloadReady.js
│   ├── styles/               # CSS modules
│   │   ├── globals.css
│   │   ├── Home.module.css
│   │   ├── VideoPreview.module.css
│   │   ├── JobProgress.module.css
│   │   └── DownloadReady.module.css
│   ├── .env.local
│   └── package.json
└── package.json              # Root package.json
```

## API Endpoints

### POST /api/analyze
Analyze a YouTube URL
```json
Request: { "url": "https://youtube.com/watch?v=..." }
Response: {
  "type": "video",
  "video": {
    "id": "...",
    "title": "...",
    "duration": 180,
    "thumbnail": "...",
    "author": "..."
  }
}
```

### POST /api/download/video
Download video as MP4
```json
Request: { "url": "https://youtube.com/watch?v=..." }
Response: { "jobId": "...", "status": "queued" }
```

### POST /api/download/audio
Download audio
```json
Request: { "url": "https://youtube.com/watch?v=..." }
Response: { "jobId": "...", "status": "queued" }
```

### GET /api/job/:jobId
Get job status
```json
Response: {
  "id": "...",
  "status": "completed",
  "progress": 100,
  "outputPath": "/files/...",
  "filename": "..."
}
```

## Features Implemented

✅ Single video download (MP4)
✅ Single audio download (M4A)
✅ URL validation
✅ Job queue with BullMQ
✅ Real-time progress tracking
✅ Rate limiting (10 requests/hour)
✅ Mobile-first responsive design
✅ Mandatory color scheme (Red #FF0000, White #FFFFFF)
✅ Error handling
✅ Auto cleanup (files deleted after 1 hour)

## Known Limitations (MVP)

- Playlist support requires yt-dlp installation
- No user accounts or download history
- No quality selector UI
- No dark mode
- In-memory job storage (use Redis/DB for production)

## Next Steps

For production deployment:
1. Set up Redis persistence
2. Use database for job storage
3. Implement yt-dlp for playlist support
4. Add CAPTCHA for bot protection
5. Set up proper logging
6. Configure HTTPS
7. Implement analytics (Google Analytics/Plausible)
8. Add download history feature

## License

MIT
