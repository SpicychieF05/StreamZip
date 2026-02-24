# StreamZip - Mobile-First YouTube Downloader

A web-based tool for downloading YouTube videos and audio with mobile-first design.

## Features

- ✅ Single video download (MP4, 720p)
- ✅ Single audio download (M4A/MP3)
- ✅ Playlist preview and download
- ✅ Playlist ZIP (max 8 videos, 15 audio)
- ✅ Real-time job progress tracking
- ✅ Mobile-first responsive design
- ✅ Rate limiting and abuse prevention

## Tech Stack

### Backend
- Node.js + Express
- BullMQ (job queue)
- Redis (queue storage)
- ytdl-core (YouTube downloader)

### Frontend
- Next.js (React)
- Mobile-first responsive design
- Color scheme: Red (#FF0000), White (#FFFFFF)

## Getting Started

### Prerequisites
- Node.js 18+
- Redis server

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

3. Start Redis:
```bash
redis-server
```

4. Run development servers:
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

## Project Structure

```
YouThub/
├── backend/           # Express API server
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   └── utils/
│   └── package.json
├── frontend/          # Next.js app
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── package.json
└── package.json
```

## API Endpoints

- `POST /api/analyze` - Analyze YouTube URL
- `POST /api/download/video` - Download single video
- `POST /api/download/audio` - Download single audio
- `POST /api/download/playlist-zip` - Download playlist as ZIP
- `GET /api/job/:jobId` - Get job status

## Rate Limits

- 10 downloads per hour per IP
- 3 playlist ZIPs per hour per IP

## License

MIT
