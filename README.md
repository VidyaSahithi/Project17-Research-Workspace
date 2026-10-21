# Project 17 — Research Reading and Evidence Workspace

A modern, full-stack research evidence synthesis platform designed for researchers, students, and reviewers to organize literature, explore grounded evidence with citations, compare studies side by side, and maintain private, user-scoped research journals.

---

## 1. Project Overview & Goals

When conducting deep literature reviews, researchers often struggle with:
- Managing disparate PDF papers without structured evidence extraction.
- AI hallucination when asking questions across research papers.
- Tedious manual cross-comparison of methodologies, sample sizes, and limitations.
- Privacy concerns around personal research notes and unfinalized thoughts.

**Project 17 solves this by providing:**
1. **Document Library (M2/M3)**: Secure PDF upload, text parsing, character-offset chunking, and metadata tracking.
2. **Vector Semantic Search (M4/M5)**: Dense chunk embeddings with cosine similarity for fast passage retrieval.
3. **Cited Research Chat (M6)**: Retrieval-Augmented Generation (RAG) providing factual answers attributed strictly to source page numbers with anti-hallucination guards.
4. **Evidence Board & Agent (M7)**: Autonomous evidence synthesis tools for reviewing claims and proposals.
5. **Study Comparison (M8)**: Interactive, side-by-side comparative matrices aligning research questions, methodologies, sample sizes, findings, limitations, and direct page citations with automatic *"Not found in the paper"* fallback handling.
6. **Private Notes (M8)**: User-scoped, authenticated research journals linked directly to papers with full CRUD, search, and delete confirmations.

---

## 2. Team Members and Project Roles

| Role | Responsibility | Milestone | Confirmed Status |
| :--- | :--- | :---: | :---: |
| **Member 1** | Authentication, JWT, and User Models | M1 | Implemented |
| **Member 2 / 3** | PDF Ingestion, Text Extraction, and Chunks | M2, M3 | Implemented |
| **Member 4 / 5** | Vector Embeddings and Semantic Search | M4, M5 | Implemented |
| **Member 6** | Cited RAG Chat & Anti-Hallucination Pipeline | M6 | Implemented |
| **Member 7** | Evidence Agent & Evidence Board Synthesis | M7 | Partially Implemented (Agent Tools Ready) |
| **Member 8** | Study Comparison, Private Notes & QA Automation | M8 | **Complete & Verified** |

---

## 3. Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v18.0.0 or higher (v24.x recommended).
- **npm**: v9.0.0 or higher.
- **Git**: v2.30 or higher.
- **MongoDB** *(Optional for Mock Mode)*: Community Server v6.0+ on default port `27017`.
- **Ollama** *(Optional for Live AI)*: Local runner with `qwen2.5:3b` model installed (`ollama run qwen2.5:3b`).

---

## 4. Repository Structure

```text
Project17-Research-Workspace/
├── client/                     # Frontend Application (React 19, Vite 8.3)
│   ├── .env.example            # Example frontend environment variables
│   ├── index.html              # Single page entry HTML
│   ├── package.json            # React, React-Router-DOM, Vite, ESLint
│   └── src/
│       ├── layout/             # AppLayout, Navbar, Sidebar
│       ├── pages/              # Documents, Chat, StudyComparison, Notes
│       ├── components/         # Compare, Notes, Chat, and Library UI components
│       ├── services/           # api.js, authApi.js, compareApi.js, notesApi.js
│       └── mocks/              # compareMock.js, notesMock.js, chatMock.js
├── server/                     # Backend API Server (Node.js, Express 5, Mongoose 9)
│   ├── .env.example            # Example backend environment variables
│   ├── server.js               # Main CommonJS Express application entrypoint
│   ├── config/db.js            # MongoDB connection handler
│   ├── models/                 # User.js, Document.js, Chunk.js
│   ├── routes/                 # authRoutes, documents, search, chat, agent
│   ├── controllers/            # authController, documentController, searchController
│   ├── middleware/             # authMiddleware (JWT verification)
│   ├── tools/                  # LangChain evidenceTools
│   ├── ai/                     # Evidence agent and schemas
│   └── seed/                   # Database seed script and canonical JSON data
├── docs/                       # Project Documentation & Quality Assurance
│   ├── architecture-diagram.md # Mermaid architecture & data flow diagrams
│   ├── database-schema-diagram.md # Database ER relationships & model specs
│   ├── integration-checklist.md   # End-to-end integration checklist (15 items)
│   ├── qa-test-results.md      # Executed QA test report across 16 scenarios
│   ├── demo-script.md          # Demonstration script and recording checklist
│   └── postman/                # Postman v2.1 collection & environment files
└── README.md                   # Project overview & developer guide
```

---

## 5. Quick Start Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/VidyaSahithi/Project17-Research-Workspace.git
cd Project17-Research-Workspace
```

### Step 2: Configure Environment Files
Create local configuration files from the provided templates:
```bash
# In client/
cp client/.env.example client/.env

# In server/
cp server/.env.example server/.env
```

Default `client/.env`:
```ini
VITE_USE_MOCK=true
VITE_API_URL=http://localhost:5000
```

Default `server/.env`:
```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project17_research
JWT_SECRET=development_super_secret_jwt_key_change_in_production_123456
OLLAMA_HOST=http://127.0.0.1:11434
CHAT_MODEL=qwen2.5:3b
```

### Step 3: Install Dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```
*(On Windows PowerShell, use `npm.cmd` if script execution policies restrict `npm.ps1`)*.

---

## 6. Running the Application

### Option A: Running in Mock Mode (Recommended for Offline/Quick Evaluation)
With `VITE_USE_MOCK=true` in `client/.env`:
```bash
# Start frontend dev server
cd client
npm run dev
```
Open **`http://localhost:5173/`** in your browser.  
- Default login: `student@researchspace.internal` / `StudentPassword123!`
- All features (Document Library, Research Chat, Study Comparison, and Private Notes) work immediately with realistic mock evidence and isolated client-side storage.

### Option B: Running Full Stack with Live Backend & MongoDB
1. Start MongoDB:
   ```bash
   mongod --dbpath <data-dir>
   ```
2. Start Express API Server:
   ```bash
   cd server
   npm run start
   ```
   *(Server starts on `http://localhost:5000`)*.
3. Start Frontend Client:
   ```bash
   cd client
   npm run dev
   ```

---

## 7. Database Seeding Instructions

To populate MongoDB with development accounts, research papers, chunks, vector embeddings, and approved evidence:
```bash
cd server
npm run seed
```
Or directly:
```bash
node server/seed/seed.js
```

**Seeded Accounts:**
| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Student Researcher** | `student@researchspace.internal` | `StudentPassword123!` | `student_researcher` |
| **Reviewer / Supervisor** | `reviewer@researchspace.internal` | `ReviewerPassword123!` | `reviewer_supervisor` |
| **Collection Owner** | `owner@researchspace.internal` | `OwnerPassword123!` | `collection_owner` |

*Safety Features:* The seeding script uses idempotent upserts. It will never create duplicate documents or erase your existing database.

---

## 8. Automated Testing & Verification

### Frontend Linting & Production Build
```bash
cd client
npm run lint    # Runs ESLint (0 errors, 0 warnings)
npm run build   # Validates Vite production build
```

### Postman API Test Collection
Automated tests covering positive, negative, and validation scenarios are available in `docs/postman/`:
```bash
newman run docs/postman/Project17_Research_Workspace.postman_collection.json \
  -e docs/postman/Project17_Local_Environment.postman_environment.json
```
See [`docs/postman/README.md`](docs/postman/README.md) for full instructions and execution logs.

---

## 9. Known Limitations & Team Integration Blockers

1. **Role Enforcement Schema (M1 Dependency)**:
   - The current `User` Mongoose schema in `server/models/User.js` does not store a `role` field. Server-side role authorization is pending M1's schema migration.
2. **Collections Router Mount (M1/M5 Dependency)**:
   - `server/server.js` does not yet mount `/api/collections`.
3. **Evidence Board Endpoint (M7 Dependency)**:
   - The live backend route `/api/evidence/compare` is pending M7 completion. The frontend is fully functional via `compareApi.js` in mock mode.
4. **Notes Backend Endpoint (M8 Scaffolding)**:
   - Notes are currently maintained with user-scoped storage in `notesMock.js`. The backend `/api/notes` routes are documented in the Postman collection ready for mounting.

---

## 10. Git Workflow & Safety Guidelines

- **UI Development Branch**: `feature/compare-notes` (Study Comparison and Private Notes UI).
- **QA & Integration Branch**: `feature/qa-integration` (Integration checklists, Postman collection, seed data, and documentation).
- **Branch Protection**: Never push directly to `main` without peer review.
- **Secret Protection**: `.gitignore` strictly excludes `.env` and `.env.*` (only `.env.example` is committed).
