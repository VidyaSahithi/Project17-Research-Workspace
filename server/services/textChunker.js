
function chunkText(text, chunkSize = 1000, overlap = 150) {
    if (typeof text !== "string" || !text.trim()) {
        throw new Error("Text must not be empty.");
    }

    if (
        chunkSize <= 0 ||
        overlap < 0 ||
        overlap >= chunkSize
    ) {
        throw new Error("Invalid chunk size or overlap.");
    }

    const cleanText = text.trim();
    const chunks = [];
    let start = 0;

    while (start < cleanText.length) {
        let end = Math.min(start + chunkSize, cleanText.length);

        if (end < cleanText.length) {
            const space = cleanText.lastIndexOf(" ", end);

            if (space > start) {
                end = space;
            }
        }

        const chunk = cleanText.slice(start, end).trim();

        if (chunk) {
            chunks.push({
                chunkIndex: chunks.length,
                text: chunk,
                startIndex: start,
                endIndex: end
            });
        }

        if (end >= cleanText.length) break;

        let nextStart = end - overlap;

        // Move forward to the next word boundary.
        while (
            nextStart < end &&
            nextStart > 0 &&
            cleanText[nextStart] !== " "
        ) {
            nextStart++;
        }

        start = nextStart;
    }

    return chunks;
}

module.exports = { chunkText };
