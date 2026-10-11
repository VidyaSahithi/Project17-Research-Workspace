const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Authenticated successfully",
    user: req.user,
  });
});
module.exports = router;
