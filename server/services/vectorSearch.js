
const mongoose = require("mongoose");
const Chunk = require("../models/Chunk");
const { generateEmbedding } = require("./embeddings");

async function searchChunks({ query, documentId, ownerId, limit = 5 }) {
  if (!query || !query.trim()) {
    throw new Error("Search query is required");
  }

  if (!mongoose.isValidObjectId(ownerId)) {
    throw new Error("Invalid owner ID");
  }

  const filter = {
    ownerId: {
      $eq: new mongoose.Types.ObjectId(ownerId)
    }
  };

  if (documentId) {
    if (!mongoose.isValidObjectId(documentId)) {
      throw new Error("Invalid document ID");
    }

    filter.documentId = {
      $eq: new mongoose.Types.ObjectId(documentId)
    };
  }

  const embedding = await generateEmbedding(query);

  return Chunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit,
        filter
      }
    },
    {
      $project: {
        _id: 1,
        documentId: 1,
        text: 1,
        page: 1,
        section: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);
}

module.exports = { searchChunks };
