import express from "express";
import {
  register,
  login,
  updateUser,
  deleteUser,
  logout,
  getUsersByRole,
  forgotPassword,
  resetPassword,
  getUserById,
  getUserByCustomerId
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/logout", logout);
router.get("/role/:role", getUsersByRole);
router.get("/:id", getUserById);
router.get("/customer/:customerId", getUserByCustomerId);

export default router;
