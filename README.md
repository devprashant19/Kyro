# Kyro — Personal Context Operating System

> **Your AI that never forgets.** Kyro passively learns from everything you read, watch, and work on, then gives you a searchable, graph-connected second brain — accessible anywhere through a dashboard and a browser extension.

[![Live Dashboard](https://img.shields.io/badge/Dashboard-kyro--cognee.vercel.app-blue?style=flat-square&logo=vercel)](https://kyro-cognee.vercel.app)
[![Backend API](https://img.shields.io/badge/API-kyro--api.onrender.com-green?style=flat-square&logo=render)](https://kyro-api.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-puneetnith28%2FKyro-181717?style=flat-square&logo=github)](https://github.com/puneetnith28/Kyro)

---

## 📐 Architecture Overview

Kyro is a **monorepo** with three independent but deeply connected components:

```
Kyro/
├── backend/          # FastAPI Python — intelligence & memory layer
├── dashboard/        # React + Vite — web UI for exploring your knowledge graph
└── extension/        # Chrome Extension (CRXJS + React) — passive context capture
```

### How the data flows

```
Browser (Chrome Extension)
    │
    │  WebSocket (real-time batches)
    ▼
FastAPI Backend (Render)
    │
    ├─► Cognee              — builds & maintains the knowledge graph
    ├─► pgvector (Postgres) — stores vector embeddings for semantic search
    └─► Gemini 2.5 Flash    — powers the AI chat and summarisation
    │
    ▼
Vercel Dashboard (React)
    └─► Fetches /api/* endpoints to render the live feed, graph & chat
```

---

## 🚀 Technology Stack

### Backend (`/backend`)
| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.11) |
| Memory / Graph | [Cognee](https://github.com/topoteretes/cognee) |
| Database | PostgreSQL + `pgvector` |
| LLM | Google Gemini 2.5 Flash |
| Transport | WebSocket (extension → backend) + REST (dashboard → backend) |
| Deployment | Render (Docker) |

### Dashboard (`/dashboard`)
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | TailwindCSS v4 |
| Animations | Framer Motion |
| Graph | XYFlow (React Flow) |
| Auth | Clerk |
| Deployment | Vercel (SPA) |

### Extension (`/extension`)
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite + CRXJS |
| Auth | Clerk Chrome Extension |
| Styling | TailwindCSS v4 |
| Transport | WebSocket + `chrome.storage.local` |

---

## ⚙️ Local Development Setup

### Prerequisites
- **Node.js** v18+
- **Python** 3.11+
- **Docker** (for PostgreSQL + pgvector)
- A **Clerk** account (free tier is fine)
- A **Google Gemini API Key**
- A **Cognee** account or self-hosted instance

### 1. Clone & Install

```bash
git clone https://github.com/puneetnith28/Kyro.git
cd Kyro

# Root workspace
npm install

# Dashboard
cd dashboard && npm install && cd ..

# Extension
cd extension && npm install && cd ..

# Backend
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Environment Variables

Create a `.env` file in the **root** of the monorepo. All three components read from this single file:

```env
# Backend — Core
DATABASE_URL=postgresql://kyro:kyro@localhost:5432/kyro
GEMINI_API_KEY=your_gemini_api_key_here

# Cognee
COGNEE_LLM_PROVIDER=gemini
COGNEE_LLM_MODEL=gemini/gemini-2.5-flash
COGNEE_LLM_API_KEY=your_gemini_api_key_here
COGNEE_VECTOR_DB_PROVIDER=pgvector
COGNEE_VECTOR_DB_URL=postgresql://kyro:kyro@localhost:5432/kyro

# Clerk (shared across dashboard and extension)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# URLs (used by extension to locate backend and dashboard)
VITE_BACKEND_URL=http://localhost:8000
VITE_DASHBOARD_URL=http://localhost:5173
```

### 3. Start the Database

```bash
docker-compose up -d kyro-postgres
```

### 4. Run All Three Dev Servers

From the repo root, a single command starts everything concurrently:

```bash
npm run dev
```

This spins up:
- **Backend** on `http://localhost:8000`
- **Dashboard** on `http://localhost:5173`
- **Extension** build in watch mode (load `extension/dist/` as unpacked in Chrome)

### 5. Load the Extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load Unpacked** → select the `extension/dist/` folder
4. The Kyro icon will appear in your toolbar

---

## 🏗️ How to Implement Each Feature

### Adding a New API Endpoint (Backend)

1. Define the request/response schema in [`backend/app/models/schemas.py`](./backend/app/models/schemas.py)
2. Add the route handler in [`backend/app/api/endpoints.py`](./backend/app/api/endpoints.py)
3. Register it on the router (already mounted at `/api/` in `main.py`)

```python
# schemas.py
class MyRequest(BaseModel):
    query: str

# endpoints.py
@router.post("/my-feature")
async def my_feature(request: MyRequest):
    result = await some_service(request.query)
    return {"result": result}
```

### Adding a New Dashboard Page

1. Create the component in [`dashboard/src/pages/`](./dashboard/src/pages/)
2. Register the route in [`dashboard/src/App.tsx`](./dashboard/src/App.tsx)
3. Add a nav link in [`dashboard/src/components/AppLayout.tsx`](./dashboard/src/components/AppLayout.tsx)

### Adding a New Content Script (Extension)

Content scripts run in the context of web pages. Add them in [`extension/src/content/`](./extension/src/content/) and register in [`extension/manifest.json`](./extension/manifest.json):

```json
"content_scripts": [
  {
    "matches": ["https://my-new-site.com/*"],
    "js": ["src/content/my-new-site.ts"]
  }
]
```

### Sending Data from Extension → Backend

Use the WebSocket managed by [`extension/src/background.ts`](./extension/src/background.ts). Send a message from any content script:

```typescript
chrome.runtime.sendMessage({
  type: "CAPTURE_CONTEXT",
  data: { url, title, text, domain, timestamp }
});
```

---

## 🌐 Deployment

### Backend (Render)
The backend is configured via [`render.yaml`](./render.yaml). Push to `main` and Render auto-deploys the Docker container. Environment variables are set in the Render dashboard.

### Dashboard (Vercel)
Connected to the GitHub repo. Vercel auto-deploys on push to `main`. The [`dashboard/vercel.json`](./dashboard/vercel.json) handles SPA routing rewrites.

### Extension (Production Build)
```bash
cd extension
npm run build
# A production-ready zip is placed at:
# dashboard/public/kyro-extension.zip
# ...and served from the live dashboard for download
```

---

## 🔒 Authentication

All auth is powered by [Clerk](https://clerk.com/). The same Publishable Key is shared by the dashboard and the extension via the `VITE_CLERK_PUBLISHABLE_KEY` environment variable. User sessions are isolated — the extension attaches the Clerk `user_id` to every captured context payload, and the backend uses it for multi-tenant memory separation.

---

## 📄 License

MIT — see [LICENSE](./LICENSE)