import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { v2 as cloudinary } from "cloudinary";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/admin/approve/:id", authMiddleware, async (req, res) => {
  const adminUser = await User.findById(req.user.userId);
  try {
    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error approving user." });
  }
});

router.get("/admin/pending-users", authMiddleware, async (req, res) => {
  const adminUser = await User.findById(req.user.userId);
  try {
    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const pendingUsers = await User.find({ status: "pending" });

    res.status(200).json({ users: pendingUsers });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error fetching pending users." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ status: "approved" });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: "Error Getting Users" });
  }
});

router.post("/user/register", async (req, res) => {
  const { name, email, role, password, age, profilePictureUrl } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (role === "admin") {
      return res.status(400).json({ message: "admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      role,
      password: hashedPassword,
      age,
      profilePictureUrl,
      status: role === "admin" ? "approved" : "pending",
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, "your_secret_key", {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access to the cookie to reduce XSS risks.
      secure: true, // Ensures the cookie is sent only over HTTPS.
      maxAge: 60 * 60 * 1000, // Adjust maxAge as needed (this example sets it to 1 hour).
      sameSite: "none", // Provides additional CSRF protection by restricting cross-site sending.
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        id: newUser._id,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Login Route
router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message:
          "Mental you are not registered please a create new account to become a mental.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access to the cookie to reduce XSS risks.
      secure: true, // Ensures the cookie is sent only over HTTPS.
      maxAge: 60 * 60 * 1000, // Adjust maxAge as needed (this example sets it to 1 hour).
      sameSite: "none", // Provides additional CSRF protection by restricting cross-site sending.
    });
    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:id/crimes", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ crimes: user.crimes || [] });
  } catch (error) {
    console.error("Error fetching crimes:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/user/:id/crimes", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { crime } = req.body;
    const crimeDescription = crime;
    console.log(req.body);
    if (!crimeDescription || typeof crimeDescription !== "string") {
      return res.status(400).json({ message: "Invalid crime description" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.crimes.push(crimeDescription);
    await user.save();
    res.status(201).json({
      message: "Crime added successfully",
      crimes: user.crimes,
    });
  } catch (error) {
    console.error("Error adding crime:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/user/:id/crimes", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { crime } = req.body;
    const crimeDescription = crime;
    if (!crimeDescription || typeof crimeDescription !== "string") {
      return res.status(400).json({ message: "Invalid crime description" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const crimeIndex = user.crimes.indexOf(crimeDescription);
    if (crimeIndex === -1) {
      return res.status(404).json({ message: "Crime not found" });
    }
    user.crimes.splice(crimeIndex, 1);
    await user.save();
    res.status(200).json({
      message: "Crime removed successfully",
      crimes: user.crimes,
    });
  } catch (error) {
    console.error("Error removing crime:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/user/update", authMiddleware, async (req, res) => {
  const { id, name, email, age, profilePictureUrl, role, password } = req.body;
  try {
    const userDB = await User.findById(id);
    if (!userDB) {
      return res.status(404).json({ message: "User not found" });
    }
    if (email) userDB.email = email;
    if (name) userDB.name = name;
    if (age) userDB.age = age;
    if (role === "admin") {
      return res.status(400).json({ message: "admin already exists" });
    }
    if (role) userDB.role = role;
    if (profilePictureUrl) userDB.profilePictureUrl = profilePictureUrl;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userDB.password = hashedPassword;
    }
    await userDB.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        name: userDB.name,
        email: userDB.email,
        id: userDB._id,
        role: userDB.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cannot Update Profile" });
  }
});

// admin routes

router.put("/admin/approve/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: "approved" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error approving user:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/admin/pending-users", async (req, res) => {
  try {
    const pendingUsers = await User.find(
      { status: "pending" },
      "name email role createdAt"
    );
    res.status(200).json({ success: true, users: pendingUsers });
  } catch (error) {
    console.error("Error fetching pending users:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.post("/auth/logout", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
});
export default router;
