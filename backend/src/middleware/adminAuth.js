const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Lazy load models to avoid initialization issues
    const { User } = require('../models').getModels();
    // ✅ Fetch models safely from global after initialization
    const models = global.models;
    if (!models || !models.User) {
      return res.status(500).json({
        success: false,
        message: "Server not ready. Please try again later.",
      });
    }
    const user = await User.findByPk(decoded.userId);


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

module.exports = adminAuth;
