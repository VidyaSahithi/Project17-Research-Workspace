export const DEMO_DOCUMENT = {
  id: "demo-paper-001",
  title: "AI in Healthcare: Sample Research Review.pdf",
};
const failedRetryTests = new Set();

const sampleSources = [
  {
    documentId: DEMO_DOCUMENT.id,
    title: DEMO_DOCUMENT.title,
    page: 4,
    text: "Sample passage: AI-assisted tools can help summarize clinical information and highlight relevant patterns. These tools are intended to support clinical decision-making.",
  },
  {
    documentId: DEMO_DOCUMENT.id,
    title: DEMO_DOCUMENT.title,
    page: 5,
    text: "Sample passage: Important evaluation considerations include dataset quality, bias, generalizability, and clinical validation before deployment.",
  },
];

export async function getMockChatResponse(question) {
  // Simulate a short backend response delay.
  await new Promise((resolve) => setTimeout(resolve, 700));

  const normalizedQuestion = question.toLowerCase();
  // Test-only scenario: fail once, then let Retry succeed.
if (
  normalizedQuestion.includes("demo retry test") &&
  !failedRetryTests.has(normalizedQuestion)
) {
  failedRetryTests.add(normalizedQuestion);

  throw new Error(
    "Simulated temporary error. Click Try again to retry."
  );
}

  // Demonstrate the insufficient-evidence state.
  if (
    /(weather|capital of france|football score|stock price)/i.test(
      normalizedQuestion
    )
  ) {
    return {
      answer:
        "There is not enough evidence in the selected paper to answer that question. Try asking about the paper's methodology, limitations, or evaluation.",
      sources: [],
    };
  }

  if (normalizedQuestion.includes("limitation")) {
    return {
      answer:
        "In this sample response, the paper's limitations include dataset quality, potential bias, generalizability, and the need for clinical validation.",
      sources: [sampleSources[1]],
    };
  }

  return {
    answer:
      "This is a demonstration answer for the M6 chat interface. The sample paper discusses AI-assisted tools for clinical information and highlights evaluation considerations. The citations below are mock examples for testing the interface; they are not retrieved from a real research paper.",
    sources: sampleSources,
  };
}