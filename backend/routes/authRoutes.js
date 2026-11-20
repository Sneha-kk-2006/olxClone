const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  register,
    login
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    message: "Authenticated successfully",
    user: req.user
  });
});

module.exports = router;

// Get logged-in user
