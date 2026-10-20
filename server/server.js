
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documents");

const app = express();

app.use(cors());
app.use(express.json());

// Existing authentication routes
app.use("/api/auth", authRoutes);
// PDF upload routes
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
