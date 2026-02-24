import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { getJob } from '../services/jobService.js';

const router = express.Router();

// GET /api/job/:jobId
router.get('/:jobId', asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const job = getJob(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        outputPath: job.outputPath,
        filename: job.filename,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
    });
}));

export default router;
