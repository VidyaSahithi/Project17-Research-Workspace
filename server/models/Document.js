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