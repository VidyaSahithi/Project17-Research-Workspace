
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    console.log("PDF file size:", dataBuffer.length);

   const parser = new PDFParse({
    data: new Uint8Array(dataBuffer)
});

    try {
        const result = await parser.getText();

        console.log("PDF extraction result:", result);
        console.log("Extracted text length:", result.text.length);

        return result.text;
    } finally {
        await parser.destroy();
    }
}

module.exports = { extractTextFromPDF };
