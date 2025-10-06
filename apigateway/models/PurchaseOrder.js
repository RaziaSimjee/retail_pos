import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema(
  {
    supplierID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    purchaseDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    notes: { type: String, trim: true },
    purchasedBy: { type: Number},
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
export default PurchaseOrder;
