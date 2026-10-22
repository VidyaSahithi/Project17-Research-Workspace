
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const {
    uploadDocument,
} = require("../controllers/documentController");

const {
    listDocuments,
} = require("../controllers/documentListController");

const {
    retryDocument,
} = require("../controllers/retryDocumentController");

const Document = require("../models/Document");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});

// List only the logged-in user's documents.
router.get("/", authMiddleware, async (req, res) => {
    try {
        const documents = await Document.find({
            ownerId: req.user.id,
        }).sort({ createdAt: -1 });

        res.json({
            documents: documents.map((doc) => ({
                id: doc._id.toString(),
                title: doc.title,
                filename: doc.title,
                status: doc.status,
                createdAt: doc.createdAt,
                size: doc.size,
            })),
        });
    } catch (error) {
        console.error("List documents error:", error);
        res.status(500).json({
            message: "Failed to load documents",
        });
    }
});

// Upload and process a PDF or TXT file.
router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadDocument
);

// Open a document only if it belongs to the logged-in user.
router.get("/:id/open", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid document ID",
            });
        }

        const doc = await Document.findOne({
            _id: req.params.id,
            ownerId: req.user.id,
        });

        if (!doc) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        const filePath = path.resolve(process.cwd(), doc.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "Stored file not found",
            });
        }

        const extension = path.extname(doc.title).toLowerCase();

        res.type(
            extension === ".pdf" ? "application/pdf" : "text/plain"
        );
        res.setHeader("Content-Disposition", "inline");

        return res.sendFile(filePath);
    } catch (error) {
        console.error("Open document error:", error);
        res.status(500).json({
            message: "Failed to open document",
        });
    }
});

// Retry processing a document.
router.post("/:id/retry", authMiddleware, retryDocument);

module.exports = router;
