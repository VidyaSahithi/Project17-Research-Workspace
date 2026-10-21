# Project 17 — System Architecture & Data Flow Diagram

This document presents the actual implemented architecture of the **Project 17: Research Reading and Evidence Workspace**, reflecting the active codebase across the client, server, database, and local AI layers.

---

## Architecture Diagram (Mermaid)

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client (React 19 + Vite 8.3)"]
        UI["AppLayout & Navigation\n(Sidebar, Navbar, Breadcrumbs)"]
        
        subgraph Screens["Application Screens"]
            DOC_PAGE["Documents Library\n(/documents)"]
            CHAT_PAGE["Cited Research Chat\n(/chat)"]
            COMP_PAGE["Study Comparison (M8)\n(/compare)"]
            NOTES_PAGE["Private Notes (M8)\n(/notes)"]
        end

        subgraph ServiceLayer["API Service & Mock Abstraction"]
            API_CLIENT["Shared API Helper\n(client/src/services/api.js)"]
            AUTH_SVC["Auth Service\n(authApi.js + sessionStorage)"]
            DOC_SVC["Documents API\n(documentsApi.js)"]
            CHAT_SVC["Chat API\n(chatApi.js)"]
            COMP_SVC["Compare API (M8)\n(compareApi.js)"]
            NOTES_SVC["Notes API (M8)\n(notesApi.js)"]
        end

        subgraph MockLayer["Local Mock Fallback Layer (VITE_USE_MOCK=true)"]
            CHAT_MOCK["chatMock.js\n(Demostration RAG citations)"]
            DOC_MOCK["documentsMock.js\n(Status transitions)"]
            COMP_MOCK["compareMock.js\n(Multi-study evidence alignment)"]
            NOTES_MOCK["notesMock.js\n(User-scoped private storage)"]
        end

        UI --> Screens
        DOC_PAGE --> DOC_SVC
        CHAT_PAGE --> CHAT_SVC
        COMP_PAGE --> COMP_SVC
        NOTES_PAGE --> NOTES_SVC

        COMP_SVC -.->|Mock Active| COMP_MOCK
        NOTES_SVC -.->|Mock Active| NOTES_MOCK
        CHAT_SVC -.->|Mock Active| CHAT_MOCK
        
        DOC_SVC --> API_CLIENT
        CHAT_SVC --> API_CLIENT
        COMP_SVC --> API_CLIENT
        NOTES_SVC --> API_CLIENT
        AUTH_SVC --> API_CLIENT
    end

    subgraph BackendLayer["Backend Server (Express 5 + Node.js)"]
        SERVER["Express App Server (port 5000)\n(server/server.js)"]
        
        subgraph Middleware["Middleware Pipeline"]
            CORS_MW["CORS Filter"]
            BODY_MW["JSON Body Parser"]
            AUTH_MW["authMiddleware.js\n(Bearer JWT Verification)"]
        end

        subgraph Routers["Mounted Route Controllers"]
            AUTH_R["/api/auth\n(authRoutes.js)"]
            DOC_R["/api/documents\n(documents.js + Multer)"]
            SEARCH_R["/api/search\n(search.js)"]
            CHAT_R["/api/chat\n(chat.js)"]
            AGENT_R["/api/evidence-agent\n(agent.js / evidenceAgent.js)"]
            COMP_R["/api/evidence/compare\n(Scaffolded)"]
            NOTES_R["/api/notes\n(Scaffolded)"]
        end

        SERVER --> CORS_MW --> BODY_MW
        BODY_MW --> AUTH_R
        BODY_MW --> AUTH_MW
        AUTH_MW --> DOC_R
        AUTH_MW --> SEARCH_R
        AUTH_MW --> CHAT_R
        AUTH_MW --> AGENT_R
        AUTH_MW --> COMP_R
        AUTH_MW --> NOTES_R
    end

    subgraph StorageLayer["Data & Persistence Layer"]
        FS_UPLOADS["Local Disk Storage\n(server/uploads/*.pdf)"]
        
        subgraph Mongo["MongoDB (Mongoose 9.11)"]
            USER_COL["User Collection\n(name, email, bcrypt password)"]
            DOC_COL["Document Collection\n(title, filePath, text, chunks, ownerId)"]
            CHUNK_COL["Chunk Collection\n(docId, ownerId, text, page, embedding)"]
        end
    end

    subgraph AILayer["AI & Vector Search Engine"]
        VEC_SEARCH["Vector Search Engine\n(Cosine similarity across chunk embeddings)"]
        OLLAMA["Local Ollama Service (port 11434)\nModel: qwen2.5:3b (RAG Grounding)"]
        LANGCHAIN["LangChain Tools Pipeline\n(evidenceTools.js + aiService.js)"]
    end

    API_CLIENT -->|HTTP / JSON + Bearer JWT| SERVER
    DOC_R -->|Multipart Upload| FS_UPLOADS
    DOC_R --> DOC_COL
    DOC_R --> CHUNK_COL
    AUTH_R --> USER_COL
    SEARCH_R --> VEC_SEARCH
    VEC_SEARCH --> CHUNK_COL
    CHAT_R --> VEC_SEARCH
    CHAT_R -->|System Prompt + Context| OLLAMA
    AGENT_R --> LANGCHAIN
    LANGCHAIN --> VEC_SEARCH
```

---

## Architectural Principles & Design Decisions

### 1. Unified Authentication & Authorization
- **Token Format:** JSON Web Tokens (JWT) signed with `process.env.JWT_SECRET` and expiring in 24 hours.
- **Client Storage:** Managed in `sessionStorage` (`project17_auth_token` and `project17_auth_user`). Session ends when browser tab closes.
- **Header Propagation:** Outgoing requests automatically include `Authorization: Bearer <token>`.
- **Query Scoping:** Every authenticated database operation scopes queries by `ownerId: req.user.id`, ensuring User A cannot read or modify User B's documents.

### 2. Mock / Real API Separation
- **Configuration Switch:** `VITE_USE_MOCK=true` in `client/.env`.
- **Service Layer Guard:** Every API service (`compareApi.js`, `notesApi.js`, `chatApi.js`) checks `USE_MOCK` first.
- **No Fake Success in Live Mode:** In live mode (`VITE_USE_MOCK=false`), real HTTP requests are dispatched to the backend. If an endpoint is offline or returns an error (such as 404), the UI presents an informative error with a Retry button rather than masking the error with dummy data.

### 3. Grounded Evidence & Anti-Hallucination
- **RAG Chat Grounding:** The chat endpoint queries the vector database for top K passages matching the query. If no passages exceed the relevance threshold, the system immediately returns `"There is not enough evidence in the selected document to answer this question."` without querying the LLM.
- **Explicit Page Citations:** Every retrieved chunk stores its source `page` number. Citations are passed to the frontend as structured `{ page: Number, text: String }` objects.
- **Missing Information Standard:** In Study Comparison, missing research questions, sample sizes, or limitations render as `"Not found in the paper"` rather than assumed or synthesized claims.
