import ytdl from 'ytdl-core';
import { AppError } from '../utils/errorHandler.js';

class YouTubeService {
    async getVideoInfo(url) {
        try {
            if (!ytdl.validateURL(url)) {
                throw new AppError('Invalid YouTube URL', 400);
            }

            const info = await ytdl.getInfo(url);
            const videoDetails = info.videoDetails;

            return {
                id: videoDetails.videoId,
                title: videoDetails.title,
                duration: parseInt(videoDetails.lengthSeconds),
                thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url || '',
                author: videoDetails.author.name,
                viewCount: videoDetails.viewCount
            };
        } catch (error) {
            if (error.statusCode === 410) {
                throw new AppError('Video not available', 404);
            }
            if (error.message.includes('private')) {
                throw new AppError('Private video cannot be accessed', 403);
            }
            if (error.message.includes('age')) {
                throw new AppError('Age-restricted video cannot be downloaded', 403);
            }
            throw new AppError(error.message || 'Failed to fetch video info', 500);
        }
    }

    async getPlaylistInfo(playlistId) {
        // Note: ytdl-core doesn't support playlists directly
        // For MVP, we'll use a simplified approach or need yt-dlp
        throw new AppError('Playlist support requires yt-dlp installation', 501);
    }

    async downloadVideo(url, outputPath, quality = '720p') {
        try {
            const format = ytdl.chooseFormat(await ytdl.getInfo(url), {
                quality: 'highestvideo',
                filter: 'videoandaudio'
            });

            return new Promise((resolve, reject) => {
                const stream = ytdl(url, { format });
                const writeStream = require('fs').createWriteStream(outputPath);

                stream.pipe(writeStream);

                stream.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('finish', () => resolve(outputPath));
            });
        } catch (error) {
            throw new AppError('Failed to download video: ' + error.message, 500);
        }
    }

    async downloadAudio(url, outputPath) {
        try {
            return new Promise((resolve, reject) => {
                const stream = ytdl(url, {
                    quality: 'highestaudio',
                    filter: 'audioonly'
                });
                const writeStream = require('fs').createWriteStream(outputPath);

                stream.pipe(writeStream);

                stream.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('finish', () => resolve(outputPath));
            });
        } catch (error) {
            throw new AppError('Failed to download audio: ' + error.message, 500);
        }
    }
}

export default new YouTubeService();
