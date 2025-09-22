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
    const { email, ...updateData } = req.body;

    // Find the supplier by ID
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Check if email is being updated and already exists for another supplier
    if (email && email !== supplier.email) {
      const emailExists = await Supplier.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use by another supplier. Please use a different email.",
        });
      }
      supplier.email = email;
    }

    // Update other fields
    Object.assign(supplier, updateData);

    // Save updated supplier
    await supplier.save();

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (err) {
    console.error("Error updating supplier:", err);
    res.status(500).json({
      message: "An error occurred while updating the supplier",
      error: err.message,
    });
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
