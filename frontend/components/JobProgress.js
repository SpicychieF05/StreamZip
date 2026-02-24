import styles from '../styles/JobProgress.module.css'

export default function JobProgress({ job }) {
    const getStatusText = () => {
        switch (job.status) {
            case 'queued':
                return 'Waiting in queue...'
            case 'processing':
                return 'Processing your download...'
            case 'completed':
                return 'Download completed!'
            case 'failed':
                return 'Download failed'
            default:
                return 'Processing...'
        }
    }

    const getStatusEmoji = () => {
        switch (job.status) {
            case 'queued':
                return '⏳'
            case 'processing':
                return '⚙️'
            case 'completed':
                return '✅'
            case 'failed':
                return '❌'
            default:
                return '⏳'
        }
    }

    return (
        <div className={styles.progress}>
            <div className={styles.icon}>
                {getStatusEmoji()}
            </div>

            <h2 className={styles.status}>{getStatusText()}</h2>

            {/* Progress Bar */}
            {job.status === 'processing' && (
                <div className={styles.progressBarContainer}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${job.progress || 0}%` }}
                    />
                </div>
            )}

            {/* Progress Percentage */}
            {job.status === 'processing' && (
                <p className={styles.percentage}>{job.progress || 0}%</p>
            )}

            {/* Spinner */}
            {(job.status === 'queued' || job.status === 'processing') && (
                <div className={styles.spinner} />
            )}
        </div>
    )
}
