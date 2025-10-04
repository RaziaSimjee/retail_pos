// routes/saleRoutes.js
import express from "express";
import Sale from "../models/Sale.js";

const router = express.Router();

// POST /api/sales -> store sale after processing
router.post("/", async (req, res) => {
  try {
    const saleData = req.body;

    // Make sure required fields exist
    if (!saleData.saleID || !saleData.customerID || !saleData.productList) {
      return res.status(400).json({ message: "Missing required sale data" });
    }

    // Optional: set default statuses if not provided
    saleData.orderStatus = saleData.orderStatus || "processed";
    saleData.paymentStatus = saleData.paymentStatus || "paid";

    const newSale = new Sale(saleData);
    await newSale.save();

    res.status(201).json({
      message: "Sale stored successfully",
      sale: newSale,
    });
  } catch (err) {
    console.error("Error saving sale:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
