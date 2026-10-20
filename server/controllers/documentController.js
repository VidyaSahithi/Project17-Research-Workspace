
const { extractTextFromPDF } = require("../services/pdfExtractor");
const { extractTextFromTXT } = require("../services/txtExtractor");
const { chunkText } = require("../services/textChunker");
const Document = require("../models/Document");
const { processDocument } = require("../services/processDocument");
const path = require("path");

async function uploadDocument(req, res) {
    let document;

    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const extension = path.extname(req.file.originalname).toLowerCase();

        if (![".pdf", ".txt"].includes(extension)) {
            return res.status(400).json({
                message: "Only PDF and TXT files are supported"
            });
        }

        document = await Document.create({
            title: req.file.originalname,
            filePath: req.file.path,
            extractedText: "",
            ownerId: req.user.id,
            status: "PROCESSING"
        });

        let extractedText;

        if (extension === ".pdf") {
            extractedText = await extractTextFromPDF(req.file.path);
        } else {
            extractedText = await extractTextFromTXT(req.file.path);
        }

        if (typeof extractedText !== "string" || !extractedText.trim()) {
            throw new Error("No readable text found in the uploaded file");
        }

        // M2: Save extracted text and application-level chunks.
        document.extractedText = extractedText;
        document.chunks = chunkText(extractedText);
        await document.save();

        // M3: Generate embeddings and store searchable Chunk records.
        await processDocument({
            documentId: document._id,
            ownerId: document.ownerId,
            pages: [
                {
                    text: extractedText,
                    page: null,
                    section: null
                }
            ]
        });

        // Mark complete only after both processing steps succeed.
        document.status = "COMPLETED";
        await document.save();

        return res.status(201).json({
            message: "Document uploaded, extracted, and processed successfully",
            documentId: document._id,
            fileName: req.file.originalname,
            ownerId: document.ownerId,
            status: document.status,
            extractedText
        });
    } catch (error) {
        console.error("Document upload error:", error);

        if (document) {
            document.status = "FAILED";

            await document.save().catch(saveError => {
                console.error("Failed to update document status:", saveError);
            });
        }

        return res.status(500).json({
            message: "Failed to process document"
        });
    }
}

module.exports = { uploadDocument };
