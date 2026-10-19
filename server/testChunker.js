
const { chunkText } = require("./services/textChunker");

const sampleText =
    "Climate change affects rainfall patterns. " +
    "Heavy rainfall can cause urban flooding. " +
    "Early warning systems help communities prepare. ";

try {
    const chunks = chunkText(sampleText, 50, 10);

    console.log("Total chunks:", chunks.length);

    chunks.forEach((chunk) => {
        console.log("\nChunk index:", chunk.chunkIndex);
        console.log("Text:", chunk.text);
        console.log("Start:", chunk.startIndex);
        console.log("End:", chunk.endIndex);
    });
} catch (error) {
    console.error("Chunking failed:", error.message);
}
