import { FormEvent, useEffect, useMemo, useState } from 'react'
import { APP_CONFIG } from './config'

type Detection = {
  severity: string
  confidence: number
  bbox: number[]
}

type ApiResponse = {
  filename?: string
  count?: number
  detections?: Detection[]
  annotated_image?: string
}

type VideoDetection = {
  frame: number
  severity: string
  confidence: number
  bbox: number[]
}

type VideoApiResponse = {
  filename?: string
  total_frames?: number
  total_detections?: number
  detections?: VideoDetection[]
}

export default function App() {
  const backendUrl = useMemo(() => APP_CONFIG.backendUrl, [])
  const predictImageEndpoint = useMemo(
    () => `${backendUrl.replace(/\/$/, '')}${APP_CONFIG.predictPath}`,
    [backendUrl],
  )
  const predictVideoEndpoint = useMemo(
    () => `${backendUrl.replace(/\/$/, '')}${APP_CONFIG.predictVideoPath}`,
    [backendUrl],
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [videoResult, setVideoResult] = useState<VideoApiResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'image' | 'video'>('image')

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResult(null)
    setVideoResult(null)

    if (!backendUrl) {
      setError('Set VITE_BACKEND_URL before deploying the frontend.')
      return
    }

    if (!file) {
      setError(`Choose a ${mode === 'image' ? 'image' : 'video'} file first.`)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      if (mode === 'image') {
        const response = await fetch(predictImageEndpoint, {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const data = (await response.json()) as ApiResponse
        setResult(data)
      } else {
        const response = await fetch(predictVideoEndpoint, {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const data = (await response.json()) as VideoApiResponse
        setVideoResult(data)
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'The backend request failed.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Infrastructure aware deployment</p>
          <h4>{APP_CONFIG.appTitle}</h4>
          <p className="lede">{APP_CONFIG.appSubtitle}</p>
          <div className="hero-meta">
            <span className="meta-chip">Research workflow</span>
            <span className="meta-chip">Severity stratification</span>
            <span className="meta-chip">Real-time visual audit</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total detections</span>
          <strong>{result?.count ?? 0}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Mean confidence</span>
          <strong>
            {result?.detections?.length
              ? `${(
                  (result.detections.reduce((sum, item) => sum + item.confidence, 0) /
                    result.detections.length) *
                  100
                ).toFixed(1)}%`
              : '0.0%'}
          </strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Major severity count</span>
          <strong>
            {result?.detections?.filter((item) => item.severity.toLowerCase() === 'major').length ?? 0}
          </strong>
        </article>
      </section>

      <section className="workspace">
        <form className="upload-card" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <label>
              <input
                type="radio"
                name="mode"
                value="image"
                checked={mode === 'image'}
                onChange={() => {
                  setMode('image');
                  setFile(null);
                  setResult(null);
                  setVideoResult(null);
                }}
              />{' '}
              Image
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="video"
                checked={mode === 'video'}
                onChange={() => {
                  setMode('video');
                  setFile(null);
                  setResult(null);
                  setVideoResult(null);
                }}
              />{' '}
              Video
            </label>
          </div>
          <label className="file-dropzone" htmlFor="media-upload">
            <span className="drop-title">Select pavement {mode === 'image' ? 'imagery' : 'video'}</span>
            <span className="drop-copy">
              {mode === 'image'
                ? 'Upload JPEG, PNG, or WebP images for inference. Files remain local until submitted.'
                : 'Upload MP4, AVI, or MOV video for inference. Files remain local until submitted.'}
            </span>
            <input
              id="media-upload"
              type="file"
              accept={mode === 'image' ? APP_CONFIG.acceptedImageTypes : APP_CONFIG.acceptedVideoTypes}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="actions-row">
            <button type="submit" disabled={loading}>
              {loading ? 'Running inference...' : 'Run analysis'}
            </button>
            <span className="hint">
              {mode === 'image'
                ? 'Structured output includes severity, confidence, and bounding geometry.'
                : 'Summary output includes per-frame detections.'}
            </span>
          </div>

          {error ? <p className="error-box">{error}</p> : null}
        </form>

        <div className="results-grid">
          <article className="result-card">
            <div className="card-heading">
              <h2>Original</h2>
              <span>{file ? file.name : 'No file selected'}</span>
            </div>
            {previewUrl ? (
              mode === 'image' ? (
                <img className="preview-image" src={previewUrl} alt="Uploaded road surface" />
              ) : (
                <video className="preview-image" src={previewUrl} controls style={{ maxHeight: 320 }} />
              )
            ) : (
              <div className="empty-state">Your selected {mode} will appear here.</div>
            )}
          </article>

          {mode === 'image' ? (
            <article className="result-card">
              <div className="card-heading">
                <h2>Annotated</h2>
                <span>{result?.count ?? 0} findings</span>
              </div>
              {result?.annotated_image ? (
                <img
                  className="preview-image"
                  src={result.annotated_image}
                  alt="Annotated pothole detection output"
                />
              ) : (
                <div className="empty-state">Run detection to see the annotated result.</div>
              )}
            </article>
          ) : null}
        </div>

        <section className="summary-card">
          <div className="card-heading">
            <h2>Detection summary</h2>
            <span>
              {mode === 'image'
                ? result?.filename ?? 'Awaiting input image'
                : videoResult?.filename ?? 'Awaiting input video'}
            </span>
          </div>

          {mode === 'image' ? (
            result?.detections?.length ? (
              <div className="detections-list">
                {result.detections.map((detection, index) => (
                  <div className="detection-item" key={`${detection.severity}-${index}`}>
                    <div>
                      <strong>{detection.severity}</strong>
                      <p>
                        Confidence {(detection.confidence * 100).toFixed(1)}% · Bounding box [{detection.bbox.join(', ')}]
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No detections yet. Upload imagery and run inference.</p>
            )
          ) : (
            videoResult?.detections?.length ? (
              <div className="detections-list">
                <div style={{ marginBottom: 8 }}>
                  <strong>Total frames:</strong> {videoResult.total_frames ?? 0} <br />
                  <strong>Total detections:</strong> {videoResult.total_detections ?? 0}
                </div>
                {videoResult.detections.slice(0, 100).map((detection, index) => (
                  <div className="detection-item" key={`frame-${detection.frame}-${index}`}>
                    <div>
                      <strong>Frame {detection.frame} - {detection.severity}</strong>
                      <p>
                        Confidence {(detection.confidence * 100).toFixed(1)}% · Bounding box [{detection.bbox.join(', ')}]
                      </p>
                    </div>
                  </div>
                ))}
                {videoResult.detections.length > 100 && (
                  <div className="detection-item">...and more</div>
                )}
              </div>
            ) : (
              <p className="empty-copy">No detections yet. Upload video and run inference.</p>
            )
          )}
        </section>
      </section>
    </main>
  )
}