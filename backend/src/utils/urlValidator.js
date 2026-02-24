export const validateYouTubeUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required' };
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

    if (!youtubeRegex.test(url)) {
        return { valid: false, error: 'Invalid YouTube URL' };
    }

    return { valid: true };
};

export const isPlaylistUrl = (url) => {
    return url.includes('list=') || url.includes('playlist?');
};

export const extractVideoId = (url) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&]+)/,
        /(?:youtu\.be\/)([^?]+)/,
        /(?:youtube\.com\/embed\/)([^?]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
};

export const extractPlaylistId = (url) => {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
};
