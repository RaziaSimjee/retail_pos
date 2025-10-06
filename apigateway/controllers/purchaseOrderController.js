import PurchaseOrder from "../models/PurchaseOrder.js";

// GET ALL
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().populate("supplierID");
    res.status(200).json({ message: "Purchase orders fetched", orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET BY ID
export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PurchaseOrder.findOne({ purchaseOrderID: id });

    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.status(200).json({ message: "Purchase order fetched successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD
export const addPurchaseOrder = async (req, res) => {
  try {
    const { supplierID, purchaseDate, totalAmount, notes, purchasedBy } = req.body;
    const newOrder = new PurchaseOrder({
      supplierID,
      purchaseDate,
      totalAmount,
      notes,
      purchasedBy,
    });
    await newOrder.save();
    res.status(201).json({ message: "Purchase order added", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PurchaseOrder.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order updated", order: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PurchaseOrder.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


