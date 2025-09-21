import express from "express";
import {
  getAllAddresses,
    getAddressesByUserId,

  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../controllers/userAddressController.js";


const router = express.Router();

router.route("/:userId").get(getAddressesByUserId);
router.get("/user/:userId", getAddressesByUserId);

router.route("/").post( addUserAddress).get(getAllAddresses);
router.route("/:id").put(updateUserAddress).delete(deleteUserAddress);

export default router;
