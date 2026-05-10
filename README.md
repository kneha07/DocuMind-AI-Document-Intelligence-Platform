# DocuMind — AI Document Intelligence Platform

[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)]()
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)]()
[![AWS](https://img.shields.io/badge/AWS_S3-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)]()
[![Material UI](https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)]()
[![Claude](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge&logo=anthropic&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)]()

> Ask your documents questions in plain English and get instant, context-aware answers. No more Ctrl+F. No more manual searching.

---

## Overview

**DocuMind** is a full-stack AI document intelligence platform. Upload your files and ask anything — Claude reads your documents and answers in plain English. Built with enterprise-grade security, RAG-based semantic search, AES-256 encrypted AWS S3 storage, and a clean navy/amber UI.

---

## Features

### Security & Authentication
- **JWT-based Authentication**: Secure login/signup with token-based sessions
- **AES-256 Encryption**: All files encrypted before cloud upload
- **Password Protection**: BCrypt hashing for user credentials
- **Storage Limit Enforcement**: 15 GB per user with automatic validation

### File Management
- **Upload & Storage**: File upload with real-time progress tracking
- **Cloud Storage**: Automatic upload to AWS S3 with encryption
- **Download & Preview**: View files directly in browser or download
- **Rename / Delete / Share**: Full file operations with instant state updates
- **Multiple File Types**: PDF, Word, Text, Images

### AI & NLP Features
- **Claude API**: Keyword extraction and document summarization powered by Claude Haiku
- **Apache Tika**: Text extraction from PDFs and Word documents
- **AI Answer Panel**: Ask a question in AI mode — Claude synthesizes an answer from your documents
- **Semantic Search**: Natural language queries using OpenAI embeddings (85% similarity threshold)
- **Expandable Details**: View AI-generated keywords and summaries per document

### Dual Search Modes
- **Basic Search**: Real-time keyword filtering as you type
- **AI Semantic Search**: Natural language queries — search by meaning, not just filename
  - Search "project ideas" → Finds proposals, brainstorming docs
  - Search "budget analysis" → Finds financial reports, expense sheets
  - Claude answer panel appears above results with a synthesized response
- **Smart Toggle**: Easy switch between Basic ↔ AI modes

### Collaboration
- **File Sharing**: Share files with multiple users via email
- **Access Control**: Owner-based permissions system
- **Shared Files View**: Dedicated section for files shared with you
- **Duplicate Prevention**: Blocks duplicate shares to same email

### UI/UX
- **Consistent Design System**: Navy (#003566 / #001D3D) + Amber (#FFB300) palette throughout
- **Smooth Animations**: Polished hover effects and card transitions
- **Storage Analytics**: Real-time storage usage bar in sidebar
- **Grid & List Views**: Toggle with persistence via localStorage
- **Advanced Filters**: Filter by file type, date, and sort options
- **Docker Support**: One-command local setup via docker-compose

---

## Screenshots

### Dashboard with AI-Generated Keywords & Summaries
![Dashboard](Screenshots/dashboard-grid.png)
*Grid view showing auto-generated keywords and summaries with expandable details*

### AI Semantic Search with Claude Answer Panel
![AI Search](Screenshots/ai-search.png)
*Natural language search with Claude-synthesized answer above results*

### List View with NLP Details
![List View](Screenshots/list-view-expanded.png)
*Expandable section showing keywords and document summary*

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Java 17** | Core programming language |
| **Spring Boot 3.5.7** | Web framework and REST API |
| **Spring Security** | Authentication & authorization |
| **Spring Data MongoDB** | Database integration |
| **AWS SDK for Java** | S3 cloud storage integration |
| **JWT (jjwt 0.11.5)** | Token-based authentication |
| **Apache Tika 2.9.1** | Text extraction from documents |
| **Spring WebFlux** | HTTP client for Claude API calls |
| **Maven** | Build automation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Material-UI (MUI)** | Component library |
| **React Router 6** | Navigation |
| **Axios** | HTTP client |
| **React Context API** | Auth state management |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | NoSQL database for metadata & embeddings |
| **AWS S3** | Scalable cloud storage for encrypted files |

### AI & NLP
| Technology | Purpose |
|------------|---------|
| **Claude API (Haiku)** | Keyword extraction, summarization, RAG answers |
| **OpenAI text-embedding-ada-002** | Semantic document embeddings (1536 dimensions) |
| **Cosine Similarity** | Vector similarity calculation (85% threshold) |

### Security
| Technology | Purpose |
|------------|---------|
| **AES-256** | File encryption algorithm |
| **BCrypt** | Password hashing |
| **JWT** | Stateless authentication |

---

## Getting Started

### Prerequisites

```bash
Java 17+
Maven 3.6+
Node.js 16+ and npm
MongoDB Atlas account (free tier)
AWS Account with S3 bucket
OpenAI API Key (for embeddings)
Anthropic API Key (for Claude — keywords, summaries, answers)
Docker (optional, for docker-compose)
```

### Option A — Docker Compose (Recommended)

```bash
git clone https://github.com/kneha07/DocuMind.git
cd DocuMind
cp .env.example .env
# Fill in your API keys and credentials in .env
docker-compose up
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:8080`

### Option B — Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/kneha07/DocuMind.git
cd DocuMind
```

#### 2. Backend Configuration

Edit `backend/src/main/resources/application.properties`:
```properties
spring.application.name=googledrive

spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/smartdocs
spring.data.mongodb.database=smartdocs

server.port=8080
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

jwt.secret=your-super-secret-key-min-256-bits-long
jwt.expiration=86400000

aws.access.key.id=YOUR_ACCESS_KEY_ID
aws.secret.access.key=YOUR_SECRET_ACCESS_KEY
aws.s3.bucket.name=your-bucket-name
aws.s3.region=us-east-1

file.encryption.key=MySecretEncryptionKey1234567890

# OpenAI — used for embeddings only
openai.api.key=YOUR_OPENAI_API_KEY
openai.model=text-embedding-ada-002

# Anthropic Claude — used for keywords, summaries, and AI answers
anthropic.api.key=YOUR_CLAUDE_API_KEY
```

#### 3. Run Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

#### 4. Run Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

---

## System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login   │  │  Signup  │  │Dashboard │  │AI Search │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │ REST API
                        ▼
┌───────────────────────────────────────────────────────────┐
│                  Backend (Spring Boot)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │Auth Service │  │File Service │  │   NLP Services  │   │
│  │   (JWT)     │  │(Encryption) │  │ Claude + OpenAI │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└──────────┬──────────────────┬──────────────────┬──────────┘
           │                  │                  │
           ▼                  ▼                  ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
   │   MongoDB    │  │    AWS S3    │  │  Claude API +    │
   │  (Metadata   │  │  (Encrypted  │  │  OpenAI API      │
   │  Embeddings  │  │    Files)    │  │  (NLP + Search)  │
   │  Keywords    │  │              │  │                  │
   │  Summaries)  │  │              │  │                  │
   └──────────────┘  └──────────────┘  └──────────────────┘
```

### Data Flow

**File Upload with NLP:**
1. File sent to Spring Boot API with JWT token
2. AES-256 encryption key generated → file encrypted → uploaded to AWS S3
3. Apache Tika extracts text content
4. **Claude Haiku** extracts 5-7 keywords
5. **Claude Haiku** generates 2-3 sentence summary
6. **OpenAI ada-002** generates 1536-dimensional embedding vector
7. Metadata (keywords, summary, embedding, encryption key) saved to MongoDB

**AI Search + Answer:**
1. User types query in AI mode → hits Enter
2. OpenAI generates query embedding in parallel with answer request
3. Cosine similarity calculated against all stored embeddings
4. Top 3 results (>85% similarity) returned as file cards
5. **Claude synthesizes a 2-3 sentence answer** from top document summaries
6. Answer panel displayed above results

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
│ STAGE 2: Keyword Extraction (Claude) │
│ Text → Claude Haiku → 5-7 Keywords  │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ STAGE 3: Summarization (Claude)      │
│ Text → Claude Haiku → 2-3 Sentences │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ STAGE 4: Embedding (OpenAI ada-002)  │
│ Text → Vector (1536 dimensions)      │
└──────────────────┬───────────────────┘
                   ↓
          Store in MongoDB
```

### Search Examples

| Natural Language Query | Finds Documents About |
|------------------------|----------------------|
| "project ideas" | Proposals, brainstorming docs, innovation plans |
| "budget analysis" | Financial reports, expense sheets, quarterly reviews |
| "meeting notes" | Minutes, discussion summaries, action items |
| "python tutorial" | Code guides, programming docs, learning materials |

---

## API Reference

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
```

### Files

```http
GET    /api/files                          # List user's files
POST   /api/files/upload                   # Upload file
GET    /api/files/download/{fileId}        # Download file
DELETE /api/files/{fileId}                 # Delete file
PUT    /api/files/rename/{fileId}          # Rename file
POST   /api/files/share                    # Share file
GET    /api/files/search/ai?query=...      # AI semantic search (returns file list)
GET    /api/files/search/ai/answer?query=  # Claude answer from document context
```

---

## Project Structure

```
DocuMind/
├── backend/
│   └── src/main/java/com/project/googledrive/
│       ├── config/               # Security, CORS, S3 config
│       ├── controller/           # REST endpoints
│       ├── dto/                  # Request/response objects
│       ├── model/                # User, FileMetadata entities
│       ├── repository/           # MongoDB repositories
│       ├── security/             # JWT filter & utilities
│       ├── service/
│       │   ├── FileService.java          # Core file logic
│       │   ├── AuthService.java
│       │   ├── ClaudeService.java        # Anthropic API client
│       │   ├── OpenAIService.java        # Embeddings
│       │   ├── KeywordExtractionService.java
│       │   └── DocumentSummaryService.java
│       └── util/                 # AES-256 encryption
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Dashboard.jsx     # Main UI (color system, AI panel)
│       │   ├── Login.jsx
│       │   └── Signup.jsx
│       ├── context/AuthContext.jsx
│       └── services/api.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Design System

The UI uses a consistent navy/amber palette defined in a single `C` constant in [Dashboard.jsx](frontend/src/components/Dashboard.jsx):

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#003566` | Buttons, icons, borders, chips |
| `dark` | `#001D3D` | Sidebar gradient end, hover states |
| `accent` | `#FFB300` | Storage bar, amber highlights |
| `accentFab` | `#faa307` | Upload FAB button |
| `bg` | `#f7f8fc` | Page background |
| `surface` | `#ffffff` | Cards, dialogs |
| `border` | `#e8edf2` | Card borders, dividers |
| `tint` | `#e8f0fe` | AI mode search bar, keyword chips |
| `textPrimary` | `#1d2129` | Headings, file names |
| `textSecondary` | `#6e7c87` | Metadata, captions |

---

## Troubleshooting

**Backend won't start**
```bash
lsof -i :8080   # check if port is in use
mvn clean install
```

**MongoDB connection error** — verify URI in `application.properties`, ensure IP `0.0.0.0/0` is allowed in Atlas.

**AWS S3 upload fails** — verify credentials and that the IAM user has `AmazonS3FullAccess`.

**Claude API errors** — verify `anthropic.api.key` is set. Get a key at [console.anthropic.com](https://console.anthropic.com).

**OpenAI errors** — used only for embeddings; verify `openai.api.key` and billing is active.

**NLP features not working** — only text-based files (PDF, DOC, TXT) are processed. Images are skipped by design.

**AI answer panel not showing** — Claude key may be missing or the query returned 0 matching documents (similarity < 72%).

---

## Project Stats

- **API Endpoints**: 8
- **NLP Services**: 3 (Keyword Extraction, Summarization, Embeddings)
- **AI Models**: Claude Haiku + OpenAI ada-002
- **Search Precision**: 85% cosine similarity threshold
- **Storage Capacity**: 15 GB per user
- **Encryption**: AES-256 per file

---

## Developer

<div align="center">

**Neha Kumari**

[![GitHub](https://img.shields.io/badge/GitHub-kneha07-181717?style=for-the-badge&logo=github)](https://github.com/kneha07)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kneha101n-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/kneha101n/)

</div>

---

<div align="center">

**Built with Java · Spring Boot · React · MongoDB · AWS S3 · Claude API · OpenAI**

</div>
