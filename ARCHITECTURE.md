# StreamZip - Technical Architecture

## System Architecture

```
┌─────────────┐
│   Browser   │ (Mobile-First UI)
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────────┐
│   Next.js App   │ (Port 3001)
│   (Frontend)    │
└────────┬────────┘
         │ API Calls
         ↓
┌──────────────────┐
│  Express Server  │ (Port 3000)
│    (Backend)     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌───────┐  ┌─────────┐
│ Redis │  │ ytdl-   │
│ Queue │  │  core   │
└───┬───┘  └────┬────┘
    │           │
    ↓           ↓
┌─────────┐  ┌──────────┐
│ BullMQ  │  │  Temp    │
│ Worker  │→ │  Files   │
└─────────┘  └──────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: CSS Modules (mobile-first)
- **HTTP Client**: Fetch API
- **Build**: Next.js built-in (webpack)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Job Queue**: BullMQ
- **Cache**: Redis (via ioredis)
- **YouTube**: ytdl-core
- **Rate Limiting**: express-rate-limit

## Data Flow

### 1. URL Analysis Flow
```
User Input (URL)
    ↓
Frontend Validation
    ↓
POST /api/analyze
    ↓
urlValidator.validateYouTubeUrl()
    ↓
youtubeService.getVideoInfo()
    ↓
Return Video Metadata
```

### 2. Download Flow
```
User Click "Download"
    ↓
POST /api/download/{video|audio}
    ↓
Rate Limiting Check
    ↓
jobService.createJob()
    ↓
Add to BullMQ Queue
    ↓
Worker Processes Job
    ↓
youtubeService.download{Video|Audio}()
    ↓
Save to /temp directory
    ↓
Update Job Status
    ↓
Frontend Polls GET /api/job/:jobId
    ↓
Display Download Link
```

### 3. Job Processing Flow
```
Queue: downloads
    ↓
Worker picks job
    ↓
Update status: "processing"
    ↓
Download from YouTube
    ↓
Save to temp directory
    ↓
Update status: "completed"
    ↓
Schedule cleanup (1 hour)
```

## API Endpoints

### Analyze
- **Endpoint**: `POST /api/analyze`
- **Rate Limit**: 10 requests/hour per IP
- **Request**: `{ url: string }`
- **Response**: `{ type: 'video' | 'playlist', video: VideoInfo }`

### Download Video
- **Endpoint**: `POST /api/download/video`
- **Rate Limit**: 10 requests/hour per IP
- **Request**: `{ url: string }`
- **Response**: `{ jobId: string, status: string }`

### Download Audio
- **Endpoint**: `POST /api/download/audio`
- **Rate Limit**: 10 requests/hour per IP
- **Request**: `{ url: string }`
- **Response**: `{ jobId: string, status: string }`

### Playlist ZIP
- **Endpoint**: `POST /api/download/playlist-zip`
- **Rate Limit**: 3 requests/hour per IP
- **Request**: `{ url: string, type: 'video' | 'audio' }`
- **Response**: `{ jobId: string, status: string }`
- **Status**: Not implemented (requires yt-dlp)

### Job Status
- **Endpoint**: `GET /api/job/:jobId`
- **Rate Limit**: None (read-only)
- **Response**: `{ id, type, status, progress, outputPath, filename }`

## Data Models

### Job
```typescript
interface Job {
  id: string;                // UUID
  type: 'video' | 'audio';   // Job type
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;          // 0-100
  data: {
    url: string;
    type: string;
  };
  outputPath?: string;       // /files/{filename}
  filename?: string;         // Sanitized filename
  error?: string;            // Error message if failed
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}
```

### VideoInfo
```typescript
interface VideoInfo {
  id: string;                // YouTube video ID
  title: string;             // Video title
  duration: number;          // Duration in seconds
  thumbnail: string;         // Thumbnail URL
  author: string;            // Channel name
  viewCount: string;         // View count
}
```

## File Structure

```
/temp                        # Temporary downloads
  ├── video_123456.mp4      # Downloaded videos
  └── audio_123456.m4a      # Downloaded audio
```

Files are automatically deleted after 1 hour.

## Security Measures

### 1. Input Validation
- URL format validation (YouTube only)
- No arbitrary URLs allowed
- Sanitized filenames

### 2. Rate Limiting
- General: 10 requests/hour per IP
- Playlist: 3 requests/hour per IP
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining

### 3. Resource Management
- Temp file auto-cleanup (1 hour)
- Job timeout protection
- Memory limits via Node.js

### 4. CORS
- Whitelist frontend URL
- Credentials allowed
- No wildcard origins

## Performance Optimizations

### Frontend
1. **Next.js SSR**: Fast initial load
2. **CSS Modules**: Scoped styles, no conflicts
3. **Font Loading**: Google Fonts preconnect
4. **Mobile-First**: Optimized for primary use case

### Backend
1. **Queue System**: Async processing
2. **Redis**: Fast job storage and retrieval
3. **Static File Serving**: Direct file downloads
4. **Rate Limiting**: Prevent abuse

## Scalability Considerations

### Horizontal Scaling
- Stateless API (can run multiple instances)
- Redis shared queue
- Load balancer ready

### Vertical Scaling
- BullMQ concurrency settings
- Redis memory limits
- File storage capacity

### Future Improvements
1. Use CDN for static files
2. Database for job persistence
3. S3/Cloud storage for downloads
4. Worker auto-scaling
5. Caching layer for video metadata

## Error Handling

### Error Types
1. **Validation Errors** (400): Invalid input
2. **Not Found** (404): Video not available
3. **Forbidden** (403): Private/age-restricted
4. **Too Many Requests** (429): Rate limit exceeded
5. **Server Errors** (500): Processing failures

### Error Response Format
```json
{
  "error": "Human-readable error message"
}
```

## Monitoring & Logging

### Logs (Console)
- Server startup
- Job lifecycle (queued, processing, completed, failed)
- File cleanup
- Errors

### Future Monitoring
- Request metrics
- Job queue length
- Download success rate
- Error rates
- Response times

## Environment Variables

### Backend
```env
PORT=3000                          # Server port
NODE_ENV=development               # Environment
REDIS_HOST=localhost               # Redis host
REDIS_PORT=6379                    # Redis port
RATE_LIMIT_WINDOW_MS=3600000       # Rate limit window (1 hour)
RATE_LIMIT_MAX_REQUESTS=10         # Max requests per window
RATE_LIMIT_PLAYLIST_MAX=3          # Max playlist requests
TEMP_DIR=./temp                    # Temp file directory
MAX_VIDEO_PLAYLIST_SIZE=8          # Max videos in playlist ZIP
MAX_AUDIO_PLAYLIST_SIZE=15         # Max audio in playlist ZIP
FRONTEND_URL=http://localhost:3001 # Frontend URL for CORS
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # Backend API URL
```

## Dependencies

### Backend
- express: Web framework
- cors: CORS middleware
- dotenv: Environment variables
- bullmq: Job queue
- ioredis: Redis client
- express-rate-limit: Rate limiting
- ytdl-core: YouTube downloader
- archiver: ZIP creation
- uuid: Unique IDs
- node-cache: In-memory cache
- nodemon: Dev auto-reload

### Frontend
- react: UI library
- react-dom: React DOM renderer
- next: React framework
- axios: HTTP client (installed but not used)

## Browser Support

### Priority (Mobile-First)
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ✅ Samsung Internet

### Desktop (Secondary)
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Not Supported
- ❌ IE11
- ❌ Legacy browsers

## Deployment Recommendations

### Development
- Use `npm run dev` for hot-reload
- Redis on localhost
- Temp files in local directory

### Production
- Use `npm start` after `npm run build`
- Redis with persistence enabled
- Temp files on mounted volume
- Environment variables via secrets
- HTTPS via reverse proxy (nginx/Caddy)
- Process manager (PM2)

### Infrastructure
- **Minimum**: 1 vCPU, 1GB RAM, 10GB storage
- **Recommended**: 2 vCPU, 2GB RAM, 50GB storage
- **Redis**: 512MB RAM minimum
- **Bandwidth**: 100GB/month (100 users/day)

## License

MIT
