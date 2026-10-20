
require("dotenv").config();

const mongoose = require("mongoose");
const { processDocument } = require("./processDocument");

async function testProcessDocument() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Use your actual registered user's ID
    const ownerId = new mongoose.Types.ObjectId(
      "6ad50689059f524b349887ee"
    );

    const documentId = new mongoose.Types.ObjectId();

    const pages = [
      {
        page: 1,
        text: "Project 17 is a research workspace. ".repeat(40)
      },
      {
        page: 2,
        text: "This page contains sample text for testing retrieval and citations. ".repeat(40)
      }
    ];

    const result = await processDocument({
      documentId,
      ownerId,
      pages
    });

    console.log("Processing result:", result);

    const Chunk = require("../models/Chunk");
    const savedChunks = await Chunk.find({ documentId, ownerId });

    console.log("Chunks saved in MongoDB:", savedChunks.length);
    console.log("Test document ID:", documentId.toString());
    console.log("Test owner ID:", ownerId.toString());
    console.log("First chunk page:", savedChunks[0]?.page);
    console.log(
      "Embedding dimensions:",
      savedChunks[0]?.embedding?.length
    );

    if (savedChunks.length > 0) {
      console.log("Document processing test successful!");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testProcessDocument();
