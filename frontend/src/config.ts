type Environment = Record<string, string | undefined>

const env = import.meta.env as Environment

function read(key: string, fallback: string): string {
  const value = env[key]?.trim()
  return value && value.length > 0 ? value : fallback
}

export const APP_CONFIG = {
  appTitle: read('VITE_APP_TITLE', 'Road Surface Distress Analysis Console'),
  appSubtitle: read(
    'VITE_APP_SUBTITLE',
    'Upload roadway imagery, execute pothole inference, and review structured severity outputs.',
  ),
  frontendLabel: read('VITE_FRONTEND_LABEL', 'Vercel'),
  backendLabel: read('VITE_BACKEND_LABEL', 'Render'),
  backendUrl: read('VITE_BACKEND_URL', ''),
  predictPath: read('VITE_PREDICT_PATH', '/predict-image'),
  acceptedImageTypes: 'image/png,image/jpeg,image/webp',
} as const