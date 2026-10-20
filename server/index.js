import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import agentRoutes from "./routes/agent.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Mount the route
app.use("/api", agentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Member 4 AI server running smoothly! 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});