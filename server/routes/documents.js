
const express = require("express");
const multer = require("multer");
const { uploadDocument } = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadDocument
);

module.exports = router;
