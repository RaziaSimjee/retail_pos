import express from "express";
import {
  getAllPurchaseItems,
  getPurchaseItemById,
  getPurchaseItemsByOrderId,
  addPurchaseItem,
  updatePurchaseItem,
  deletePurchaseItem,
} from "../controllers/purchaseItemController.js";

const purchaseItemRoutes = express.Router();

purchaseItemRoutes.get("/", getAllPurchaseItems);
purchaseItemRoutes.get("/:id", getPurchaseItemById);
purchaseItemRoutes.get("/byOrder/:orderId", getPurchaseItemsByOrderId);
purchaseItemRoutes.post("/", addPurchaseItem);
purchaseItemRoutes.put("/:id", updatePurchaseItem);
purchaseItemRoutes.delete("/:id", deletePurchaseItem);

export default purchaseItemRoutes;
