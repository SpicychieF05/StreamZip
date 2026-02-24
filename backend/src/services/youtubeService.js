import YTDlpWrap from 'yt-dlp-wrap';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class YouTubeService {
    constructor() {
        // Initialize yt-dlp wrapper with the downloaded binary path
        const ytDlpPath = path.join(__dirname, '../../bin/yt-dlp.exe');
        this.ytDlp = new YTDlpWrap.default(ytDlpPath);
    }

    async getVideoInfo(url) {
        try {
            // Basic URL validation
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
            if (!youtubeRegex.test(url)) {
                throw new AppError('Invalid YouTube URL', 400);
            }

            // Get video info using yt-dlp
            const info = await this.ytDlp.getVideoInfo(url);

            return {
                id: info.id,
                title: info.title,
                duration: parseInt(info.duration || 0),
                thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || '',
                author: info.uploader || info.channel || 'Unknown',
                viewCount: info.view_count || 0
            };
        } catch (error) {
            console.error('getVideoInfo error:', error);
            if (error.message && error.message.includes('Video unavailable')) {
                throw new AppError('Video not available', 404);
            }
            if (error.message && error.message.includes('Private video')) {
                throw new AppError('Private video cannot be accessed', 403);
            }
            if (error.message && error.message.includes('age')) {
                throw new AppError('Age-restricted video cannot be downloaded', 403);
            }
            throw new AppError(error.message || 'Failed to fetch video info', 500);
        }
    }

    async getPlaylistInfo(playlistId) {
        // yt-dlp supports playlists
        throw new AppError('Playlist support coming soon', 501);
    }

    async downloadVideo(url, outputPath, quality = '720p') {
        try {
            // Use yt-dlp to download video with audio
            // Prefer pre-merged formats to avoid needing FFmpeg
            await this.ytDlp.execPromise([
                url,
                '-f', 'best[ext=mp4]/best',
                '-o', outputPath,
                '--no-playlist',
                '--no-warnings',
                '--no-check-certificate'
            ]);

            return outputPath;
        } catch (error) {
            console.error('downloadVideo error:', error);
            throw new AppError('Failed to download video: ' + error.message, 500);
        }
    }

    async downloadAudio(url, outputPath) {
        try {
            // Use yt-dlp to download audio only
            await this.ytDlp.execPromise([
                url,
                '-f', 'bestaudio[ext=m4a]/bestaudio',
                '-o', outputPath,
                '--no-playlist',
                '--no-warnings',
                '--no-check-certificate'
            ]);

            return outputPath;
        } catch (error) {
            console.error('downloadAudio error:', error);
            throw new AppError('Failed to download audio: ' + error.message, 500);
        }
    }
}

export default new YouTubeService();
