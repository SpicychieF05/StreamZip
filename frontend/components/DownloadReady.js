import styles from '../styles/DownloadReady.module.css'

export default function DownloadReady({ filename, downloadUrl, onNewDownload }) {
    return (
        <div className={styles.ready}>
            <div className={styles.icon}>✅</div>

            <h2 className={styles.title}>Download Ready!</h2>

            <p className={styles.filename}>{filename}</p>

            <div className={styles.actions}>
                <a
                    href={downloadUrl}
                    download
                    className={styles.downloadButton}
                >
                    ⬇️ Download File
                </a>

                <button
                    className={styles.newDownloadButton}
                    onClick={onNewDownload}
                >
                    ➕ New Download
                </button>
            </div>

            <p className={styles.note}>
                💡 File will be available for 1 hour
            </p>
        </div>
    )
}
