
const { extractTextFromPDF } = require("../services/pdfExtractor");
const { extractTextFromTXT } = require("../services/txtExtractor");
const { chunkText } = require("../services/textChunker");
const Document = require("../models/Document");
const path = require("path");

async function uploadDocument(req, res) {
    let document;

    try {
        // 1. Check whether a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        // 2. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // 3. Validate file extension
        const extension = path.extname(
            req.file.originalname
        ).toLowerCase();

        if (![".pdf", ".txt"].includes(extension)) {
            return res.status(400).json({
                message: "Only PDF and TXT files are supported"
            });
        }

        // 4. Create document with PROCESSING status
        document = await Document.create({
            title: req.file.originalname,
            filePath: req.file.path,
            extractedText: "",
            ownerId: req.user.id,
            status: "PROCESSING"
        });

        // 5. Extract text from the uploaded file
        let extractedText;

        if (extension === ".pdf") {
            extractedText = await extractTextFromPDF(
                req.file.path
            );
        } else {
            extractedText = await extractTextFromTXT(
                req.file.path
            );
        }

        // 6. Check whether extracted text is empty
        if (
            typeof extractedText !== "string" ||
            !extractedText.trim()
        ) {
            throw new Error(
                "No readable text found in the uploaded file"
            );
        }

        // 7. Split extracted text into chunks
        const chunks = chunkText(extractedText);

        // 8. Save extracted text and chunks to MongoDB
        document.extractedText = extractedText;
        document.chunks = chunks;
        document.status = "COMPLETED";

        await document.save();

        // 9. Send successful response
        return res.status(201).json({
            message: "Document uploaded, extracted, and saved successfully",
            documentId: document._id,
            fileName: req.file.originalname,
            ownerId: document.ownerId,
            status: document.status,
            extractedText
        });

    } catch (error) {
        console.error("Document upload error:", error);

        // 10. Mark the document as FAILED if processing fails
        if (document) {
            document.status = "FAILED";

            await document.save().catch(saveError => {
                console.error(
                    "Failed to update document status:",
                    saveError
                );
            });
        }

        return res.status(500).json({
            message: "Failed to process document"
        });
    }
}

module.exports = {
    uploadDocument
};
