import UserAddress from "../models/UserAddress.js";

// ===== GET ALL ADDRESSES =====
export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await UserAddress.find();
    res.status(200).json({ message: "All addresses fetched", addresses });
  } catch (error) {
    console.error("Get all addresses error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ===== GET ADDRESSES BY USER ID =====
export const getAddressesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const addresses = await UserAddress.find({ userID: userId });
    res.status(200).json({ message: "Addresses fetched by userID", addresses });
  } catch (error) {
    console.error("Get addresses by userID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};



// ===== ADD ADDRESS =====
export const addUserAddress = async (req, res) => {
  try {
    const { userID, supplierID, country, state, label, zipcode, town, laneNo, buildingNo, floor, roomNo } = req.body;

    if ( !country || (!userID && !supplierID)) {
      return res.status(400).json({ message: "Country, and either userID or supplierID are required" });
    }

    const newAddress = new UserAddress({ userID: userID || null, supplierID: supplierID || null, country, state, label, zipcode, town, laneNo, buildingNo, floor, roomNo });
    await newAddress.save();

    res.status(201).json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ===== UPDATE ADDRESS =====
export const updateUserAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await UserAddress.findById(id);
    if (!address) return res.status(404).json({ message: "Address not found" });

    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({ message: "Address updated successfully", address });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ===== DELETE ADDRESS =====

export const deleteUserAddress = async (req, res) => {
  try {
    const address = await UserAddress.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await UserAddress.findByIdAndDelete(req.params.id); // ✅ simpler
    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
