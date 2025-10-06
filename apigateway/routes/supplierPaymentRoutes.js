import express from "express";
import {
  getAllSupplierPayments,
  getSupplierPaymentById,
  getSupplierPaymentsByPaymentMethod,
  getPaidSupplierPayment,
  getUnpaidSupplierPayment,
  getSupplierPaymentByPaymentStatus,
  getSupplierPaymentByPurchaseOrderId,
  addSupplierPayment,
  updateSupplierPayment,
  deleteSupplierPayment,
} from "../controllers/supplierPaymentController.js";

const supplierPaymentRoutes = express.Router();

supplierPaymentRoutes.get("/method/:method", getSupplierPaymentsByPaymentMethod);
supplierPaymentRoutes.get("/status/paid", getPaidSupplierPayment);
supplierPaymentRoutes.get("/status/unpaid", getUnpaidSupplierPayment);
supplierPaymentRoutes.get("/status/:status", getSupplierPaymentByPaymentStatus);
supplierPaymentRoutes.get("/order/:orderId", getSupplierPaymentByPurchaseOrderId);
supplierPaymentRoutes.get("/", getAllSupplierPayments);
supplierPaymentRoutes.get("/:id", getSupplierPaymentById); // <- LAST
supplierPaymentRoutes.post("/", addSupplierPayment);
supplierPaymentRoutes.put("/:id", updateSupplierPayment);
supplierPaymentRoutes.delete("/:id", deleteSupplierPayment);

export default supplierPaymentRoutes;
