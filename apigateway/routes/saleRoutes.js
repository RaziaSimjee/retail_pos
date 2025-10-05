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

router.get("/customer/:customerId", async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);

    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const sales = await Sale.find({ customerID: customerId }).sort({ saleDate: -1 });

    if (!sales || sales.length === 0) {
      return res.status(404).json({ message: "No sales found for this customer" });
    }

    res.status(200).json(sales);
  } catch (err) {
    console.error("Error fetching sales by customerID:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});


router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ saleDate: -1 }); // newest first
    res.status(200).json(sales);
  } catch (err) {
    console.error("Error fetching all sales:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/sales/update/:saleID -> update orderStatus or paymentStatus
router.patch("/update/:saleID", async (req, res) => {
  try {
    const { saleID } = req.params;
    const { orderStatus, paymentStatus, deliveryDate } = req.body;

    if (!saleID) return res.status(400).json({ message: "Sale ID is required" });

    const allowedStatuses = ["pending", "completed", "cancelled"];
    if (orderStatus && !allowedStatuses.includes(orderStatus))
      return res.status(400).json({ message: "Invalid orderStatus value" });

    if (paymentStatus && !allowedStatuses.includes(paymentStatus))
      return res.status(400).json({ message: "Invalid paymentStatus value" });

    const sale = await Sale.findOne({ saleID: parseInt(saleID) });
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    if (orderStatus) sale.orderStatus = orderStatus;
    if (paymentStatus) sale.paymentStatus = paymentStatus;
    if (deliveryDate) sale.deliveryDate = new Date(deliveryDate); // Add this

    await sale.save();

    res.status(200).json({ message: "Sale updated successfully", sale });
  } catch (err) {
    console.error("Error updating sale:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});




export default router;

// GET /api/sales/status/:orderStatus -> get sales by orderStatus
router.get("/status/:orderStatus", async (req, res) => {
  try {
    const { orderStatus } = req.params;
    const allowedStatuses = ["pending", "completed", "cancelled", "processed", "paid"];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid orderStatus value" });
    }

    const sales = await Sale.find({ orderStatus }).sort({ saleDate: -1 });
    if (!sales || sales.length === 0) {
      return res.status(404).json({ message: `No sales found with status ${orderStatus}` });
    }

    res.status(200).json(sales);
  } catch (err) {
    console.error("Error fetching sales by orderStatus:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});
