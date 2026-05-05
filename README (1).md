# 🕳️ Pothole Detector

<div align="center">

![Pothole Detector Banner](https://img.shields.io/badge/Pothole-Detector-FF4444?style=for-the-badge&logo=opencv&logoColor=white)

**AI-powered pothole detection using YOLOv11 — helping communities report and fix road damage faster.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-00C853?style=for-the-badge)](https://pothole-minor-project.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![YOLOv11](https://img.shields.io/badge/YOLOv11-FF6F00?style=for-the-badge&logo=pytorch&logoColor=white)](https://ultralytics.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

</div>

---

## 📌 About

**Pothole Detector** is an open-source web application that uses a trained **YOLOv11** object detection model to automatically detect potholes in road images. Upload a photo, and the app will annotate and highlight all detected potholes in seconds.

This project was built to address a real community problem — road damage reporting is slow and manual. With this tool, citizens, municipal workers, or road safety teams can quickly analyze road conditions using just a smartphone photo.

---

## ✨ Features

- 🔍 **Real-time Pothole Detection** — Powered by a custom-trained YOLOv11s model
- 🖼️ **Annotated Output** — Returns the image with bounding boxes drawn around detected potholes
- ⚡ **Fast Inference** — Optimized FastAPI backend for low-latency predictions
- 🌐 **Fully Deployed** — Frontend on Vercel, Backend on Render
- 🐳 **Docker Support** — Run the entire stack locally with one command
- 📱 **Responsive UI** — Works on desktop and mobile browsers

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | FastAPI (Python) |
| ML Model | YOLOv11s (Ultralytics) |
| Deployment | Vercel (frontend) + Render (backend) |
| Containerization | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- `YOLOv11s_Pothole_Trained.pt` model weights (place in `backend/`)

### 1. Clone the repository
```bash
git clone https://github.com/rithishbarathn/pothole-minor-project.git
cd pothole-minor-project
```

### 2. Run with Docker (Recommended)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

### 3. Run manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
set VITE_BACKEND_URL=http://localhost:8000   # Windows
# export VITE_BACKEND_URL=http://localhost:8000  # Mac/Linux
npm run dev
```

---

## ☁️ Deployment

### Backend → Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Set root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables:
   - `MODEL_PATH` → path to your YOLO weights file
   - `FRONTEND_ORIGINS` → your Vercel domain (e.g., `https://your-app.vercel.app`)

Or use the root-level `render.yaml` for one-click deploy.

### Frontend → Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend/`
3. Set environment variable:
   - `VITE_BACKEND_URL` → your Render backend URL

---

## 📂 Project Structure

```
pothole-minor-project/
├── backend/
│   ├── main.py               # FastAPI app + YOLO inference
│   ├── requirements.txt
│   └── YOLOv11s_Pothole_Trained.pt   # Model weights (not tracked)
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   └── ...
│   └── package.json
├── docker-compose.yml
├── render.yaml
├── vercel.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a new branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -m 'Add some feature'`)
4. **Push** to the branch (`git push origin feature/your-feature`)
5. **Open a Pull Request**

### Ideas for contribution
- [ ] Add video/webcam support for real-time detection
- [ ] Add severity scoring for detected potholes (small/medium/large)
- [ ] Export detected results as a CSV/PDF report
- [ ] Add map integration to geo-tag pothole locations
- [ ] Improve model accuracy with more training data
- [ ] Add multi-language support for the UI

---

## 🐛 Found a Bug?

Open an [issue](https://github.com/rithishbarathn/pothole-minor-project/issues) with:
- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Rithish Barathn**
- GitHub: [@rithishbarathn](https://github.com/rithishbarathn)

---

<div align="center">

⭐ **If this project helped you, please give it a star!** ⭐

*Built with ❤️ to make roads safer for everyone.*

</div>
