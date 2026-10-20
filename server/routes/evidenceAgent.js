import express from "express";
import { executeAgentWorkflow } from "../ai/agent.js";

const router = express.Router();

router.post("/evidence-agent", async (req, res) => {
    try {
        const { query } = req.body;
        const result = await executeAgentWorkflow(query || "Analyze research evidence");
        res.json(result);
    } catch (error) {
        res.status(500).json({ proposals: [], notes: error.message });
    }
});

export default router;