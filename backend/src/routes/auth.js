const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", auth, authController.logout);

// Get current user's profile
router.get("/profile", auth, authController.getProfile);

// Update current user's profile
router.put("/profile", auth, authController.updateProfile);

// Create admin user (protected by admin auth)
router.post("/create-admin", adminAuth, authController.createAdmin);

// Note: Doctor routes are handled in /api/doctor routes

module.exports = router;
