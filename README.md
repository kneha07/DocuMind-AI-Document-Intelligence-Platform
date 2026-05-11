# DocuMind — AI Document Intelligence Platform

[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)]()
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)]()
[![AWS](https://img.shields.io/badge/AWS_S3-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)]()
[![Material UI](https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)]()
[![Claude](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge&logo=anthropic&logoColor=white)]()
[![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)]()

> Upload your documents and ask anything — DocuMind reads, understands, and answers in plain English. No more Ctrl+F. No more manual searching.

---

## Overview

**DocuMind** is a full-stack AI document intelligence platform. It extracts keywords and summaries from your files using Claude/Gemini, generates semantic embeddings via OpenAI, and lets you search by meaning — not just filename. Built with enterprise-grade AES-256 encryption, JWT authentication, AWS S3 storage, and a polished Material UI interface.

---

## Demo Video

<video src="https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/demo.mp4" controls width="100%"></video>

> **[▶ Download / Watch Demo](https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/demo.mp4)** — 3-minute walkthrough covering login, dashboard, list view with AI keywords, semantic search, and the Ask AI chat panel.

---

## Screenshots

### Login
![Login](https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/login.png)
*Split-screen login with DocuMind branding*

### Sign Up
![Signup](https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/signup.png)
*Clean sign-up flow with first/last name, email and password*

### Dashboard — Grid View
![Dashboard](https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/dashboard-grid.png)
*Stats cards, filter dropdowns, and file cards with type badges and hover quick-actions (Preview + Download)*

### Dashboard — List View with AI Keywords & Summary
![List View](https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/list-view-expanded.png)
*Auto-expanded list view showing AI-generated keywords and document summary per file*

### AI Semantic Search
![AI Search](https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/ai-search.png)
*Natural language search — "dog care nutrition feeding" semantically matches `general_dog_care.pdf` with keywords and summary shown*

### Ask AI Chat Panel
![Ask AI](https://raw.githubusercontent.com/kneha07/DocuMind-AI-Document-Intelligence-Platform/main/Screenshots/ask-ai-panel-response.png)
*Conversational AI panel powered by Claude/Gemini — live AI response identifying and summarizing the travel itinerary document*

---

## Features

### Security & Authentication
- **JWT Authentication** — Secure login/signup with token-based sessions
- **AES-256 Encryption** — Every file encrypted before cloud upload with a unique key
- **BCrypt Hashing** — Passwords never stored in plain text
- **Storage Enforcement** — 15 GB cap per user with automatic validation

### File Management
- **Drag & Drop Upload** — Drop files directly onto the dashboard or the empty state zone
- **In-App Preview** — Open PDFs, images, and text files in a full-screen dialog without downloading
- **Download & Rename** — Full file operations with instant state updates
- **Delete & Share** — Share files with other users by email; owner-based access control
- **Multiple File Types** — PDF, Word (.docx), plain text, images (PNG, JPG, etc.)

### AI & NLP Features
- **Keyword Extraction** — Claude Haiku or Gemini extracts 5–7 keywords per document automatically on upload
- **Document Summarization** — 2–3 sentence AI summary generated and stored with each file
- **Semantic Embeddings** — OpenAI `text-embedding-ada-002` generates 1536-dim vectors for every text-based file
- **AI Answer Panel** — Ask a question in AI mode; Claude/Gemini synthesizes an answer from relevant document summaries
- **Apache Tika** — Extracts raw text from PDFs and Word documents for NLP processing
- **AI Provider Fallback** — Automatically falls back from Claude → Gemini if primary key is unavailable

### Dual Search Modes
- **Basic Search** — Real-time keyword filtering as you type (filename match)
- **AI Semantic Search** — Natural language queries matched by meaning using cosine similarity
  - "dog care feeding" → finds `general_dog_care.pdf`
  - "totalitarian surveillance" → finds `1984.pdf`
  - "wildfire evacuation planning" → finds the WIDS research poster
- **Smart Toggle** — One click to switch between Basic ↔ AI Mode in the search bar

### AI Chat Panel
- **Ask AI button** in the AppBar opens a chat panel
- Ask questions across all your documents in natural language
- Powered by Claude API (with Gemini fallback)
- Streamed answers with a "Powered by Claude AI" header

### Activity Feed
- Sidebar Activity view logs every upload, delete, share, preview, and download
- Timestamped with colored icons per action type
- Capped at 20 entries (most recent first)

### UI/UX
- **Sky Blue Design System** — Consistent `#0369a1` / `#075985` / `#0ea5e9` palette
- **Stats Cards** — Total documents, uploaded today, storage used — with colored accent borders
- **Grid & List Views** — Toggle with persistence via localStorage; list view auto-expands all files
- **Filter Bar** — File type, date range, sort by — compact MUI Select dropdowns
- **Hover Quick-Actions** — Preview and Download buttons appear on card hover
- **Keyboard Accessible** — All cards and buttons have `aria-label`, focus rings, and Enter key support
- **Time-Based Greeting** — "Good morning / afternoon / evening, [Name]" in the welcome banner

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Java 17** | Core language |
| **Spring Boot 3.5.7** | REST API framework |
| **Spring Security + JWT** | Authentication & authorization |
| **Spring Data MongoDB** | Database integration |
| **AWS SDK for Java** | S3 cloud storage |
| **Apache Tika 2.9.1** | Text extraction from PDF/Word |
| **Spring WebFlux** | HTTP client for AI API calls |
| **Maven** | Build tool |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Material-UI (MUI) v5** | Component library |
| **React Router 6** | Client-side navigation |
| **Axios** | HTTP client |
| **React Context API** | Auth state management |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | File metadata, embeddings, keywords, summaries |
| **AWS S3** | AES-256 encrypted file storage |

### AI & NLP
| Technology | Purpose |
|------------|---------|
| **Claude API (Haiku)** | Keyword extraction, summarization, RAG answers |
| **Google Gemini API** | Fallback for keyword extraction, summarization, answers |
| **OpenAI text-embedding-ada-002** | 1536-dim semantic document embeddings |
| **Cosine Similarity** | Vector similarity for semantic search (72% threshold) |

### Security
| Technology | Purpose |
|------------|---------|
| **AES-256** | Per-file encryption |
| **BCrypt** | Password hashing |
| **JWT (jjwt 0.11.5)** | Stateless auth tokens |

---

## Getting Started

### Prerequisites

```bash
Java 17+
Maven 3.6+
Node.js 16+ and npm
MongoDB Atlas account (free tier works)
AWS account with S3 bucket
OpenAI API key (for embeddings)
Claude API key OR Google Gemini API key (for NLP)
Docker (optional)
```

### Option A — Docker Compose

```bash
git clone https://github.com/kneha07/DocuMind.git
cd DocuMind
cp .env.example .env
# Fill in your API keys in .env
docker-compose up
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:8080`

### Option B — Manual Setup

#### 1. Clone
```bash
git clone https://github.com/kneha07/DocuMind.git
cd DocuMind
```

#### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/smartdocs
spring.data.mongodb.database=smartdocs

server.port=8080
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

jwt.secret=your-256-bit-secret-key
jwt.expiration=86400000

aws.access.key.id=YOUR_AWS_ACCESS_KEY
aws.secret.access.key=YOUR_AWS_SECRET_KEY
aws.s3.bucket.name=your-bucket-name
aws.s3.region=us-east-1

file.encryption.key=YourEncryptionKey1234567890abcd

# OpenAI — embeddings only
openai.api.key=YOUR_OPENAI_API_KEY
openai.model=text-embedding-ada-002

# Claude — primary AI provider
anthropic.api.key=YOUR_CLAUDE_API_KEY

# Gemini — fallback AI provider (free tier available)
gemini.api.key=YOUR_GEMINI_API_KEY
```

#### 3. Run Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### 4. Run Frontend
```bash
cd frontend
npm install
npm start
```

#### 5. Re-process Existing Files (optional)
If you already have files uploaded without keywords/summaries:
```bash
curl -X POST http://localhost:8080/api/files/reprocess \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Login   │  │  Signup  │  │ Dashboard  │  │ Ask AI   │  │
│  └──────────┘  └──────────┘  └────────────┘  └──────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (JWT)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Auth Service│  │ File Service │  │  NLP Services    │   │
│  │  (JWT/BCrypt│  │ (AES-256 enc)│  │ Claude → Gemini  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└────────┬──────────────────┬──────────────────┬──────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
 ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
 │  MongoDB     │  │   AWS S3     │  │  Claude API /    │
 │  Atlas       │  │  (Encrypted  │  │  Gemini API +    │
 │  (Metadata,  │  │   Files)     │  │  OpenAI API      │
 │  Embeddings, │  │              │  │  (NLP + Search)  │
 │  Keywords,   │  │              │  │                  │
 │  Summaries)  │  │              │  │                  │
 └──────────────┘  └──────────────┘  └──────────────────┘
```

### Data Flow — File Upload with NLP
1. File received by Spring Boot with JWT token
2. Unique AES-256 key generated → file encrypted → uploaded to AWS S3
3. Apache Tika extracts raw text
4. **Claude / Gemini** extracts 5–7 keywords
5. **Claude / Gemini** generates a 2–3 sentence summary
6. **OpenAI ada-002** generates 1536-dim embedding vector
7. Metadata (keywords, summary, embedding, S3 key) saved to MongoDB

### Data Flow — AI Semantic Search + Answer
1. User types query in AI mode → presses Enter
2. OpenAI generates a query embedding
3. Cosine similarity calculated against all stored embeddings
4. Top matches (>72% similarity) returned as file cards
5. **Claude / Gemini** synthesizes a 2–3 sentence answer from top document summaries
6. Answer displayed above results; matched files shown below

---

## NLP Pipeline

```
Document Upload
      ↓
┌──────────────────────────────────────┐
│ STAGE 1: Text Extraction (Tika)      │
│ PDF / Word / Text → Plain Text       │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ STAGE 2: Keyword Extraction          │
│ Claude Haiku / Gemini → 5-7 Keywords │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ STAGE 3: Summarization               │
│ Claude / Gemini → 2-3 Sentences      │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ STAGE 4: Embedding (OpenAI ada-002)  │
│ Text → Vector (1536 dimensions)      │
└──────────────────┬───────────────────┘
                   ↓
          Store in MongoDB
```

### Semantic Search Examples

| Query | Matches |
|-------|---------|
| "dog care feeding exercise" | `general_dog_care.pdf` |
| "totalitarian surveillance big brother" | `1984.pdf` |
| "wildfire evacuation machine learning" | `wids_poster.pdf` |
| "travel itinerary Greece" | `Travel-Itinerary.pdf` |

---

## API Reference

### Authentication
```http
POST /api/auth/signup
POST /api/auth/login
```

### Files
```http
GET    /api/files                           # List all user files
POST   /api/files/upload                    # Upload file (multipart)
GET    /api/files/download/{fileId}         # Download & decrypt file
DELETE /api/files/{fileId}                  # Delete file
PUT    /api/files/rename/{fileId}           # Rename file
POST   /api/files/share                     # Share file with email
POST   /api/files/reprocess                 # Re-run AI on existing files
GET    /api/files/search/ai?query=...       # Semantic search (returns files)
GET    /api/files/search/ai/answer?query=.. # AI answer from document context
```

---

## Project Structure

```
DocuMind/
├── backend/
│   └── src/main/java/com/project/googledrive/
│       ├── config/                     # Security, CORS, S3 config
│       ├── controller/
│       │   ├── FileController.java     # All file & search endpoints
│       │   └── AuthController.java
│       ├── model/                      # User, FileMetadata
│       ├── repository/                 # MongoDB repos
│       ├── security/                   # JWT filter & utilities
│       ├── service/
│       │   ├── FileService.java        # Core upload, search, reprocess
│       │   ├── ClaudeService.java      # Claude → Gemini fallback client
│       │   ├── OpenAIService.java      # Embeddings
│       │   ├── KeywordExtractionService.java
│       │   └── DocumentSummaryService.java
│       └── util/                       # AES-256 encryption util
├── frontend/
│   └── src/
│       ├── assets/logo.svg             # Custom SVG logo
│       ├── components/
│       │   ├── Dashboard.jsx           # Main UI — grid, list, chat, activity
│       │   ├── Login.jsx               # Split-screen login
│       │   └── Signup.jsx              # Split-screen signup
│       ├── context/AuthContext.jsx
│       └── services/api.js
├── Screenshots/
│   ├── login.png
│   ├── signup.png
│   ├── dashboard-grid.png
│   ├── list-view-expanded.png
│   ├── ai-search.png
│   ├── ask-ai-panel.png
│   ├── ask-ai-panel-response.png
│   └── demo.mp4
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Design System

Centralized `C` color object in [Dashboard.jsx](frontend/src/components/Dashboard.jsx):

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#0369a1` | Buttons, icons, borders, chips |
| `dark` | `#075985` | Sidebar gradient, hover states |
| `accent` | `#0ea5e9` | Storage bar, FAB button |
| `bg` | `#f8fafc` | Page background |
| `surface` | `#ffffff` | Cards, dialogs |
| `border` | `#e2e8f0` | Card borders, dividers |
| `tint` | `#e0f2fe` | AI mode search bar, keyword chips |
| `textPrimary` | `#0f172a` | Headings, file names |
| `textSecondary` | `#64748b` | Metadata, captions |

---

## Troubleshooting

**Backend won't start**
```bash
lsof -i :8080   # check if port is in use
mvn clean install -DskipTests
```

**MongoDB connection error** — verify URI in `application.properties`, ensure IP `0.0.0.0/0` is whitelisted in Atlas Network Access.

**AWS S3 upload fails** — verify credentials and that the IAM user has `AmazonS3FullAccess`.

**No keywords or summaries** — Run the reprocess endpoint after adding a valid Claude or Gemini API key. Only text-based files (PDF, DOCX, TXT) are processed; images are skipped.

**AI answer not showing** — Either no documents matched the query above the 72% similarity threshold, or both AI providers are rate-limited/unavailable.

**Gemini 429 rate limit** — Free tier allows ~15 requests/minute. Wait a minute and retry, or add a valid Claude API key as the primary provider.

**OpenAI errors** — Used only for embeddings; verify `openai.api.key` and ensure billing is active.

---

## Project Stats

| Metric | Value |
|--------|-------|
| API Endpoints | 9 |
| NLP Services | 3 (Keywords, Summarization, Embeddings) |
| AI Providers | Claude Haiku + Google Gemini (fallback) |
| Embedding Model | OpenAI ada-002 (1536 dimensions) |
| Search Threshold | 72% cosine similarity |
| Storage Cap | 15 GB per user |
| File Encryption | AES-256 per file |

---

## Developer

<div align="center">

**Neha Kumari**

[![GitHub](https://img.shields.io/badge/GitHub-kneha07-181717?style=for-the-badge&logo=github)](https://github.com/kneha07)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kneha101n-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/kneha101n/)

</div>

---

<div align="center">

**Built with Java · Spring Boot · React · MongoDB · AWS S3 · Claude API · Gemini API · OpenAI**

</div>
