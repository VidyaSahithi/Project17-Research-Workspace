import express from "express";
import { llm } from "../services/aiService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
    try {
        const { documentId, question } = req.body;

        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        // Grounded prompt enforcing strict adherence to retrieved context
        const prompt = `You are a rigorous research assistant. Answer the question using ONLY the provided context passages. 
If the context does not contain enough evidence to answer fully, state clearly: "Insufficient evidence in passages." Do not invent details.

Question: ${question}
Context: [Passage 1: Simulated retrieval data for document ${documentId || "default"}]`;

        const response = await llm.invoke(prompt);
        const answerText = response.content || "Insufficient evidence in passages.";

        res.json({
            answer: answerText,
            sources: [
                {
                    documentId: documentId || "doc-1",
                    title: "Research Paper Extract",
                    page: 1,
                    text: "Simulated passage text supporting the finding."
                }
            ]
        });
    } catch (error) {
        console.error("Chat endpoint error:", error);
        res.status(500).json({ error: "Internal server error in chat endpoint" });
    }
});

export default router;