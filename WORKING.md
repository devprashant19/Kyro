# Kyro — How It Works

A technical deep-dive into the complete workflow, data lifecycle, system design, and future roadmap of Kyro.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [End-to-End Capture Workflow](#2-end-to-end-capture-workflow)
3. [Memory & Knowledge Graph](#3-memory--knowledge-graph)
4. [AI Chat (RAG Pipeline)](#4-ai-chat-rag-pipeline)
5. [Authentication & Multi-Tenancy](#5-authentication--multi-tenancy)
6. [Live Feed & WebSocket Architecture](#6-live-feed--websocket-architecture)
7. [Privacy & Capture Controls](#7-privacy--capture-controls)
8. [Dashboard Feature Walkthrough](#8-dashboard-feature-walkthrough)
9. [Extension Feature Walkthrough](#9-extension-feature-walkthrough)
10. [Future Scope](#10-future-scope)

---

## 1. System Overview

Kyro is made up of three independently-deployed services that communicate over HTTPS/WebSocket:

```
┌──────────────────────────────────────────────────────┐
│                  BROWSER (Chrome)                    │
│                                                      │
│  ┌─────────────────┐      ┌──────────────────────┐  │
│  │  Kyro Extension │      │  Kyro Dashboard Tab  │  │
│  │  (Popup + CS)   │      │  (kyro-cognee.vercel)│  │
│  └────────┬────────┘      └──────────┬───────────┘  │
│           │ WebSocket                │ REST API      │
└───────────┼──────────────────────────┼──────────────┘
            │                          │
            ▼                          ▼
┌───────────────────────────────────────────────────────┐
│            Kyro Backend (kyro-api.onrender.com)       │
│                                                       │
│   FastAPI  ──►  Cognee  ──►  pgvector (PostgreSQL)   │
│                         ──►  Gemini 2.5 Flash         │
└───────────────────────────────────────────────────────┘
```

---

## 2. End-to-End Capture Workflow

### Passive Capture (Auto)

The extension's content scripts run silently on every page the user visits. A capture is only triggered when **genuine engagement** is proven:

```
User visits a page
    │
    ▼
Content script starts an engagement timer (15 seconds in demo, 120s in prod)
    │
    ▼
Engagement timer tracks: scroll, mousemove, keydown events
    │
    ▼
If user actively engaged for required time?
    │   YES ──► Check Privacy Blocklist (chrome.storage.local)
    │                │
    │                └──► Domain NOT blocked?
    │                         │   YES ──► captureContext() fires
    │                         │
    │                         └──► Domain IS blocked ──► Silently skip
    │
    │   NO ──► Wait another second, retry
    │
    ▼
captureContext() extracts:
  - URL, Title, Domain
  - Readable page text (via document.body.innerText, capped at 3000 chars)
  - Timestamp
  - User metadata (Clerk user_id)
    │
    ▼
Send message to background.ts: { type: "CAPTURE_CONTEXT", data: payload }
```

### Manual Capture (Hotkey)

Users can also manually save any highlighted text using a configurable hotkey (default: `Alt + C`):

```
User highlights text → presses hotkey
    │
    ▼
Content script detects hotkey combo from chrome.storage.local
    │
    ▼
Sends { type: "CAPTURE_CONTEXT", data: { text: selectedText, ... } } to background
    │
    ▼
Visual toast "✨ Captured to Kyro!" shown to user
```

### Background Script Queue & WebSocket

The `background.ts` service worker manages a persistent queue to ensure no captures are lost even if the WebSocket is temporarily down:

```
Message arrives in background.ts
    │
    ▼
Payload summarized (title truncated, text capped)
Metadata stamped: { deviceId, source, capture_type }
    │
    ▼
captureQueue.push(payload)
saveQueueToStorage()      ← persisted in chrome.storage.local
    │
    ▼
WebSocket connected?
    │   YES ──► flushQueue() → send all queued items as a BATCH message
    │   NO  ──► connectWebSocket() → retry, then flushQueue() after 1s
    │
    ▼
Backend acknowledges: { status: "success" }
captureQueue cleared
```

---

## 3. Memory & Knowledge Graph

Once a capture arrives at the backend, it goes through the Cognee pipeline:

```
POST /capture  (or  WebSocket BATCH)
    │
    ▼
persist_capture(payload)
    → Writes raw capture to PostgreSQL (for recent feed & audit trail)
    │
    ▼
add_memory(payload)
    → Calls Cognee's add() API
    → Cognee chunks and tokenizes the text
    → Generates vector embeddings via Gemini
    → Stores embeddings in pgvector
    → Builds / updates the knowledge graph:
          Entity nodes (people, concepts, URLs)
          Relationship edges (learned from, similar to, references)
    │
    ▼
Scheduled: prune_stale_memories()
    → Runs every 24h via a Cognee alarm
    → Removes nodes not accessed in 30 days
    → Prunes weak relationships (below threshold)
```

### Graph Visualization

The Dashboard's **Graph** page calls `GET /api/graph`, which:
1. Queries all Cognee nodes for the current user
2. Maps them to XYFlow `Node` and `Edge` objects
3. Applies a **spiral layout algorithm** to position nodes aesthetically
4. Returns the result for the React Flow canvas to render

---

## 4. AI Chat (RAG Pipeline)

The chat on the Dashboard is a full **Retrieval-Augmented Generation** pipeline:

```
User sends a message
    │
    ▼
POST /api/chat  { messages: [...], user_id: "..." }
    │
    ▼
search_memories(query, user_id)
    → Embeds the query using Gemini embeddings
    → Runs vector similarity search in pgvector
    → Returns top-K matching memory chunks
    │
    ▼
Build prompt:
    "You are Kyro, a personal AI assistant.
     Here is context from the user's memory:
     [retrieved chunks]
     
     Now answer: [user question]"
    │
    ▼
Gemini 2.5 Flash generates the response
    │
    ▼
Return { answer, sources: [urls], related_memories: [...] }
```

---

## 5. Authentication & Multi-Tenancy

Kyro uses [Clerk](https://clerk.com/) for auth across all surfaces.

| Surface | How Auth Works |
|---|---|
| **Dashboard** | `@clerk/clerk-react` — JWT issued by Clerk, stored in browser |
| **Extension** | `@clerk/chrome-extension` — same Clerk key, JWT in `chrome.storage` |
| **Backend** | All API calls include `user_id` in the request body |

Every memory stored in Cognee is tagged with `user_id`. Searches always filter by `user_id`, so memories from one user can never leak to another.

> **Future:** Replace manual `user_id` passing with JWT verification on the backend using `clerk.verifyToken()` for true cryptographic isolation.

---

## 6. Live Feed & WebSocket Architecture

The **Live Feed** on the dashboard and extension popup shows captures in real-time:

```
Extension establishes WebSocket to wss://kyro-api.onrender.com/api/ws/capture
    │
    ▼
On successful capture, sends JSON batch:
    { type: "BATCH", payloads: [...] }
    │
    ▼
Backend inserts each payload into recent_captures[]  (hot in-memory cache, max 50)
Also writes to PostgreSQL for persistence
    │
    ▼
Dashboard polls GET /api/recent every 5 seconds
Extension popup polls GET /api/recent every 3 seconds
    │
    ▼
Both display latest captures as a live feed
```

If the server restarts and `recent_captures[]` is cleared, `GET /api/recent` falls back to querying PostgreSQL for the last 50 records.

---

## 7. Privacy & Capture Controls

Kyro never captures from domains on your personal blocklist. The blocklist is stored in `chrome.storage.local` and checked before every capture event.

### Current Implementation
- Blocklist lives **in the extension** (chrome.storage.local)
- Users add/remove domains via the **Dashboard** (planned — see Future Scope)
- The extension's content scripts check the list synchronously on every potential capture

### How the Check Works
```typescript
function shouldCapture(hostname: string, blocklist: string[]): boolean {
  return !blocklist.some(d => hostname.includes(d));
}
// Returns false (blocks) if the hostname matches any blocked domain
```

### Planned: Dashboard Blocklist Management (Future Scope)
The full implementation plan is to add a **Privacy Settings** page on the dashboard where users can manage their blocklist. When a domain is added/removed, the dashboard will dispatch a `window.postMessage` to the extension, which will intercept it and update `chrome.storage.local` without requiring any manual interaction with the extension popup.

---

## 8. Dashboard Feature Walkthrough

| Page | What It Does |
|---|---|
| **Overview** (`/app`) | Live Feed of all recent captures, real-time as they come in |
| **Dashboard** (`/app/dashboard`) | AI Chat interface with your personal knowledge base |
| **Extension** (`/app/extension`) | Download the Chrome extension; links to GitHub |

### Overview Page
- Polls `GET /api/recent` every 5s
- Renders each capture as a card with title, domain, snippet, and a "View Source" link
- Animated entry using Framer Motion

### Dashboard (Chat) Page
- Full conversational interface
- Sends `POST /api/chat` on each user message
- Displays source URLs and related memories inline with the response
- Renders the knowledge graph via `GET /api/graph`

---

## 9. Extension Feature Walkthrough

| Section | What It Does |
|---|---|
| **Header** | Shows Kyro logo, Active/Paused toggle, Sign Out |
| **Connection** | Pings `/health` every 3s; shows live sync animation |
| **Capture Hotkey** | Configurable keyboard shortcut for manual text capture |
| **Recent Context** | Last 5 items from the live feed; click to open source URL |
| **Historical Sync** | Upload a ChatGPT `conversations.json` to backfill your brain |
| **Footer** | Quick links to Dashboard and Graph Pruning status |

### Site-Specific Content Scripts
Kyro has dedicated scripts for major platforms that extract richer content:

| Script | Site | What It Extracts |
|---|---|---|
| `index.ts` | All sites | Generic page text, engagement-gated |
| `chatgpt.ts` | chat.openai.com | Full conversation history |
| `claude.ts` | claude.ai | Full conversation history |
| `gemini.ts` | gemini.google.com | Conversation turns |
| `github.ts` | github.com | PR/Issue body + comments |
| `search.ts` | google.com | Search query + top results |
| `perplexity.ts` | perplexity.ai | Query + AI answer |

---

## 10. Future Scope

The following features are planned for future iterations of Kyro. They are intentionally out of scope for the current version.

### 🔜 Near-Term (v1.1)

- **Dashboard Blocklist Management**  
  Move the Privacy Controls UI from the extension popup to a full Settings page on the web dashboard. The dashboard will use `window.postMessage` to sync the blocklist to the extension in real-time. This is cleaner UX than managing a list in a 400px popup.

- **JWT Verification on Backend**  
  Currently, `user_id` is passed in the request body (trust the client). Replace this with Clerk's `verifyToken()` middleware on FastAPI so the backend cryptographically validates who is making the request.

- **Cross-Device Sync**  
  Store the blocklist, hotkey preferences, and active/paused state in the backend database (PostgreSQL) instead of `chrome.storage.local` so they sync across the user's devices.

- **Real-Time Dashboard Updates (WebSocket)**  
  Replace the 5-second polling on the dashboard with a WebSocket connection so the Live Feed updates instantly the moment a capture arrives.

### 🔮 Mid-Term (v1.2 – v1.5)

- **Proactive Memory Nudges**  
  When a user is browsing a topic related to something in their memory graph, the extension proactively surfaces a small, non-intrusive nudge: "You read something related to this 3 weeks ago — recall it?"

- **Semantic Search Bar**  
  A global search on the dashboard that searches across all memories using vector similarity (not just keyword), so users can find things they half-remember.

- **Firefox Support**  
  Port the Chrome Extension to Firefox using the WebExtensions polyfill.

- **Memory Expiry Controls**  
  Let users set a personal data retention policy (e.g., "forget everything older than 90 days automatically") directly from the dashboard.

- **Team Workspaces**  
  Allow a shared Kyro workspace for teams — so when one team member captures a useful resource, others on the team can benefit from it (with permission controls).

### 🚀 Long-Term (v2.0+)

- **Native Desktop App (Electron/Tauri)**  
  A native companion app that can capture context from desktop apps (VS Code, Figma, Slack) not just browsers, using OS-level accessibility APIs.

- **Offline-First Mode**  
  Run a local LLM (e.g., Ollama with Gemma or LLaMA) for users who don't want their data leaving their machine. Kyro becomes 100% local.

- **Spaced Repetition / Learning Layer**  
  Integrate a spaced repetition engine so Kyro doesn't just store knowledge — it helps you genuinely remember it through periodic review cards surfaced in the dashboard.

- **Voice Capture**  
  A hotkey that opens a microphone and uses Gemini's audio capabilities to transcribe and capture spoken notes into the memory graph.

- **Plugin/Integration Ecosystem**  
  Open up the `/capture` endpoint with a published API so third-party tools (Notion, Obsidian, Readwise) can push content directly into your Kyro brain.

- **Graph Reasoning (Agentic)**  
  Move beyond RAG retrieval into multi-hop graph reasoning — where Kyro can traverse its knowledge graph to infer connections the user has never explicitly stated.

---

*Last updated: July 2026*
