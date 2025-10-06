import mongoose from "mongoose";

const PurchaseItemSchema = new mongoose.Schema(
  {
    purchaseItemsID: { type: Number, required: true }, // e.g., product variant ID
    purchaseOrderID: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    purchaseQuantity: { type: Number, required: true },
    perItemPrice: { type: Number, required: true },
    subTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

// Automatically calculate subTotal before saving
PurchaseItemSchema.pre("save", function (next) {
  this.subTotal = this.purchaseQuantity * this.perItemPrice;
  next();
});

const PurchaseItem = mongoose.model("PurchaseItem", PurchaseItemSchema);
export default PurchaseItem;
