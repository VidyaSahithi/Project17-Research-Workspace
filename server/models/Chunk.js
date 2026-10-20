import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
    collectionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    embedding: { type: [Number], required: true }, // Vector array matching nomic-embed-text dimensions (768)
});

export default mongoose.model("Chunk", chunkSchema);