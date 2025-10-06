import mongoose from "mongoose";

const SupplierPaymentSchema = new mongoose.Schema(
  {
    purchaseOrderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Paid", "Unpaid", "Partial", "Pending"],
      default: "Pending",
    },
    paymentMethod: { type: String, required: true },
    paidAmount: { type: Number, required: true, default: 0 },
    totalAmount: {
      type: Number,
      required: true, // comes from the purchase order total
    },
    unpaidAmount: { type: Number, required: true, default: 0 },
    givenAmount: { type: Number, required: true, default: 0 },
    paymentDate: { type: Date, required: true },
    paidBy: { type: Number }, // user id or staff id
  },
  { timestamps: true }
);

const SupplierPayment = mongoose.model(
  "SupplierPayment",
  SupplierPaymentSchema
);
export default SupplierPayment;
