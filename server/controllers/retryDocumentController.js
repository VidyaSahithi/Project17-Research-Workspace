const mongoose = require("mongoose");
const path = require("path");
const Document = require("../models/Document");
const { extractTextFromPDF } = require("../services/pdfExtractor");
const { extractTextFromTXT } = require("../services/txtExtractor");
const { processDocument } = require("../services/processDocument");

async function retryDocument(req, res) {
  let document;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid document ID." });
    }

    document = await Document.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }

    if (document.status !== "FAILED") {
      return res.status(409).json({
        error: "Only failed documents can be retried.",
        status: document.status,
      });
    }

    const extension = path.extname(document.title).toLowerCase();

    if (![".pdf", ".txt"].includes(extension)) {
      return res.status(400).json({
        error: "Only PDF and TXT documents can be retried.",
      });
    }

    document.status = "PROCESSING";
    await document.save();

    const filePath = path.resolve(document.filePath);

    const extractedText =
      extension === ".pdf"
        ? await extractTextFromPDF(filePath)
        : await extractTextFromTXT(filePath);

    if (typeof extractedText !== "string" || !extractedText.trim()) {
      throw new Error("No readable text found in the stored file.");
    }

    document.extractedText = extractedText;
    await document.save();

    await processDocument({
      documentId: document._id,
      ownerId: document.ownerId,
      pages: [{ text: extractedText, page: null, section: null }],
    });

    document.status = "COMPLETED";
    await document.save();

    return res.json({
      message: "Document processing completed successfully.",
      documentId: String(document._id),
      status: document.status,
    });
  } catch (error) {
    console.error("Document retry error:", error.message);

    if (document) {
      document.status = "FAILED";
      await document.save().catch((saveError) => {
        console.error("Failed to update retry status:", saveError.message);
      });
    }

    return res.status(500).json({
      error: "Failed to retry document processing.",
    });
  }
}

module.exports = { retryDocument };
