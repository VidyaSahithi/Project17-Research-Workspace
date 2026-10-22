
const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      default: null,
    },
    section: {
      type: String,
      default: null,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

chunkSchema.index(
  { documentId: 1, chunkIndex: 1 },
  { unique: true }
);

module.exports = mongoose.model("Chunk", chunkSchema);
