const { getModels } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail, emailTemplates } = require("../../utils/email");
const adminAuth = require("../middleware/adminAuth");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

exports.register = async (req, res) => {
  try {
    const { User } = getModels();
    const { name, email, password, role, phone, address, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      gender,
    });

    // Send registration success email only for doctors and patients (not admins)
    if (role !== 'admin') {
      try {
        const html = emailTemplates.welcome(name);
        await sendEmail(email, "Welcome to WeCure! 🎉", html);
      } catch (emailError) {
        console.error("Failed to send registration email:", emailError);
        // Don't fail the registration if email fails
      }
    }

    const payload = {
      id: user.id,
      role: user.role,
    };
    const secret = process.env.JWT_SECRET || "supersecret";
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });
    res
      .status(201)
      .json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          gender: user.gender,
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { User, Doctor } = getModels();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ 
        message: "Email not registered",
        errorType: "email_not_found",
        suggestion: "This email address is not registered. Please check your email or sign up for a new account."
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Incorrect password",
        errorType: "wrong_password",
        suggestion: "The password you entered is incorrect. Please try again or use 'Forgot Password' to reset."
      });
    }
    const payload = {
      id: user.id,
      role: user.role,
    };
    const secret = process.env.JWT_SECRET || "supersecret";
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    // Send login success email only for doctors and patients (not admins)
    if (user.role !== 'admin') {
      try {
        const loginTime = new Date().toLocaleString();
        const deviceInfo = req.headers["user-agent"] || "Unknown device";
        const html = emailTemplates.loginNotification(
          user.name,
          loginTime,
          deviceInfo
        );
        await sendEmail(user.email, "🔐 Login Notification - WeCure", html);
      } catch (emailError) {
        console.error("Failed to send login email:", emailError);
        // Don't fail the login if email fails
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const { User } = getModels();
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { User } = getModels();
    const userId = req.user.id;
    const {
      name,
      phone,
      address,
      gender,
      age,
      weight,
      height,
      bloodGroup,
      allergies,
      lifestyle,
      profilePicture,
    } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (gender) updateFields.gender = gender;
    if (age !== undefined) updateFields.age = age;
    if (weight) updateFields.weight = weight;
    if (height) updateFields.height = height;
    if (bloodGroup) updateFields.bloodGroup = bloodGroup;
    if (allergies) updateFields.allergies = allergies;
    if (lifestyle) updateFields.lifestyle = lifestyle;
    if (profilePicture) updateFields.profilePicture = profilePicture;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update(updateFields);
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Logout function
exports.logout = async (req, res) => {
  try {
    // Since JWT is stateless, we can't invalidate it on the server side
    // But we can log the logout action and return success
    // The client should remove the token from localStorage

    // Log logout action (optional - for audit purposes)
    console.log(
      `User ${req.user.id} logged out at ${new Date().toISOString()}`
    );

    res.json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create admin user (protected by admin auth)
exports.createAdmin = async (req, res) => {
  try {
    const { User } = getModels();
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        phone: adminUser.phone
      }
    });
  } catch (err) {
    console.error('Error creating admin user:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};
