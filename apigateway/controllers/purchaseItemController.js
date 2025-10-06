import PurchaseItem from "../models/PurchaseItem.js";

// GET ALL PURCHASE ITEMS
export const getAllPurchaseItems = async (req, res) => {
  try {
    const items = await PurchaseItem.find().populate("purchaseOrderID");
    res.status(200).json({ message: "Purchase items fetched", items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PURCHASE ITEM BY _id
export const getPurchaseItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PurchaseItem.findById(id).populate("purchaseOrderID");

    if (!item) return res.status(404).json({ message: "Purchase item not found" });

    res.status(200).json({ message: "Purchase item fetched", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PURCHASE ITEMS BY PURCHASE ORDER ID
export const getPurchaseItemsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const items = await PurchaseItem.find({ purchaseOrderID: orderId });

    if (!items.length)
      return res.status(404).json({ message: "No purchase items found for this order" });

    res.status(200).json({ message: "Purchase items fetched", items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ADD PURCHASE ITEM
export const addPurchaseItem = async (req, res) => {
  try {
    const { purchaseItemsID, purchaseOrderID, purchaseQuantity, perItemPrice } = req.body;

    if (!purchaseItemsID || !purchaseOrderID || !purchaseQuantity || !perItemPrice) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Calculate subTotal
    const subTotal = purchaseQuantity * perItemPrice;

    const newItem = new PurchaseItem({
      purchaseItemsID,
      purchaseOrderID,
      purchaseQuantity,
      perItemPrice,
      subTotal,
    });

    await newItem.save();
    res.status(201).json({ message: "Purchase item added successfully", item: newItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE PURCHASE ITEM BY _id
export const updatePurchaseItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { purchaseQuantity, perItemPrice, ...otherFields } = req.body;

    // Build update data
    const updateData = { ...otherFields };

    if (purchaseQuantity !== undefined) updateData.purchaseQuantity = purchaseQuantity;
    if (perItemPrice !== undefined) updateData.perItemPrice = perItemPrice;

    // Always calculate subTotal if quantity and price exist
    if (purchaseQuantity !== undefined && perItemPrice !== undefined) {
      updateData.subTotal = purchaseQuantity * perItemPrice;
    }

    const updatedItem = await PurchaseItem.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ message: "Purchase item not found" });
    }

    res.status(200).json({ message: "Purchase item updated", item: updatedItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PURCHASE ITEM BY _id
export const deletePurchaseItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await PurchaseItem.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ message: "Purchase item not found" });

    res.status(200).json({ message: "Purchase item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
