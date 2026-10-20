import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    chunkIndex: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    page: {
      type: Number,
      default: null
    },
    section: {
      type: String,
      default: null
    },
    embedding: {
      type: [Number],
      required: true
    } // Vector array matching nomic-embed-text dimensions (768)
  },
  { timestamps: true }
);

chunkSchema.index(
  { documentId: 1, chunkIndex: 1 },
  { unique: true }
);

export default mongoose.model("Chunk", chunkSchema);