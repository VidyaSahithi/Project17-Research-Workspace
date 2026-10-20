
function chunkPages(pages, chunkSize = 800, overlap = 120) {
  if (!Array.isArray(pages)) {
    throw new Error("Pages must be an array");
  }

  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error("Invalid chunk size or overlap");
  }

  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    if (!page || typeof page.text !== "string") {
      continue;
    }

    const text = page.text.trim();

    if (!text) {
      continue;
    }

    let start = 0;

    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length);

      // Prefer ending at a word boundary.
      if (end < text.length) {
        const boundary = text.lastIndexOf(" ", end);

        if (boundary > start) {
          end = boundary;
        }
      }

      const chunkText = text.slice(start, end).trim();

      if (chunkText) {
        chunks.push({
          chunkIndex: chunkIndex++,
          page: page.page,
          section: page.section || null,
          text: chunkText
        });
      }

      if (end >= text.length) {
        break;
      }

      start = end - overlap;
    }
  }

  return chunks;
}

module.exports = { chunkPages };
