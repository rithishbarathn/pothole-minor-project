interface ImportMetaEnv {
	readonly VITE_APP_TITLE?: string
	readonly VITE_APP_SUBTITLE?: string
	readonly VITE_FRONTEND_LABEL?: string
	readonly VITE_BACKEND_LABEL?: string
	readonly VITE_BACKEND_URL?: string
	readonly VITE_PREDICT_PATH?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}