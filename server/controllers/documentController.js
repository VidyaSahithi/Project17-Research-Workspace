
const { extractTextFromPDF } = require("../services/pdfExtractor");
const Document = require("../models/Document");

async function uploadDocument(req, res) {
    let document;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No PDF file uploaded"
            });
        }

        // Create a document record in MongoDB
        document = await Document.create({
            title: req.file.originalname,
            filePath: req.file.path,
            extractedText: "",
            status: "PROCESSING"
        });

        // Extract text from the uploaded PDF
        const extractedText = await extractTextFromPDF(req.file.path);

        // Save extracted text and update status
        document.extractedText = extractedText;
        document.status = "COMPLETED";
        await document.save();

        return res.status(201).json({
            message: "PDF uploaded, extracted, and saved successfully",
            documentId: document._id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            status: document.status,
            extractedText: extractedText
        });

    } catch (error) {
        console.error("Document upload error:", error);

        // Mark the record as failed if it was created
        if (document) {
            document.status = "FAILED";
            await document.save().catch(saveError => {
                console.error("Failed to update document status:", saveError);
            });
        }

        return res.status(500).json({
            message: "Failed to process PDF"
        });
    }
}

module.exports = {
    uploadDocument
};
