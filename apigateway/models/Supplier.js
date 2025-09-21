import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", SupplierSchema);
export default Supplier;
