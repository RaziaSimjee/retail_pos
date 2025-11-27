import mongoose from "mongoose";

const saleProductSchema = new mongoose.Schema({
  saleProductID: { type: Number, required: true },
  saleID: { type: Number, required: true },
  productVariantID: { type: Number, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema({
  saleID: { type: Number, required: true, unique: true },
  customerID: { type: Number, required: true },
  employeeID: { type: Number, required: true },
  productList: [saleProductSchema],
  subtotal: { type: Number, required: true },
  taxPercentage: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  pointsSpent: { type: Number, default: 0 },
  pointsValue: { type: Number, default: 0 },
  pointSpendMmk: { type: Number, default: 0 },
  total: { type: Number, required: true },
  saleDate: { type: Date, default: Date.now },
  receiptLink: { type: String },
  orderStatus: {
    type: String,
    enum: ["pending",  "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending",  "completed", "cancelled"],
    default: "unpaid",
  },
  deliveryDate: { type: Date },
  addressID: { type: String },
});

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
