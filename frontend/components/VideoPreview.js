import styles from '../styles/VideoPreview.module.css'

export default function VideoPreview({ video, onDownloadVideo, onDownloadAudio, loading }) {
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className={styles.preview}>
            {/* Thumbnail */}
            <div className={styles.thumbnailWrapper}>
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={styles.thumbnail}
                />
                <div className={styles.duration}>
                    {formatDuration(video.duration)}
                </div>
            </div>

            {/* Video Info */}
            <div className={styles.info}>
                <h2 className={styles.title}>{video.title}</h2>
                <p className={styles.author}>{video.author}</p>
            </div>

            {/* Download Buttons */}
            <div className={styles.actions}>
                <button
                    className={styles.primaryButton}
                    onClick={onDownloadVideo}
                    disabled={loading}
                >
                    {loading ? '⏳ Processing...' : '📥 Download Video (MP4)'}
                </button>

                <button
                    className={styles.secondaryButton}
                    onClick={onDownloadAudio}
                    disabled={loading}
                >
                    {loading ? '⏳ Processing...' : '🎵 Download Audio (M4A)'}
                </button>
            </div>
        </div>
    )
}
