
const mongoose = require("mongoose");
const { searchChunks } = require("../services/vectorSearch");

async function search(req, res) {
  try {
    const { query, documentId } = req.body;

    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        error: "A valid search query is required"
      });
    }

    if (documentId && !mongoose.isValidObjectId(documentId)) {
      return res.status(400).json({
        error: "Invalid document ID"
      });
    }

    const results = await searchChunks({
      query: query.trim(),
      documentId,
      ownerId: req.user.id
    });

    return res.json({
      query: query.trim(),
      count: results.length,
      results
    });
  } catch (error) {
    console.error("Search error:", error.message);
    return res.status(500).json({
      error: "Search failed"
    });
  }
}

module.exports = { search };
