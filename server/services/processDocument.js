
const Chunk = require("../models/Chunk");
const { chunkPages } = require("./chunker");
const { generateEmbedding } = require("./embeddings");

async function processDocument({
  documentId,
  ownerId,
  pages,
  embeddingGenerator = generateEmbedding
}) {
  if (!documentId || !ownerId || !Array.isArray(pages)) {
    throw new Error("documentId, ownerId, and pages are required");
  }

  const chunks = chunkPages(pages);

  if (chunks.length === 0) {
    throw new Error("No text available to process");
  }

  // Generate every embedding before changing existing chunks.
  const records = [];

  for (const chunk of chunks) {
const embedding = await embeddingGenerator(chunk.text);
    records.push({
      documentId,
      ownerId,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      page: chunk.page ?? null,
      section: chunk.section ?? null,
      embedding
    });
  }

  // Replace old chunks only after all embeddings are ready.
  const session = await Chunk.db.startSession();

  try {
    await session.withTransaction(async () => {
      await Chunk.deleteMany(
        { documentId, ownerId },
        { session }
      );

      await Chunk.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }

  return {
    documentId,
    chunksCreated: records.length
  };
}

module.exports = { processDocument };
