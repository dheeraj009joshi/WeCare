const jwt = require('jsonwebtoken');
const { getModels } = require('../models');

const doctorAuth = async (req, res, next) => {
  try {
    const { Doctor } = getModels();
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is a doctor
    if (decoded.role !== 'doctor') {
      return res.status(403).json({
        message: 'Access denied. Doctor role required'
      });
    }

    // Get doctor from database
    const doctor = await Doctor.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!doctor) {
      return res.status(401).json({
        message: 'Token is not valid'
      });
    }

    // Add doctor to request object
    req.user = {
      id: doctor.id,
      email: doctor.email,
      role: 'doctor'
    };

    next();
  } catch (error) {
    console.error('Doctor auth error:', error);
    res.status(401).json({
      message: 'Token is not valid'
    });
  }
};

module.exports = doctorAuth; 