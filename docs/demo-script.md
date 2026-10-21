# Project 17 — M8 Demonstration Recording Script & Walkthrough

This document provides the exact end-to-end demonstration script and verification checklist for presenting the **Project 17: Research Reading and Evidence Workspace**.

**Target Demo Duration:** 3 to 4 minutes  
**Artifact Recording Status:** *Pending User Execution / Video Capture*  
*(Do not mark video as recorded until physical capture is performed following this script.)*

---

## 1. Demo Preparation Checklist

Before recording or presenting, verify:
- [ ] Client dev server is running on `http://localhost:5173`.
- [ ] `client/.env` contains `VITE_USE_MOCK=true` and `VITE_API_URL=http://localhost:5000`.
- [ ] Browser window is sized to 1280x800 or 1920x1080 with clean zoom (100%).
- [ ] Clear browser session (`sessionStorage.clear()` or use an Incognito tab).

---

## 2. Step-by-Step Demonstration Workflow

### Step 1: User Login
- **Navigation:** Open `http://localhost:5173/login`.
- **Action:** Enter demo researcher credentials:
  - **Email:** `student@researchspace.internal`
  - **Password:** `StudentPassword123!`
  - Click **Sign in**.
- **Expected Visual Result:**
  - Fast authentication redirect to `/dashboard`.
  - Welcome banner appears: *"Welcome to ResearchSpace"*.
  - User avatar in top-right navbar shows **A** (Alex Rivera) with Sign out button.

### Step 2: Explore & Upload a Research Paper
- **Navigation:** Click **Document Library** (`/documents`) in the sidebar.
- **Action:**
  - View the list of documents (`AI in Healthcare`, `Climate Study`).
  - Demonstrate upload button: Click **Upload Document** and select a PDF file (e.g. `AI in Healthcare.pdf`).
  - Observe progress indicator.
- **Expected Visual Result:**
  - Upload progress displays percentages.
  - Document card shows `COMPLETED` / `Ready to read` status tag with file metadata.

### Step 3: Ask a Question with Cited Passages (RAG Chat)
- **Navigation:** Click **Research Chat** (`/chat`) in the sidebar.
- **Action:**
  - Select document: `"AI in Healthcare: Sample Research Review.pdf"`.
  - Type question: `"What are the main limitations and evaluation considerations?"`
  - Click **Send** (or press Enter).
- **Expected Visual Result:**
  - Question appears in chat bubble.
  - Assistant responds with grounded findings citing evaluating dataset quality, bias, and generalizability.
  - Source citations expand below the answer showing **📄 Page 5** with exact extracted passage excerpt.
- **Bonus Check (Anti-Hallucination):**
  - Type: `"What is the weather in Paris today?"`
  - Assistant responds clearly: *"There is not enough evidence in the selected paper to answer that question."* (Zero hallucinated citations).

### Step 4: Review and Verify Evidence
- **Navigation:** Observe Evidence Board and Study Metadata.
- **Action:**
  - Explain the evidence extraction pipeline: How M7 structures evidence into Research Question, Methodology, Sample/Data, Findings, Limitations, and verified Source Pages.

### Step 5: Compare Studies Side by Side (M8 Feature)
- **Navigation:** Click **Study Comparison** (`/compare`) in the sidebar.
- **Action:**
  - Point out the **Mock Mode Active** status badge in header.
  - Review the **Study Picker**:
    - Observe 4 available studies with search filter.
    - Type `"Radiology"` in search to demonstrate live filtering.
    - Click **Clear Selection** to demonstrate the *"Select At Least Two Studies"* empty state.
    - Select Study 1 (`AI in Healthcare`) and Study 2 (`Climate Study`).
    - Select Study 4 (`Quantum Cryptography`).
  - Scroll through the comparison table:
    - **Research Question:** Clear side-by-side comparison.
    - **Research Method:** Cohort study vs. longitudinal sensors.
    - **Sample / Data:** Highlight how Study 4 shows `"Not found in the paper"` because sample size was omitted in the study.
    - **Source Page:** Point out green citation chips (**📄 Page 4**, **📄 Page 7**).
  - Demonstrate column removal: Click **×** on Study 4 header to return to 2-study view.

### Step 6: Create and Save a Private Research Note (M8 Feature)
- **Navigation:** Click **Private Notes** (`/notes`) in the sidebar.
- **Action:**
  - Point out the privacy badge: `🔒 Private to Alex Rivera`.
  - Click **+ New Note**.
  - Fill in Note Form:
    - **Title:** `"Clinical Integration Thesis Reflection"`
    - **Associated Paper:** Select `"AI in Healthcare: Diagnostic Accuracy of Deep Learning Models"` from dropdown.
    - **Tags:** `"thesis, validation, clinical-workflow"`
    - **Content:** `"The 14.2% diagnostic gain warrants inclusion in Chapter 3 of my thesis. Must contrast with the adult-only cohort constraint noted on Page 4."`
  - Click **Create Note**.
- **Expected Visual Result:**
  - Green confirmation banner appears: `✓ Note saved successfully!`.
  - New note immediately appears at the top of the Left Pane with tag chips and associated paper badge.
  - Search filter: Type `"thesis"` in the search bar to demonstrate instant client-side filtering.
  - Click **🗑 Delete** on a note: Confirmation prompt appears (`Yes, Delete` / `Cancel`) before removing.

---

## 3. Post-Demo Reset & Cleanup

To restore clean demo state:
1. Reload browser or clear sessionStorage.
2. Verify dev servers remain running without error output.
