
const fs = require("fs/promises");

async function extractTextFromTXT(filePath) {
    const text = await fs.readFile(filePath, "utf8");

    if (!text.trim()) {
        throw new Error("The uploaded TXT file is empty.");
    }

    return text;
}

module.exports = { extractTextFromTXT };
