
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        extractedText: {
            type: String,
            default: ""
        },

        chunks: {
            type: [
                {
                    chunkIndex: {
                        type: Number,
                        required: true
                    },
                    text: {
                        type: String,
                        required: true
                    },
                    startIndex: {
                        type: Number,
                        required: true
                    },
                    endIndex: {
                        type: Number,
                        required: true
                    }
                }
            ],
            default: []
        },


        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["UPLOADED", "PROCESSING", "COMPLETED", "FAILED"],
            default: "UPLOADED"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Document", documentSchema);
