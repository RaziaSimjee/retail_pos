import SupplierPayment from "../models/SupplierPayment.js";
import PurchaseOrder from "../models/PurchaseOrder.js";


// 🟢 GET ALL SUPPLIER PAYMENTS
export const getAllSupplierPayments = async (req, res) => {
  try {
    const payments = await SupplierPayment.find().populate("purchaseOrderID");
    res.status(200).json({ message: "Supplier payments fetched", payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET SUPPLIER PAYMENT BY ID
export const getSupplierPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await SupplierPayment.findById(id).populate("purchaseOrderID");

    if (!payment) return res.status(404).json({ message: "Supplier payment not found" });

    res.status(200).json({ message: "Supplier payment fetched successfully", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET BY PAYMENT METHOD
export const getSupplierPaymentsByPaymentMethod = async (req, res) => {
  try {
    const { method } = req.params;
    const payments = await SupplierPayment.find({ paymentMethod: method });

    if (!payments.length)
      return res.status(404).json({ message: "No payments found for this method" });

    res.status(200).json({ message: "Payments fetched successfully", payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET PAID PAYMENTS
export const getPaidSupplierPayment = async (req, res) => {
  try {
    const payments = await SupplierPayment.find({ paymentStatus: "Paid" });
    if (!payments.length)
      return res.status(404).json({ message: "No paid supplier payments found" });
    res.status(200).json({ message: "Paid supplier payments fetched", payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET UNPAID PAYMENTS
export const getUnpaidSupplierPayment = async (req, res) => {
  try {
    const payments = await SupplierPayment.find({ paymentStatus: "Unpaid" });
    if (!payments.length)
      return res.status(404).json({ message: "No unpaid supplier payments found" });
    res.status(200).json({ message: "Unpaid supplier payments fetched", payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET BY PAYMENT STATUS (any)
export const getSupplierPaymentByPaymentStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const payments = await SupplierPayment.find({ paymentStatus: status });
    if (!payments.length)
      return res.status(404).json({ message: `No payments with status: ${status}` });
    res.status(200).json({ message: "Payments fetched successfully", payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET BY PURCHASE ORDER ID
export const getSupplierPaymentByPurchaseOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payments = await SupplierPayment.find({ purchaseOrderID: orderId }).populate("purchaseOrderID");
    if (!payments.length)
      return res.status(404).json({ message: "No supplier payments found for this order" });
    res.status(200).json({ message: "Payments fetched successfully", payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 ADD SUPPLIER PAYMENT
export const addSupplierPayment = async (req, res) => {
  try {
    const { purchaseOrderID, paymentMethod, givenAmount = 0, paymentDate, paidBy } = req.body;

    if (!purchaseOrderID) return res.status(400).json({ message: "Purchase order is required" });
    if (!paymentMethod) return res.status(400).json({ message: "Payment method is required" });

    // Check if payment already exists for this purchase order
    const existingPayment = await SupplierPayment.findOne({ purchaseOrderID });
    if (existingPayment)
      return res.status(400).json({ message: "Payment already exists for this purchase order" });

    const order = await PurchaseOrder.findById(purchaseOrderID);
    if (!order) return res.status(404).json({ message: "Purchase order not found" });

    const totalAmount = order.totalAmount;

    if (givenAmount > totalAmount)
      return res.status(400).json({ message: "Given amount cannot exceed total amount" });

    const paidAmount = givenAmount;
    const unpaidAmount = totalAmount - paidAmount;

    let paymentStatus = "Partial";
    if (paidAmount >= totalAmount) paymentStatus = "Paid";
    if (paidAmount === 0) paymentStatus = "Unpaid";

    const newPayment = new SupplierPayment({
      purchaseOrderID,
      paymentMethod,
      totalAmount,
      paidAmount,
      unpaidAmount,
      givenAmount,
      paymentDate,
      paidBy,
      paymentStatus,
    });

    await newPayment.save();
    res.status(201).json({ message: "Supplier payment added", payment: newPayment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 UPDATE SUPPLIER PAYMENT
export const updateSupplierPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await SupplierPayment.findById(id);
    if (!payment) return res.status(404).json({ message: "Supplier payment not found" });

    // Cannot update fully paid payment
    if (payment.paymentStatus === "Paid")
      return res.status(400).json({ message: "Cannot update a fully paid payment" });

    const { paymentMethod = payment.paymentMethod, givenAmount = 0, paymentDate, paidBy } = req.body;

    // Add givenAmount to existing paidAmount
    const newPaidAmount = payment.paidAmount + givenAmount;

    if (newPaidAmount > payment.totalAmount)
      return res.status(400).json({ message: "Given amount exceeds remaining unpaid amount" });

    const newUnpaidAmount = payment.totalAmount - newPaidAmount;

    let paymentStatus = "Partial";
    if (newPaidAmount >= payment.totalAmount) paymentStatus = "Paid";
    if (newPaidAmount === 0) paymentStatus = "Unpaid";

    const updatedPayment = await SupplierPayment.findByIdAndUpdate(
      id,
      {
        paymentMethod,
        givenAmount, // latest givenAmount added
        paidAmount: newPaidAmount,
        unpaidAmount: newUnpaidAmount,
        paymentStatus,
        paymentDate,
        paidBy,
      },
      { new: true }
    );

    res.status(200).json({ message: "Supplier payment updated", payment: updatedPayment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🟢 DELETE SUPPLIER PAYMENT
export const deleteSupplierPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SupplierPayment.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Supplier payment not found" });
    res.status(200).json({ message: "Supplier payment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
