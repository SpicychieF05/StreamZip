import rateLimit from 'express-rate-limit';

const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000, // 1 hour
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const playlistLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000,
    max: parseInt(process.env.RATE_LIMIT_PLAYLIST_MAX) || 3,
    message: {
        error: 'Too many playlist downloads from this IP, please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default generalLimiter;
export { playlistLimiter };
