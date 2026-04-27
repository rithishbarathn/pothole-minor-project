import { FormEvent, useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "./config";

type Detection = {
  severity: string;
  confidence: number;
  bbox: number[];
};

type ApiResponse = {
  filename?: string;
  count?: number;
  detections?: Detection[];
  annotated_image?: string;
};

type VideoDetection = {
  frame: number;
  severity: string;
  confidence: number;
  bbox: number[];
};

type VideoApiResponse = {
  filename?: string;
  total_frames?: number;
  total_detections?: number;
  detections?: VideoDetection[];
};

export default function App() {
  const backendUrl = useMemo(() => APP_CONFIG.backendUrl, []);
  const predictImageEndpoint = useMemo(
    () => `${backendUrl.replace(/\/$/, "")}${APP_CONFIG.predictPath}`,
    [backendUrl]
  );
  const predictVideoEndpoint = useMemo(
    () => `${backendUrl.replace(/\/$/, "")}${APP_CONFIG.predictVideoPath}`,
    [backendUrl]
  );

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [videoResult, setVideoResult] = useState<VideoApiResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"image" | "video">("image");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setVideoResult(null);

    if (!backendUrl) {
      setError("Set VITE_BACKEND_URL before deploying the frontend.");
      return;
    }

    if (!file) {
      setError(`Choose a ${mode === "image" ? "image" : "video"} file first.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      if (mode === "image") {
        const response = await fetch(predictImageEndpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as ApiResponse;
        setResult(data);
      } else {
        const response = await fetch(predictVideoEndpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as VideoApiResponse;
        setVideoResult(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The backend request failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Infrastructure aware deployment</p>
          <h4>{APP_CONFIG.appTitle}</h4>
          <p className="lede">{APP_CONFIG.appSubtitle}</p>
        </div>
      </section>

      <section className="workspace">
        <form className="upload-card" onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <label>
              <input
                type="radio"
                checked={mode === "image"}
                onChange={() => {
                  setMode("image");
                  setFile(null);
                }}
              />
              Image
            </label>

            <label>
              <input
                type="radio"
                checked={mode === "video"}
                onChange={() => {
                  setMode("video");
                  setFile(null);
                }}
              />
              Video
            </label>
          </div>

          <input
            type="file"
            accept={
              mode === "image"
                ? APP_CONFIG.acceptedImageTypes
                : APP_CONFIG.acceptedVideoTypes
            }
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Run Detection"}
          </button>

          {error && <p>{error}</p>}
        </form>

        <div>
          {previewUrl &&
            (mode === "image" ? (
              <img src={previewUrl} />
            ) : (
              <video src={previewUrl} controls />
            ))}
        </div>

        {mode === "image" && result?.annotated_image && (
          <img src={result.annotated_image} />
        )}
      </section>
    </main>
  );
}