import express from "express";
import { z } from "zod";
import { llm } from "../services/aiService.js";

const router = express.Router();

// Define a Zod schema so the AI response is strictly validated
const evidenceResponseSchema = z.object({
  proposal: z.string().describe("The synthesized research proposal or answer"),
  citations: z.array(z.string()).describe("List of source passage IDs used"),
});

router.post("/evidence-agent", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Invoke local Ollama model
    const response = await llm.invoke(`Answer this research query concisely: ${query}`);

    res.json({
      success: true,
      query,
      result: response.content,
    });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: "Internal server error in AI agent" });
  }
});

export default router;