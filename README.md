# Pothole Detector

This workspace is split into two deployable parts:

- `backend`: FastAPI service that loads the YOLO model and performs inference. Deploy this on Render.
- `frontend`: React + Vite UI that uploads images and shows annotated results. Deploy this on Vercel.

## Local run

1. Put `YOLOv11s_Pothole_Trained.pt` in `backend/` or point `MODEL_PATH` to its location.
2. Start the backend locally:

   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. Start the frontend locally:

   ```bash
   cd frontend
   npm install
   set VITE_BACKEND_URL=http://localhost:8000
   npm run dev
   ```

## Render deployment

Deploy the backend as a Render Web Service with `backend/` as the root directory.

Use these settings:

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `MODEL_PATH` pointing to the YOLO weights file on Render
  - `FRONTEND_ORIGINS` set to your Vercel domain, for example `https://your-app.vercel.app`

If you want a single source of truth for Render, use the root-level `render.yaml` in this repo.

## Vercel deployment

Deploy the frontend as a Vercel project with `frontend/` as the root directory.

Set this environment variable in Vercel:

- `VITE_BACKEND_URL` set to your Render backend URL, for example `https://your-backend.onrender.com`

Vercel will run `npm run build` automatically for this Vite app.

## Docker Compose

If you have Docker installed, you can run both services together:

```bash
docker compose up --build
```

The frontend runs on port `5173` locally and the backend remains on port `8000`.
