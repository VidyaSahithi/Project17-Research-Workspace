const { extractTextFromPDF } = require("../services/pdfExtractor");

async function uploadDocument(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No PDF file uploaded"
            });
        }

        const extractedText = await extractTextFromPDF(req.file.path);

        res.status(201).json({
            message: "PDF uploaded and text extracted successfully",
            fileName: req.file.originalname,
            filePath: req.file.path,
            extractedText: extractedText
        });

    } catch (error) {
        console.error("Document upload error:", error);

        res.status(500).json({
            message: "Failed to process PDF"
        });
    }
}

module.exports = {
    uploadDocument
};