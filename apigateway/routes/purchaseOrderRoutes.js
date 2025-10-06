import express from "express";
import {
  getAllPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderById,
} from "../controllers/purchaseOrderController.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

const purchaseOrderRoutes = express.Router();

purchaseOrderRoutes.get("/", getAllPurchaseOrders);
purchaseOrderRoutes.get("/:id", getPurchaseOrderById);
purchaseOrderRoutes.post("/", addPurchaseOrder);
purchaseOrderRoutes.put("/:id", updatePurchaseOrder);
purchaseOrderRoutes.delete("/:id", deletePurchaseOrder);

export default purchaseOrderRoutes;
