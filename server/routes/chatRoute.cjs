
const express = require("express");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    // Load the ES-module AI service asynchronously.
    const { llm } = await import("../services/aiService.js");

    const prompt = `
You are a research assistant. Answer only from the
available evidence. If evidence is insufficient, say:
"Insufficient evidence in passages."

Question: ${question}

Context: Simulated retrieval data for document ${
      documentId || "default"
    }
`;

    const response = await llm.invoke(prompt);

    return res.json({
      answer:
        response.content || "Insufficient evidence in passages.",
      sources: [],
      warning:
        "Retrieval is simulated; citations are not verified.",
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);

    return res.status(500).json({
      error: "Chat request failed",
      details: error.message,
    });
  }
});

module.exports = router;
