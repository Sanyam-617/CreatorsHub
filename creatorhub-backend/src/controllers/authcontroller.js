const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("../config/fireBaseAdmin");
const logger = require("../utils/logger");
// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google Auth
exports.googleAuth = async (req, res) => {
  try {
    const { idToken, name } = req.body;   // name is optional fallback

    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }

    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const verifiedEmail = decodedToken.email;
    const verifiedName = decodedToken.name || name;

    let user = await User.findOne({ email: verifiedEmail });

    if (!user) {
      user = await User.create({
        name: verifiedName,
        email: verifiedEmail,
        password: await bcrypt.hash(require("crypto").randomBytes(32).toString("hex"), 10),
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    logger.error("googleAuth error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};