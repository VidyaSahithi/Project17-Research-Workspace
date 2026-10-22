const express = require("express");
const mongoose = require("mongoose");
const { Ollama } = require("ollama");
const authMiddleware = require("../middleware/authMiddleware");
const Document = require("../models/Document");
const { searchChunks } = require("../services/vectorSearch");

const router = express.Router();

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434"
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.body;
    const question =
      typeof req.body.question === "string"
        ? req.body.question.trim()
        : "";

    if (!question || question.length > 5000) {
      return res.status(400).json({
        error: "Question must contain between 1 and 5000 characters."
      });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(400).json({
        error: "A valid documentId is required."
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      ownerId: req.user.id
    }).select("_id title status");

    if (!document) {
      return res.status(404).json({
        error: "Document not found."
      });
    }

    if (document.status !== "COMPLETED") {
      return res.status(409).json({
        error: "The document is not ready for questions yet."
      });
    }

    const passages = await searchChunks({
      query: question,
      documentId: document._id,
      ownerId: req.user.id,
      limit: 5
    });

    if (!passages.length) {
      return res.json({
        answer: "There is not enough evidence in the selected document to answer this question.",
        sources: []
      });
    }

    const sources = passages.map((passage) => ({
      documentId: String(passage.documentId),
      title: document.title,
      page: passage.page ?? null,
      text: passage.text
    }));

    const evidence = sources.map((source, index) =>
      `[Source ${index + 1}]\n` +
      `Page: ${source.page ?? "Unavailable"}\n` +
      `Text: ${source.text}`
    ).join("\n\n");

    const response = await ollama.chat({
      model: process.env.CHAT_MODEL || "qwen2.5:3b",
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You are a careful research assistant. Answer using only the evidence supplied by the user. " +
            "Do not invent facts or citations. Cite supporting passages as [1], [2], etc., matching their source order. " +
            "If the evidence does not support an answer, clearly say that there is insufficient evidence."
        },
        {
          role: "user",
          content: `Question:\n${question}\n\nRetrieved evidence:\n${evidence}`
        }
      ],
      options: { temperature: 0.2 }
    });

    const answer = response.message?.content?.trim();

    return res.json({
      answer: answer || "There is not enough evidence to answer this question.",
      sources
    });
  } catch (error) {
    console.error("Chat endpoint error:", error.message);
    return res.status(500).json({
      error: "Chat request failed. Check the backend and Ollama service."
    });
  }
});

module.exports = router;
