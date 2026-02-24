import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { validateYouTubeUrl, isPlaylistUrl } from '../utils/urlValidator.js';
import youtubeService from '../services/youtubeService.js';

const router = express.Router();

// POST /api/analyze
router.post('/', asyncHandler(async (req, res) => {
    const { url } = req.body;

    // Validate URL
    const validation = validateYouTubeUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    // Check if playlist or single video
    const isPlaylist = isPlaylistUrl(url);

    if (isPlaylist) {
        // For MVP, we'll return a message that playlist support is limited
        // In production, you'd use yt-dlp to get playlist info
        return res.json({
            type: 'playlist',
            message: 'Playlist detected. Playlist support requires yt-dlp installation.',
            url
        });
    }

    // Get single video info
    const videoInfo = await youtubeService.getVideoInfo(url);

    res.json({
        type: 'video',
        video: videoInfo,
        url
    });
}));

export default router;
