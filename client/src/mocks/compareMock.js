/**
 * Mock data for Study Comparison (M8).
 * Reflects structured evidence extracted from research papers.
 */

export const mockStudies = [
  {
    id: "study-001",
    documentId: "doc-1",
    title: "AI in Healthcare: Diagnostic Accuracy of Deep Learning Models",
    filename: "AI in Healthcare.pdf",
    year: 2024,
    authors: "Chen et al.",
    researchQuestion: "How does deep neural network assistance impact diagnostic sensitivity and turnaround time in clinical radiology?",
    researchMethod: "Double-blind retrospective comparative cohort study evaluating 50 board-certified radiologists with and without AI triage assistance.",
    sampleOrData: "1,420 multi-center chest radiography scans collected across 3 hospital networks (2021-2023).",
    findings: "Diagnostic sensitivity increased by 14.2% (p < 0.01) with a 22% reduction in false-positive nodules and 6-minute average decrease in triage time.",
    limitations: "Dataset was limited to adult patients with no prior thoracic surgeries; multi-vendor scanner calibration was not fully uniform.",
    sourcePage: 4,
  },
  {
    id: "study-002",
    documentId: "doc-2",
    title: "Climate Study: Urban Heat Island Mitigation Strategies",
    filename: "Climate Study.pdf",
    year: 2023,
    authors: "Vargas & O'Connor",
    researchQuestion: "What is the relative cooling efficacy of reflective roofing compared to urban green canopy interventions in temperate metropolitan zones?",
    researchMethod: "Longitudinal micro-climatic satellite sensor monitoring paired with numerical thermal simulation modeling over a 24-month span.",
    sampleOrData: "48 continuous sensor nodes across 12 urban districts with varying surface albedo and canopy density.",
    findings: "High-albedo reflective materials reduced localized ambient peak temperatures by 1.8°C; green corridors lowered night heat retention by 2.4°C.",
    limitations: "Precipitation anomalies in year 2 slightly altered vegetative transpiration rates; winter thermal penalty was not evaluated.",
    sourcePage: 7,
  },
  {
    id: "study-003",
    documentId: "doc-3",
    title: "Transformer Architectures for Longitudinal Clinical Records",
    filename: "Clinical Transformers.pdf",
    year: 2024,
    authors: "Patel, Zhao, et al.",
    researchQuestion: "Can transformer-based foundation models reliably predict 30-day hospital readmission from unstructured clinical EHR notes?",
    researchMethod: "Observational retrospective study utilizing fine-tuned clinical transformer models against standard XGBoost baselines.",
    sampleOrData: "28,500 de-identified patient encounter notes from tertiary care electronic health records.",
    findings: "AUROC of 0.86 achieved compared to 0.74 baseline; significant improvement in identifying high-risk cardiovascular patients earlier in admission.",
    limitations: "Not found in the paper",
    sourcePage: 12,
  },
  {
    id: "study-004",
    documentId: "doc-4",
    title: "Quantum Computing Algorithms in Cryptographic Key Exchange",
    filename: "Post-Quantum Cryptography.pdf",
    year: 2025,
    authors: "Kowalski & Lindholm",
    researchQuestion: "What is the latency overhead of lattice-based post-quantum key exchange mechanisms in high-throughput TLS connections?",
    researchMethod: "Experimental performance benchmarking measuring handshake latency, CPU utilization, and packet fragmentation.",
    sampleOrData: null, // intentionally null to verify 'Not found in the paper' handling
    findings: "Lattice key encapsulation incurred 8.4ms additional handshake latency but sustained over 12,000 req/sec on modern server hardware.",
    limitations: "Client-side battery consumption on low-power IoT devices was outside the measurement scope.",
    sourcePage: null, // missing source page to test fallback
  },
];

let simulatedFailureActive = false;

export function setSimulatedCompareFailure(fail) {
  simulatedFailureActive = fail;
}

export async function fetchMockStudies() {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (simulatedFailureActive) {
    throw new Error("Unable to retrieve studies from the server. Check your connection and retry.");
  }

  return JSON.parse(JSON.stringify(mockStudies));
}
