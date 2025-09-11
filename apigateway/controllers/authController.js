import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Generate JWT token
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;

// REGISTER
export const register = async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      email,
      userRole,
      DOB,
      phoneNumber,
      description,
    } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({
          message:
            "Username, email, password, and confirmPassword are required",
        });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });



    const user = new User({
      username,
      password,
      email,
      userRole: userRole || "customer",
      DOB,
      phoneNumber,
      description,
    });

    await user.save();

    // Generate and send JWT token as HTTP-only cookie
    const token = generateToken(res, user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userID: user._id,
        username: user.username,
        email: user.email,
        role: user.userRole,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate and send JWT token as HTTP-only cookie
    generateToken(res, user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        userID: user._id,
        username: user.username,
        email: user.email,
        role: user.userRole,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// UPDATE
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// DELETE
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// ===== GET USERS BY ROLE =====
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role
    const allowedRoles = ["customer", "admin", "manager", "cashier"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const users = await User.find({ userRole: role.toLowerCase() }).select(
      "username email userRole DOB phoneNumber description isActive"
    );

    res.status(200).json({
      message: `Users with role '${role}' fetched successfully`,
      users,
    });
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
