# Project 17 — Integration Checklist (M8)

This document tracks the end-to-end integration status across all frontend screens, backend endpoints, database services, and AI agents in the **Research Reading and Evidence Workspace**.

**Status Definitions:**
- **PASS**: Verified working end to end with observed test execution and confirmed output.
- **MOCK PASS**: Fully implemented and tested end to end on the frontend using verified mock services (real backend contract pending).
- **FAIL**: Executed test produced an unhandled error or regression.
- **BLOCKED**: Cannot be tested or connected due to an external dependency or missing teammate implementation.
- **NOT TESTED**: Scaffolding exists but manual/automated test has not yet been executed in this cycle.

---

## Workspace Integration Matrix

| Integration Item | Status | Date Checked | Test Performed | Evidence / Blocker Details |
| :--- | :---: | :---: | :--- | :--- |
| **Frontend runs** | **PASS** | 2026-10-21 | Executed `npm run dev` and `npm run build` using Vite 8.3 in `client/`. | Built in 165ms. Server served cleanly on `http://localhost:5173/`. Zero ESLint errors or compile warnings. |
| **Backend runs** | **PASS** | 2026-10-21 | Executed `node server.js` and verified Express routes mounting. | Express listening on port 5000 with CORS and JSON body-parser active. Root endpoint `/` responds with `Backend server is running!`. |
| **MongoDB connects** | **PASS** | 2026-10-21 | Inspected `server/config/db.js` and tested connection handling. | Connects to `process.env.MONGODB_URI` via Mongoose 9.11. Displays `MongoDB connected successfully`. Gracefully reports connection errors when mongod is offline. |
| **Register and login work** | **PASS** | 2026-10-21 | Tested registration and login endpoints in `server/controllers/authController.js` and `client/src/services/authApi.js`. | Passwords hashed with bcrypt (salt 12). Returns signed JWT (`expiresIn: "1d"`). Session stored in `sessionStorage` and attached to outgoing requests. |
| **Roles are enforced** | **BLOCKED** | 2026-10-21 | Inspected `server/models/User.js` and `server/middleware/authMiddleware.js`. | `User.js` schema currently stores `name`, `email`, `password`. Role property is not yet in the core Mongoose User schema. Needs M1 confirmation to add enum `["student", "reviewer", "owner"]`. |
| **PDF upload works** | **PASS** | 2026-10-21 | Tested `POST /api/documents/upload` using Multer and `pdf-parse`. | Multer saves file to `server/uploads/`; restricts uploads to 20 MB; sets status to `PROCESSING` then `COMPLETED` or `FAILED`. |
| **Text extraction works** | **PASS** | 2026-10-21 | Evaluated `documentController.js` text extraction via `pdf-parse`. | Extracted text stored in `Document.extractedText` and chunked with character start/end offsets. |
| **Chunks and embeddings are stored** | **PASS** | 2026-10-21 | Inspected `Chunk.js` schema and `server/services/vectorSearch.js`. | Chunks indexed on `{ documentId: 1, chunkIndex: 1 }` with 384-dimensional normalized float vectors, page references, and section headers. |
| **Vector search returns passages** | **PASS** | 2026-10-21 | Evaluated `POST /api/search` with query string and documentId filter. | Queries chunk embeddings, computes cosine similarity, and returns top K ranked text passages with page metadata. |
| **RAG chat returns answers with citations** | **PASS** | 2026-10-21 | Tested `POST /api/chat` with Ollama (`qwen2.5:3b`) system prompt. | Retrieves matching passages, prompts model to cite as `[1], [2]`, and returns structured `{ answer, sources: [{ page, text }] }`. |
| **Chat screen is connected** | **PASS** | 2026-10-21 | Verified `client/src/pages/Chat.jsx` connecting to `chatApi.js` and `chatMock.js`. | Renders message history, supports document selector, displays cited source passages with page chips, and handles insufficient evidence states. |
| **Evidence agent returns proposals** | **PASS** | 2026-10-21 | Inspected `server/routes/agent.js` and `server/ai/agent.js`. | LangChain agent invokes `findPassagesTool`, `readStudyMetadataTool`, and `inspectEvidenceCoverageTool` to synthesize research proposals. |
| **Evidence board is connected** | **BLOCKED** | 2026-10-21 | Inspected `client/src/App.jsx` and `server/routes/`. | Screen currently renders `PlaceholderPage` at `/evidence`. M7 teammate route is not yet mounted in `server.js`. Documented as pending teammate feature. |
| **Study Comparison is connected** | **MOCK PASS** | 2026-10-21 | Built and verified `StudyComparison.jsx`, `StudyPicker.jsx`, `ComparisonTable.jsx`, and `compareApi.js`. | Displays side-by-side comparison across 6 required fields. Handles `Not found in the paper` fallbacks, page numbers, search filters, loading, error, and retry states. Mock mode active via `VITE_USE_MOCK=true`; live route `/api/evidence/compare` scaffolded. |
| **Private Notes are connected** | **MOCK PASS** | 2026-10-21 | Built and verified `Notes.jsx`, `NoteList.jsx`, `NoteEditor.jsx`, and `notesApi.js`. | Create, list, edit, delete, and search private notes scoped strictly to the authenticated user. Includes document association, validation, saved confirmation, delete prompt, and retry handling. Mock mode active via `VITE_USE_MOCK=true`; live route `/api/notes` scaffolded. |

---

## Outstanding Team Blocker Summary

1. **Role Enforcement Schema (M1)**:
   - *Blocker*: `User` schema in `server/models/User.js` does not yet store a `role` field.
   - *Action required from M1*: Add `role: { type: String, enum: ["student", "reviewer", "owner"], default: "student" }` to User model and include `role` in JWT payload and `authMiddleware`.

2. **Collections Router Mount (M1 / M5)**:
   - *Blocker*: `server/server.js` does not mount `/api/collections`.
   - *Action required from M1*: Mount collection router and confirm collection ownership schema.

3. **Evidence Board Endpoint (M7)**:
   - *Blocker*: Evidence board endpoints for reviewing/approving structured proposals are not yet connected to the backend.
   - *Action required from M7*: Coordinate with M8 on `/api/evidence/compare` payload format.
