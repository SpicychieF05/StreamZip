import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import VideoPreview from '../components/VideoPreview'
import JobProgress from '../components/JobProgress'
import DownloadReady from '../components/DownloadReady'

export default function Home() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [videoData, setVideoData] = useState(null)
    const [currentJob, setCurrentJob] = useState(null)
    const [downloadData, setDownloadData] = useState(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            setUrl(text)
        } catch (err) {
            console.error('Failed to read clipboard:', err)
        }
    }

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError('Please enter a YouTube URL')
            return
        }

        setLoading(true)
        setError('')
        setVideoData(null)

        try {
            const response = await fetch(`${API_URL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze URL')
            }

            if (data.type === 'playlist') {
                setError(data.message)
            } else {
                setVideoData(data)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (type) => {
        setLoading(true)
        setError('')
        setCurrentJob(null)
        setDownloadData(null)

        try {
            const response = await fetch(`${API_URL}/api/download/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start download')
            }

            // Start polling for job status
            setCurrentJob({ jobId: data.jobId, type })
            pollJobStatus(data.jobId)
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    const pollJobStatus = async (jobId) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${API_URL}/api/job/${jobId}`)
                const job = await response.json()

                setCurrentJob(job)

                if (job.status === 'completed') {
                    clearInterval(interval)
                    setLoading(false)
                    setDownloadData({
                        filename: job.filename,
                        downloadUrl: `${API_URL}${job.outputPath}`
                    })
                } else if (job.status === 'failed') {
                    clearInterval(interval)
                    setLoading(false)
                    setError(job.error || 'Download failed')
                }
            } catch (err) {
                clearInterval(interval)
                setLoading(false)
                setError('Failed to check job status')
            }
        }, 2000)

        // Timeout after 5 minutes
        setTimeout(() => {
            clearInterval(interval)
            if (currentJob?.status !== 'completed') {
                setLoading(false)
                setError('Download timeout')
            }
        }, 300000)
    }

    const handleReset = () => {
        setUrl('')
        setVideoData(null)
        setCurrentJob(null)
        setDownloadData(null)
        setError('')
    }

    return (
        <div className={styles.app}>
            <Head>
                <title>StreamZip - YouTube Downloader</title>
                <meta name="description" content="Fast, mobile-first YouTube video and audio downloader" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Logo/Header */}
                    <header className={styles.header}>
                        <h1 className={styles.logo}>StreamZip</h1>
                        <p className={styles.tagline}>Download YouTube videos & audio</p>
                    </header>

                    {/* Error Message */}
                    {error && (
                        <div className={styles.error}>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Download Ready */}
                    {downloadData && (
                        <DownloadReady
                            filename={downloadData.filename}
                            downloadUrl={downloadData.downloadUrl}
                            onNewDownload={handleReset}
                        />
                    )}

                    {/* Job Progress */}
                    {currentJob && !downloadData && (
                        <JobProgress job={currentJob} />
                    )}

                    {/* Video Preview */}
                    {videoData && !currentJob && !downloadData && (
                        <VideoPreview
                            video={videoData.video}
                            onDownloadVideo={() => handleDownload('video')}
                            onDownloadAudio={() => handleDownload('audio')}
                            loading={loading}
                        />
                    )}

                    {/* URL Input - Home Screen */}
                    {!videoData && !currentJob && !downloadData && (
                        <div className={styles.inputSection}>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Paste YouTube URL here"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                />
                                <button
                                    className={styles.pasteButton}
                                    onClick={handlePaste}
                                    type="button"
                                >
                                    📋 Paste
                                </button>
                            </div>

                            <button
                                className={styles.primaryButton}
                                onClick={handleAnalyze}
                                disabled={loading || !url.trim()}
                            >
                                {loading ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                    )}

                    {/* Go Back Button */}
                    {videoData && !currentJob && !downloadData && (
                        <button className={styles.secondaryButton} onClick={handleReset}>
                            ← Back
                        </button>
                    )}
                </div>
            </main>

            <footer className={styles.footer}>
                <p>© 2026 StreamZip | For personal use only</p>
            </footer>
        </div>
    )
}
