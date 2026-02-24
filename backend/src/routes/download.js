import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { validateYouTubeUrl } from '../utils/urlValidator.js';
import { createJob } from '../services/jobService.js';
import { playlistLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/download/video
router.post('/video', asyncHandler(async (req, res) => {
    const { url } = req.body;

    // Validate URL
    const validation = validateYouTubeUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    // Create download job
    const job = createJob('video', { url, type: 'video' });

    res.json({
        jobId: job.id,
        status: job.status,
        message: 'Video download started'
    });
}));

// POST /api/download/audio
router.post('/audio', asyncHandler(async (req, res) => {
    const { url } = req.body;

    // Validate URL
    const validation = validateYouTubeUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    // Create download job
    const job = createJob('audio', { url, type: 'audio' });

    res.json({
        jobId: job.id,
        status: job.status,
        message: 'Audio download started'
    });
}));

// POST /api/download/playlist-zip (with stricter rate limiting)
router.post('/playlist-zip', playlistLimiter, asyncHandler(async (req, res) => {
    const { url, type = 'video' } = req.body;

    // Validate URL
    const validation = validateYouTubeUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    res.status(501).json({
        error: 'Playlist ZIP download requires yt-dlp installation',
        message: 'This feature is coming soon'
    });
}));

export default router;
