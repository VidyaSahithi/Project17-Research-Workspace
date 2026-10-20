import express from "express";
import { llm } from "../services/aiService.js";

const router = express.Router();

// POST /api/chat - Main RAG endpoint consumed by Frontend M6
router.post("/chat", async (req, res) => {
    try {
        const { question, passages } = req.body;

        // Fallback check: if no passages found, return honest answer without guessing
        if (!passages || passages.length === 0) {
            return res.json({
                answer: "The provided passages do not contain enough evidence to answer this question.",
                sources: []
            });
        }

        // Construct grounded prompt
        const prompt = `
    You are an AI research assistant. Answer the question using ONLY the provided passages. 
    Always cite the document and page number. If the answer is missing, state it honestly.

    Passages:
    ${JSON.stringify(passages, null, 2)}

    Question: ${question}
    `;

        const aiResponse = await llm.invoke(prompt);

        res.json({
            answer: aiResponse.content,
            sources: passages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;