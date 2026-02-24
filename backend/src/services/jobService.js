import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import youtubeService from './youtubeService.js';
import archiver from 'archiver';

const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
});

// Create download queue
export const downloadQueue = new Queue('downloads', { connection });

// Job storage (in-memory for MVP, should use Redis/DB in production)
const jobs = new Map();

export const createJob = (type, data) => {
    const jobId = uuidv4();
    const job = {
        id: jobId,
        type,
        status: 'queued',
        progress: 0,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    jobs.set(jobId, job);

    // Add to queue
    downloadQueue.add(type, { jobId, ...data }, {
        jobId,
        removeOnComplete: false,
        removeOnFail: false
    });

    return job;
};

export const getJob = (jobId) => {
    return jobs.get(jobId);
};

export const updateJob = (jobId, updates) => {
    const job = jobs.get(jobId);
    if (job) {
        const updated = {
            ...job,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        jobs.set(jobId, updated);
        return updated;
    }
    return null;
};

// Worker to process downloads
const worker = new Worker('downloads', async (job) => {
    const { jobId, url, type } = job.data;

    updateJob(jobId, { status: 'processing', progress: 10 });

    try {
        const tempDir = process.env.TEMP_DIR || './temp';
        let outputPath;
        let filename;

        if (type === 'video') {
            const videoInfo = await youtubeService.getVideoInfo(url);
            filename = `${sanitizeFilename(videoInfo.title)}_${Date.now()}.mp4`;
            outputPath = path.join(tempDir, filename);

            updateJob(jobId, { progress: 30 });

            await youtubeService.downloadVideo(url, outputPath);

            updateJob(jobId, {
                status: 'completed',
                progress: 100,
                outputPath: `/files/${filename}`,
                filename
            });

        } else if (type === 'audio') {
            const videoInfo = await youtubeService.getVideoInfo(url);
            filename = `${sanitizeFilename(videoInfo.title)}_${Date.now()}.m4a`;
            outputPath = path.join(tempDir, filename);

            updateJob(jobId, { progress: 30 });

            await youtubeService.downloadAudio(url, outputPath);

            updateJob(jobId, {
                status: 'completed',
                progress: 100,
                outputPath: `/files/${filename}`,
                filename
            });
        }

        // Auto-cleanup after 1 hour
        setTimeout(() => {
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
                console.log(`🗑️  Cleaned up: ${filename}`);
            }
        }, 3600000);

    } catch (error) {
        console.error('Job error:', error);
        updateJob(jobId, {
            status: 'failed',
            error: error.message,
            progress: 0
        });
        throw error;
    }
}, { connection });

worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});

// Helper function to sanitize filename
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .substring(0, 50);
}

// Cleanup old jobs every hour
setInterval(() => {
    const oneHourAgo = Date.now() - 3600000;
    for (const [jobId, job] of jobs.entries()) {
        if (new Date(job.createdAt).getTime() < oneHourAgo) {
            jobs.delete(jobId);
        }
    }
}, 3600000);

export default { downloadQueue, createJob, getJob, updateJob };
