# Postman Collection & Automated API Testing Guide

This directory contains the automated Postman test collection and local environment configuration for **Project 17: Research Reading and Evidence Workspace**.

## Files in this Directory

| File | Description |
| :--- | :--- |
| `Project17_Research_Workspace.postman_collection.json` | Complete Postman v2.1 collection covering all implemented and scaffolded workspace endpoints. |
| `Project17_Local_Environment.postman_environment.json` | Environment variables template containing base URLs, test account credentials, and IDs. |
| `README.md` | Import instructions, test execution commands, and executed test results log. |

---

## 1. Quick Setup & Import Instructions

### Option A: Using the Postman Desktop or Web App
1. Open Postman.
2. Click **Import** in the upper-left corner of the workspace.
3. Select and upload both files:
   - `Project17_Research_Workspace.postman_collection.json`
   - `Project17_Local_Environment.postman_environment.json`
4. In the top-right environment selector, select **Project 17 Local Environment**.
5. Ensure the backend server is running (`npm run start` in `server/`, listening on port 5000).
6. Run the **1. Authentication > POST Login User** request first. This automatically extracts the returned JWT and stores it in the `{{authToken}}` environment variable.

### Option B: Using Newman (CLI Test Runner)
If Newman is installed on your machine (`npm install -g newman`), run the collection headlessly:
```bash
newman run docs/postman/Project17_Research_Workspace.postman_collection.json \
  -e docs/postman/Project17_Local_Environment.postman_environment.json \
  --reporters cli
```

---

## 2. Configured Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `baseUrl` | `http://localhost:5000` | Address of the Express API server. |
| `studentEmail` | `student@researchspace.internal` | Canonical Student Researcher email. |
| `studentPassword` | `StudentPassword123!` | Test account password. |
| `authToken` | *(auto-populated)* | Bearer JWT populated dynamically after login/register. |
| `documentId` | `67b8d4c1e11a2f0012a9bc41` | Document ObjectId for scoped queries. |
| `collectionId` | `67b8d4c1e11a2f0012a9bc42` | Collection ObjectId. |
| `noteId` | `note-101` | Private note test identifier. |

---

## 3. Test Execution and Verification Log

*Date Checked:* 2026-10-21  
*Backend Host:* `http://localhost:5000`  
*Frontend Host:* `http://localhost:5173`

| Category | Request Name | Method | Expected Status | Actual Status | Result | Evidence / Notes |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Auth** | Register User | `POST` | 201 / 409 | 201 / 409 | **PASS** | Validates schema; hashes password with bcrypt (salt rounds 12); returns JWT. |
| **Auth** | Register Short Password | `POST` | 400 | 400 | **PASS** | Returns `"Password must be at least 8 characters"`. |
| **Auth** | Login User | `POST` | 200 | 200 | **PASS** | Verifies bcrypt hash; returns JWT and session user object. |
| **Auth** | Login Bad Credentials | `POST` | 401 | 401 | **PASS** | Rejects with `"Invalid email or password"`. |
| **Auth** | Session Me (Valid Token) | `GET` | 200 | 200 | **PASS** | `authMiddleware` extracts `req.user` from Bearer token. |
| **Auth** | Session Me (No Token) | `GET` | 401 | 401 | **PASS** | Returns `"Authentication token required"`. |
| **Docs** | List Documents | `GET` | 200 | 200 | **PASS** | Scoped to authenticated `ownerId`. |
| **Docs** | Upload Document | `POST` | 201 / 200 | 200 | **PASS** | Multer parses multipart file; extracts text into Document chunks. |
| **Docs** | Upload Missing File | `POST` | 400 | 400 | **PASS** | Rejects empty upload with validation message. |
| **Docs** | Retry Document Processing| `POST` | 200 / 404 | 200 | **PASS** | `retryDocumentController` clears failed status and reprocesses. |
| **Search** | Vector Search Chunks | `POST` | 200 | 200 | **PASS** | Cosine similarity across chunk embedding vectors. |
| **Chat** | Ask Question (Grounded RAG)| `POST` | 200 | 200 | **PASS** | Retrieves passages; prompts Ollama; returns answer with source page numbers. |
| **Chat** | Insufficient Evidence Query| `POST` | 200 | 200 | **PASS** | Explicitly responds with insufficient evidence without hallucinating citations. |
| **Chat** | Missing Document ID | `POST` | 400 | 400 | **PASS** | Validates required documentId. |
| **Agent** | Evidence Agent Proposal | `POST` | 200 | 200 | **PASS** | LangChain agent invokes tools and returns proposal citations. |
| **Collections**| List Collections | `GET` | 200 | 404 | **BLOCKED** | M1 collection router not yet mounted in `server.js`. Documented as pending dependency. |
| **Evidence**| Evidence Compare | `GET` | 200 | 404 | **MOCK ONLY** | Backend route pending; frontend functions cleanly via `compareMock.js`. |
| **Notes** | List / Create Notes | `GET/POST`| 200 / 201 | 404 | **MOCK ONLY** | Notes backend pending; frontend maintains per-user scoped privacy in `notesMock.js`. |
