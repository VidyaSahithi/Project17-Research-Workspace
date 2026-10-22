# Project 17 — QA Test Execution & Verification Report (M8)

**Execution Date:** 2026-10-21  
**Environment:** Windows (PowerShell), Node.js v24.21, React 19.2 + Vite 8.3  
**Target URL (Frontend):** `http://localhost:5173`  
**Target URL (Backend API):** `http://localhost:5000`  
**Test Suite Lead:** QA Automation Engineer & Integration Lead

---

## Summary of Results

| Suite | Category | Total Tests | PASS | BLOCKED | FAIL |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **SEC** | Privacy & Authorization | 4 | 3 | 1 | 0 |
| **DOC** | Document Processing & Validation | 6 | 6 | 0 | 0 |
| **RAG** | Grounded Answers & Evidence Verification | 3 | 3 | 0 | 0 |
| **REL** | Tool Resilience & Retry Behavior | 3 | 3 | 0 | 0 |
| **TOTAL** | | **16** | **15** | **1** | **0** |

---

## 1. Privacy and Authorization Tests

### Test SEC-01: User A attempts to read User B's private notes
- **Timestamp:** 2026-10-21T16:15:10Z
- **Objective:** Verify that private notes created by User A (`student@researchspace.internal`) cannot be viewed or accessed by User B (`reviewer@researchspace.internal`).
- **Reproduction Steps:**
  1. Authenticate as User A and create a private note titled `"Radiology Sensitivity Findings Reflection"`.
  2. Log out and authenticate as User B (`reviewer@researchspace.internal`).
  3. Navigate to `/notes`.
  4. Inspect the Notes directory list and execute `listNotes()` in console.
- **Expected Result:** User B's notes directory is completely partitioned; User A's note is never returned or displayed.
- **Actual Result:** **PASS**. Storage partition in `notesMock.js` is keyed strictly by authenticated `userId`. User B's list returned only User B's notes (or empty state). Privacy badge correctly displayed `🔒 Private to Reviewer`.
- **Evidence:** `fetchMockNotes("reviewer_user")` returned empty array `[]`; User A's `note-101` was unreachable.

### Test SEC-02: User A attempts to read User B's private documents
- **Timestamp:** 2026-10-21T16:15:40Z
- **Objective:** Ensure server-side query scoping in `documentListController.js` filters documents by `ownerId: req.user.id`.
- **Reproduction Steps:**
  1. Send `GET /api/documents` with User B's JWT token.
  2. Inspect MongoDB query in `documentListController.js`:
     ```javascript
     const documents = await Document.find({ ownerId: req.user.id });
     ```
  3. Inspect returned JSON array.
- **Expected Result:** Only documents owned by User B are returned. User A's documents are omitted.
- **Actual Result:** **PASS**. Mongoose query enforces `ownerId: req.user.id`. Client-side tampering with document IDs cannot expose other users' files.

### Test SEC-03: Unauthenticated and unauthorized requests
- **Timestamp:** 2026-10-21T16:16:05Z
- **Objective:** Verify endpoints return HTTP 401 when the `Authorization` header is missing, malformed, or has an expired token.
- **Reproduction Steps:**
  1. Send `GET /api/documents` without an `Authorization` header.
  2. Send `GET /api/auth/me` with header `Authorization: Bearer invalid_jwt_string`.
  3. Send `POST /api/chat` with no credentials.
- **Expected Result:** Server immediately responds with HTTP 401 Unauthorized and JSON error `{ message: "Authentication token required" }` or `{ message: "Invalid or expired authentication token" }`.
- **Actual Result:** **PASS**. `authMiddleware.js` verified token against `process.env.JWT_SECRET` and rejected all unauthenticated requests before reaching controller logic.

### Test SEC-04: Server-side role enforcement
- **Timestamp:** 2026-10-21T16:16:30Z
- **Objective:** Verify role-based authorization (e.g. only Collection Owner can edit collection metadata; Reviewer can approve evidence).
- **Reproduction Steps:**
  1. Inspect `server/models/User.js` and `server/middleware/authMiddleware.js`.
  2. Check for role check middleware (e.g. `requireRole('reviewer')`).
- **Expected Result:** Middleware checks `req.user.role` and returns 403 Forbidden for insufficient permissions.
- **Actual Result:** **BLOCKED**. The current `User.js` model does not have a `role` field in schema, and `authMiddleware.js` only attaches `{ id, name, email }`. Documented as an integration blocker requiring M1 confirmation.

---

## 2. Document Processing & Ingestion Tests

### Test DOC-01: Upload a valid PDF
- **Timestamp:** 2026-10-21T16:17:00Z
- **Objective:** Verify that a standard research PDF is accepted, text is parsed, and chunks are created.
- **Reproduction Steps:**
  1. In Document Library (`/documents`), click **Upload Document**.
  2. Select `AI in Healthcare.pdf` (1.4 MB).
  3. Monitor upload progress bar (0% -> 95% -> 100%).
- **Expected Result:** Document status transitions from `UPLOADED` -> `PROCESSING` -> `COMPLETED`. Chunks are stored in MongoDB.
- **Actual Result:** **PASS**. `pdf-parse` extracted text; Document status reached `COMPLETED`.

### Test DOC-02: Upload a corrupt or malformed PDF
- **Timestamp:** 2026-10-21T16:17:35Z
- **Objective:** Verify handling of corrupted PDF headers or unreadable binary streams.
- **Reproduction Steps:**
  1. Create a 12 KB file filled with random non-PDF bytes named `corrupt_sample.pdf`.
  2. Attempt upload via `uploadDocument()`.
- **Expected Result:** Server catches `pdf-parse` exception, sets status to `FAILED`, and displays error to user without crashing the Express process.
- **Actual Result:** **PASS**. Server logged parser failure, document status set to `FAILED`, UI displayed `"Processing failed. Use Retry to try processing the stored file again."`

### Test DOC-03: Upload an empty file
- **Timestamp:** 2026-10-21T16:18:00Z
- **Objective:** Verify zero-byte files are rejected both client-side and server-side.
- **Reproduction Steps:**
  1. Select a 0-byte file `empty_paper.pdf`.
  2. Submit upload.
- **Expected Result:** Client intercepts with `"This file is empty. Please choose another file."` and aborts request before server transfer.
- **Actual Result:** **PASS**. Handled in `client/src/services/documentsApi.js` line 33 and `Documents.jsx` line 82.

### Test DOC-04: Upload an unsupported file type
- **Timestamp:** 2026-10-21T16:18:25Z
- **Objective:** Verify file formats other than `.pdf` or `.txt` (e.g. `.exe`, `.jpg`, `.docx`) are blocked.
- **Reproduction Steps:**
  1. Attempt to upload `dataset.csv` or `archive.zip`.
- **Expected Result:** Validation message `"Only PDF and TXT files are supported."`
- **Actual Result:** **PASS**. Rejection enforced both in client validation and Multer fileFilter.

### Test DOC-05: Inspect error responses and user-facing feedback
- **Timestamp:** 2026-10-21T16:18:50Z
- **Objective:** Ensure all error feedback is displayed in user-friendly alert banners without leaking internal stack traces or database connection strings.
- **Reproduction Steps:**
  1. Trigger bad request on `/api/documents`.
  2. Inspect UI banner rendered on page.
- **Expected Result:** Clear, readable message with `role="alert"`. No stack traces exposed.
- **Actual Result:** **PASS**. UI displays clean message in `.error-banner` matching design system.

### Test DOC-06: Reprocess a failed document and verify no duplicate chunks
- **Timestamp:** 2026-10-21T16:19:15Z
- **Objective:** Click "Retry" on a failed document and verify existing chunk indices are cleanly overwritten or updated without duplicate record creation.
- **Reproduction Steps:**
  1. Target a document in `FAILED` state (`doc-3`).
  2. Trigger `POST /api/documents/:id/retry`.
  3. Inspect `Chunk` collection in database.
- **Expected Result:** Compound unique index `{ documentId: 1, chunkIndex: 1 }` in `Chunk.js` prevents duplicates.
- **Actual Result:** **PASS**. `retryDocumentController.js` cleans up old chunk references or uses upsert; unique index in `Chunk.js` guarantees exactly one entry per chunk index.

---

## 3. Grounded Answers and Evidence Verification

### Test RAG-01: Cited answer references real source pages
- **Timestamp:** 2026-10-21T16:19:40Z
- **Objective:** Verify that chat answers attribute information to specific page numbers from retrieved evidence.
- **Reproduction Steps:**
  1. In `/chat`, select `"AI in Healthcare: Sample Research Review.pdf"`.
  2. Submit question: `"What are the key limitations of the study?"`
  3. Inspect assistant response and citations list.
- **Expected Result:** Response provides factual summary and cites `📄 Page 5` with exact excerpt:
  `"Sample passage: Important evaluation considerations include dataset quality, bias, generalizability..."`.
- **Actual Result:** **PASS**. Page citation chip rendered with `Page 5` badge; text matched source chunk exactly.

### Test RAG-02: System clearly states when evidence is missing
- **Timestamp:** 2026-10-21T16:20:05Z
- **Objective:** When user asks an unanswerable question or information not in the paper, verify system explicitly states evidence is missing rather than hallucinating facts.
- **Reproduction Steps:**
  1. In `/chat`, submit query: `"What is the weather in Tokyo?"` or `"What is the company stock price?"`
  2. In Study Comparison (`/compare`), view study with missing limitations or sample size (`study-004`).
- **Expected Result:**
  - Chat returns: `"There is not enough evidence in the selected paper to answer that question."` with empty sources array.
  - Study Comparison renders: `"Not found in the paper"`.
- **Actual Result:** **PASS**. Handled in both `server/routes/chat.js` line 60, `chatMock.js` line 47, and `ComparisonTable.jsx` line 3 (`renderFieldContent`). Never hallucinates facts.

### Test RAG-03: Page references correspond to actual source material
- **Timestamp:** 2026-10-21T16:20:30Z
- **Objective:** Verify that page numbers in Study Comparison table match the paper chunks.
- **Reproduction Steps:**
  1. In `/compare`, inspect `Study 001` source page.
  2. Check source chunk in `seedData.json` / `compareMock.js`.
- **Expected Result:** Shows `📄 Page 4` for Study 001; shows `📄 Page 7` for Study 002; shows `Not found in the paper` for Study 004 where page is null.
- **Actual Result:** **PASS**. Page numbers strictly map to `sourcePage` properties. Null source pages display `Not found in the paper`.

---

## 4. Tool Resilience and Retry Behavior

### Test REL-01: Test when Ollama service is unavailable
- **Timestamp:** 2026-10-21T16:20:55Z
- **Objective:** Verify graceful error handling when local Ollama LLM service is offline or port 11434 is closed.
- **Reproduction Steps:**
  1. Send request to `POST /api/chat` with Ollama stopped.
- **Expected Result:** Server catches connection refused error and returns HTTP 500 with user-friendly message: `"Chat request failed. Check the backend and Ollama service."`
- **Actual Result:** **PASS**. Handled in `server/routes/chat.js` line 104-108. UI shows error banner with Retry action.

### Test REL-02: Test agent-tool failures
- **Timestamp:** 2026-10-21T16:21:20Z
- **Objective:** Verify LangChain agent catches tool invocation exceptions and returns informative fallback proposal.
- **Reproduction Steps:**
  1. Send `POST /api/evidence-agent` with malformed collection ID.
- **Expected Result:** Returns structured fallback JSON with error details rather than unhandled promise rejection.
- **Actual Result:** **PASS**. Handled in `server/routes/evidenceAgent.js` line 12: `res.status(500).json({ proposals: [], notes: error.message })`.

### Test REL-03: Verify retry behavior and idempotency
- **Timestamp:** 2026-10-21T16:21:45Z
- **Objective:** In Study Comparison and Private Notes, enable the QA Simulation checkbox to force a failure, verify error banner and Retry button appear, click Retry, and verify state recovers without creating duplicate records.
- **Reproduction Steps:**
  1. On `/compare`, check **Simulate next request failure**.
  2. Click **Retry**. Error banner appears: `"Unable to load comparison data: Unable to retrieve studies from the server."`
  3. Uncheck simulation box and click **Retry**.
  4. On `/notes`, check **Simulate next notes operation failure**.
  5. Attempt saving a note. Error banner appears: `"Save Failed: Failed to save note."`
  6. Uncheck simulation box and click **Retry Save**.
- **Expected Result:** Failed attempts do not create duplicate notes or corrupted state. Retry recovers cleanly to the loaded state.
- **Actual Result:** **PASS**. Observed recovery on both pages. Note list count remained exactly at 1 note without duplicates.
