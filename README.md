# AI Resume Enhancer & Interview Preparation

Full-stack AI project built with Next.js, Express.js, LangChain, RAG, and Vector DB (ChromaDB).

## Tech Stack

**Frontend:** Next.js 14, React 18, Tailwind CSS, Lucide Icons  
**Backend:** Node.js, Express.js, LangChain, ChromaDB  
**AI:** Anthropic Claude (claude-opus-4-5), RAG Pipeline  

## Features

- **Resume Enhancement** — AI rewrites your bullets with ATS optimization, keyword alignment, and impact scoring
- **Interview Q&A Generator** — Personalized technical, behavioral, and situational questions with sample answers
- **AI Career Coach Chat** — Conversational assistant with memory and optional RAG mode
- **RAG Pipeline** — Resume indexed in ChromaDB/in-memory vector store for contextual retrieval

---

## Setup

### 1. Get Anthropic API Key
Go to https://console.anthropic.com and create an API key.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm run dev
```

Backend runs on: http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

### 4. ChromaDB (Optional — for persistent vector storage)

If you want persistent vector search (RAG), run ChromaDB via Docker:

```bash
docker run -p 8000:8000 chromadb/chroma
```

If ChromaDB is not running, the app automatically falls back to in-memory vector search — everything still works.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/resume/enhance | Enhance resume with job description |
| POST | /api/resume/analyze | Analyze and index resume for RAG |
| POST | /api/resume/upload | Upload PDF resume |
| POST | /api/interview/generate | Generate interview Q&A |
| POST | /api/chat/message | Send chat message |
| DELETE | /api/chat/session/:id | Clear chat session |
| POST | /api/rag/query | Query resume via RAG |
| DELETE | /api/rag/session/:id | Clear RAG session |
| GET | /api/health | Health check |

---

## Project Structure

```
ai-resume-enhancer/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server
│   │   ├── routes/
│   │   │   ├── resume.js         # Resume routes
│   │   │   ├── interview.js      # Interview routes
│   │   │   ├── chat.js           # Chat routes
│   │   │   └── rag.js            # RAG routes
│   │   └── services/
│   │       ├── anthropicService.js   # All Claude API calls
│   │       └── ragService.js         # LangChain + ChromaDB RAG
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.js
    │   │   ├── page.js           # Main page with tabs
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── resume/EnhanceTab.js
    │   │   ├── interview/InterviewTab.js
    │   │   └── chat/ChatTab.js
    │   └── lib/api.js            # Axios API client
    ├── package.json
    └── next.config.js
```

---

## Environment Variables

### Backend (.env)
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=5000
CHROMA_URL=http://localhost:8000
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
