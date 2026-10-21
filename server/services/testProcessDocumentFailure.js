
require("dotenv").config();

const mongoose = require("mongoose");
const Chunk = require("../models/Chunk");
const { processDocument } = require("./processDocument");
const { generateEmbedding } = require("./embeddings");

async function testFailurePreservesChunks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const ownerId = new mongoose.Types.ObjectId(
      "6ad50689059f524b349887ee"
    );
    const documentId = new mongoose.Types.ObjectId();

    const embedding = await generateEmbedding(
      "Existing chunk that must be preserved."
    );

    await Chunk.create({
      documentId,
      ownerId,
      chunkIndex: 0,
      text: "Existing chunk that must be preserved.",
      page: 1,
      embedding
    });

    console.log("Created original chunk.");

    let failureCaught = false;

    try {
      await processDocument({
        documentId,
        ownerId,
        pages: [
          {
            page: 1,
            text: "Replacement content that will fail during embedding. ".repeat(20)
          }
        ],
        embeddingGenerator: async () => {
          throw new Error("Simulated embedding failure");
        }
      });
    } catch (error) {
      failureCaught = true;
      console.log("Expected failure:", error.message);
    }

    const remaining = await Chunk.find({ documentId, ownerId });

    console.log("Chunks remaining:", remaining.length);
    console.log("Remaining text:", remaining[0]?.text);

    if (
      failureCaught &&
      remaining.length === 1 &&
      remaining[0].text === "Existing chunk that must be preserved."
    ) {
      console.log("PASS: Existing chunks survived the failure.");
    } else {
      console.log("FAIL: Preservation test did not pass.");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testFailurePreservesChunks();
