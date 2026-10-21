const express = require("express");
const multer = require("multer");
const { uploadDocument } = require("../controllers/documentController");
const { listDocuments } = require("../controllers/documentListController");
const { retryDocument } = require("../controllers/retryDocumentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", authMiddleware, listDocuments);

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

router.post("/:id/retry", authMiddleware, retryDocument);

module.exports = router;
