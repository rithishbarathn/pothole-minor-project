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

export default function App() {
  const backendUrl = useMemo(() => APP_CONFIG.backendUrl, [])
  const predictEndpoint = useMemo(
    () => `${backendUrl.replace(/\/$/, '')}${APP_CONFIG.predictPath}`,
    [backendUrl],
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    if (!backendUrl) {
      setError('Set VITE_BACKEND_URL before deploying the frontend.')
      return
    }

    if (!file) {
      setError('Choose an image first.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      const response = await fetch(predictEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = (await response.json()) as ApiResponse
      setResult(data)
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
          <h1>{APP_CONFIG.appTitle}</h1>
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
          <label className="file-dropzone" htmlFor="image-upload">
            <span className="drop-title">Select pavement imagery</span>
            <span className="drop-copy">
              Upload JPEG, PNG, or WebP images for inference. Files remain local until submitted.
            </span>
            <input
              id="image-upload"
              type="file"
              accept={APP_CONFIG.acceptedImageTypes}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="actions-row">
            <button type="submit" disabled={loading}>
              {loading ? 'Running inference...' : 'Run analysis'}
            </button>
            <span className="hint">Structured output includes severity, confidence, and bounding geometry.</span>
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
              <img className="preview-image" src={previewUrl} alt="Uploaded road surface" />
            ) : (
              <div className="empty-state">Your selected image will appear here.</div>
            )}
          </article>

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
        </div>

        <section className="summary-card">
          <div className="card-heading">
            <h2>Detection summary</h2>
            <span>{result?.filename ?? 'Awaiting input image'}</span>
          </div>

          {result?.detections?.length ? (
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
          )}
        </section>
      </section>
    </main>
  )
}