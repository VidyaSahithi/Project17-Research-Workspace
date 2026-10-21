const Document = require("../models/Document");

async function listDocuments(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const documents = await Document.find({ ownerId: req.user.id })
      .sort({ updatedAt: -1 })
      .select("_id title status createdAt updatedAt")
      .lean();

    return res.json({
      documents: documents.map((document) => ({
        documentId: String(document._id),
        title: document.title,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })),
    });
  } catch (error) {
    console.error("List documents error:", error.message);
    return res.status(500).json({
      error: "Unable to load your documents.",
    });
  }
}

module.exports = { listDocuments };
