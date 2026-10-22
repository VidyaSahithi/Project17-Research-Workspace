# Project 17 — Database Schema & Entity Relationship Diagram

This document illustrates the actual Mongoose database schemas implemented in `server/models/`, along with the scaffolded relations for Collections, Evidence, and Private Notes.

---

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ DOCUMENT : "owns (1:N)"
    USER ||--o{ CHUNK : "owns (1:N)"
    USER ||--o{ NOTE : "authors (1:N)"
    USER ||--o{ COLLECTION : "curates (1:N)"
    DOCUMENT ||--o{ CHUNK : "contains (1:N)"
    DOCUMENT ||--o{ NOTE : "referenced_by (1:N)"
    COLLECTION ||--o{ DOCUMENT : "groups (M:N)"
    DOCUMENT ||--o{ EVIDENCE : "source_of (1:N)"

    USER {
        ObjectId _id PK
        String name "Required, trimmed"
        String email "Required, unique, lowercase, indexed"
        String password "Hashed with bcrypt (salt 12), select: false"
        Date createdAt "Mongoose timestamp"
        Date updatedAt "Mongoose timestamp"
    }

    DOCUMENT {
        ObjectId _id PK
        String title "Paper title (Required)"
        String filePath "Relative upload path in server/uploads/"
        String extractedText "Full parsed plaintext"
        Array chunks "Embedded { chunkIndex, text, startIndex, endIndex }"
        ObjectId ownerId FK "References User._id (Required, indexed)"
        String status "Enum: UPLOADED | PROCESSING | COMPLETED | FAILED"
        Date createdAt "Mongoose timestamp"
        Date updatedAt "Mongoose timestamp"
    }

    CHUNK {
        ObjectId _id PK
        ObjectId documentId FK "References Document._id (Indexed)"
        ObjectId ownerId FK "References User._id (Indexed)"
        Number chunkIndex "Sequential chunk position in document"
        String text "Extracted chunk paragraph text"
        Number page "Source PDF page number (nullable)"
        String section "Header / Section title (nullable)"
        Array_Number embedding "Dense vector float array (dim: 384)"
        Date createdAt "Mongoose timestamp"
        Date updatedAt "Mongoose timestamp"
    }

    NOTE {
        String id PK "Unique Note identifier (e.g. note-101)"
        String userId FK "Owner User ID (Strict privacy boundary)"
        String documentId FK "References Document._id"
        String documentTitle "Denormalized paper title for fast display"
        String title "Note title / research topic"
        String content "Markdown or rich narrative critique"
        Array_String tags "Categorization tags (e.g. #methodology)"
        Date createdAt "ISO timestamp"
        Date updatedAt "ISO timestamp"
    }

    COLLECTION {
        ObjectId _id PK
        String title "Collection group title"
        String description "Research scope description"
        ObjectId ownerId FK "References User._id"
        Array_ObjectId documentIds "Array of referenced Document ObjectIds"
    }

    EVIDENCE {
        ObjectId _id PK
        ObjectId documentId FK "References Document._id"
        String studyQuestion "Main research question / objective"
        String methods "Experimental methodology / study design"
        String sampleOrData "Cohort, dataset size, sensor counts"
        String findings "Empirical outcomes & p-values"
        String limitations "Author-acknowledged constraints"
        Number sourcePage "Verified citation page number"
        String status "Enum: PROPOSED | APPROVED | REJECTED"
        String reviewerComments "Peer / supervisor feedback"
    }
```

---

## Schema Implementation Details & Indexes

### 1. `User` Schema (`server/models/User.js`)
- **Indexes:** Unique index on `email` (case-insensitive normalized lowercase).
- **Security:** `password` has `{ select: false }`, ensuring password hashes are never returned in standard queries unless explicitly requested using `.select("+password")`.
- **Pending Schema Migration (M1 Blocker):** The current schema does not include a `role` field. Adding `role: { type: String, enum: ["student", "reviewer", "owner"], default: "student" }` is requested from Member 1 to support role-based authorization.

### 2. `Document` Schema (`server/models/Document.js`)
- **Indexes:** Indexed on `ownerId` for fast user-scoped library queries.
- **Embedded vs. Separate Chunks:** `Document.chunks` stores lightweight text slices and character offsets (`startIndex`, `endIndex`) for quick UI rendering, while vector embeddings are stored in the dedicated `Chunk` collection.
- **Status Lifecycle:** `UPLOADED` -> `PROCESSING` -> `COMPLETED` (or `FAILED` upon parser error).

### 3. `Chunk` Schema (`server/models/Chunk.js`)
- **Compound Unique Index:** `{ documentId: 1, chunkIndex: 1 }` prevents duplicate chunk creation when retrying a failed document processing operation.
- **Foreign Key References:** `documentId` and `ownerId` allow multi-tenant scoping and cascading operations.
- **Dense Vector Embeddings:** `embedding: [Number]` stores dense vector floats for cosine similarity search.
- **Source Page Tracking:** `page: { type: Number, default: null }` preserves exact page numbers extracted from the original PDF for citations in RAG answers and Study Comparison.
