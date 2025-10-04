import express from "express";
import {
  getAllAddresses,
  getAddressesByUserId,
  getAddressById,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../controllers/userAddressController.js";

const router = express.Router();

// Get all addresses
router.route("/").get(getAllAddresses).post(addUserAddress);

// Get addresses for a specific user
router.get("/users/:userId", getAddressesByUserId);
// Get specific address by ID
router.get("/:id", getAddressById);

// Update / Delete specific address
router.route("/:id").put(updateUserAddress).delete(deleteUserAddress);

export default router;
