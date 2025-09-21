import Supplier from "../models/Supplier.js";

// GET ALL SUPPLIERS
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json({ message: "Suppliers fetched", suppliers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD SUPPLIER
export const addSupplier = async (req, res) => {
  try {
    const { fullName, companyName, email, phone } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: "fullName and email required" });
    }

    const newSupplier = new Supplier({ fullName, companyName, email, phone });
    await newSupplier.save();
    res.status(201).json({ message: "Supplier added", supplier: newSupplier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE SUPPLIER
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    Object.assign(supplier, req.body);
    await supplier.save();

    res.status(200).json({ message: "Supplier updated", supplier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE SUPPLIER
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    await Supplier.findByIdAndDelete(id);
    res.status(200).json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
