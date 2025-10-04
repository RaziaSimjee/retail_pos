import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cryptoRandomString from "crypto-random-string";
import nodemailer from "nodemailer";
import axios from "axios";
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
      return res.status(400).json({
        message: "Username, email, password, and confirmPassword are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    // 1️⃣ Create user in MongoDB
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
    console.log("User created:", user);

    // 2️⃣ If role is customer, create loyalty account
    if (userRole === "customer") {
      try {
        const loyaltyPayload = {
          name: username,
          address: description || "N/A",
          birthDate: DOB,
          email,
          phoneNumber,
          description: description || "",
        };

        const loyaltyRes = await axios.post(
          "http://localhost:7777/customers",
          loyaltyPayload,
          { headers: { "Content-Type": "application/json" } }
        );

        if (loyaltyRes?.data?.customerId) {
          user.customerId = loyaltyRes.data.customerId;
          await user.save();
          console.log(
            "Loyalty account created with ID:",
            loyaltyRes.data.customerId
          );
        }
      } catch (loyaltyErr) {
        console.error(
          "Failed to create loyalty account:",
          loyaltyErr.response?.data || loyaltyErr.message
        );
      }
    }

    // 3️⃣ Generate JWT
    const token = generateToken(res, user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userID: user._id,
        username: user.username,
        email: user.email,
        role: user.userRole,
        customerId: user.customerId || null,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || error });
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
// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      username,
      password,
      userRole,
      DOB,
      phoneNumber,
      description,
    } = req.body;

    // Check if email is being updated and is unique (excluding current user)
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: `Email "${email}" is already registered` });
      }
    }

    // Build update object only with provided fields
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (userRole) updateFields.userRole = userRole;
    if (DOB) updateFields.DOB = DOB;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (description !== undefined) updateFields.description = description;
    if (password) updateFields.password = password; // only update if non-empty

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true, // ensures schema validations are applied
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
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

// Send email function
const sendResetPasswordEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Node_Email,
      pass: process.env.Node_Password,
    },
  });

  const mailOptions = {
    from: process.env.Node_Email,
    to: email,
    subject: "Password Reset Request",
    text: `Your password reset code is: ${code}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// =================== FORGOT PASSWORD ===================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // Generate a 6-digit numeric code
    const resetCode = cryptoRandomString({ length: 6, type: "numeric" });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is ${resetCode}. It expires in 5 minutes.`,
    });

    // Save code & expiration to user
    user.resetCode = resetCode;
    user.resetCodeExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    res.status(200).json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// =================== RESET PASSWORD ===================
export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, reset code, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if reset code matches
    if (user.resetCode !== resetCode) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // Check if code has expired
    if (!user.resetCodeExpiration || user.resetCodeExpiration < Date.now()) {
      return res
        .status(400)
        .json({ message: "Reset code has expired. Please request a new one." });
    }

    // Update password and clear reset code
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiration = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ===== GET USER BY ID =====
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select(
      "username email userRole DOB phoneNumber description isActive customerId"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ===== GET USER BY CUSTOMER ID =====
export const getUserByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

     const numericCustomerID = Number(customerId);

    // Find user by the customerId field
    const user = await User.findOne({ "customerId": numericCustomerID })

    if (!user) {
      return res.status(404).json({ message: "User not found for given customerId" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by customerId error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};