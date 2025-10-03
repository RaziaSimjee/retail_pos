import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCreateSaleMutation } from "../slices/saleApiSlice.js";
import {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
} from "../slices/loyaltyProgramApiSlice.js";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";

import CartModal from "../components/CartModal.jsx";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { userInfo } = useSelector((state) => state.auth);

  const isCustomer = userInfo?.user?.role === "customer";

  // State
  const [customerId, setCustomerId] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState(0.02);
  const [discount, setDiscount] = useState(0);
  const [pointsSpent, setPointsSpent] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch all customers for cashier
  const {
    data: allCustomers = [],
    isLoading: allLoading,
    isError: allError,
  } = useGetAllCustomersQuery({ skip: 0, take: 100 });

  // Fetch customer info if logged in as customer
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(
    isCustomer ? userInfo.user.userID : null,
    { skip: !isCustomer }
  );

  const resolvedCustomerId = isCustomer ? userData?.customerId : customerId;

  // Fetch loyalty info
  const { data: customerData, isLoading: customerLoading } =
    useGetCustomerByIdQuery(resolvedCustomerId, { skip: !resolvedCustomerId });

  const customer = isCustomer
    ? customerData
    : allCustomers.find((c) => c.customerId === customerId);

  const isLoading = isCustomer ? userLoading || customerLoading : allLoading;
  const isError = allError;

  const [createSale, { isLoading: isCheckoutLoading }] =
    useCreateSaleMutation();

  // Update available points
  useEffect(() => {
    setAvailablePoints(customer?.loyaltyWallet?.points || 0);
    setPointsSpent(0);
  }, [customer]);

  // Backend product list
  const productList = cartItems.map((item) => ({
    productVariantID: item._id,
    productName: item.name,
    quantity: item.qty,
    unitPrice: item.price,
  }));

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty * item.price, 0),
    [cartItems]
  );

  const discountValue = subtotal * discount;
  const taxableAmount = subtotal - discountValue;
  const tax = taxableAmount * taxPercentage;
  const estimatedTotal = taxableAmount + tax;

  const deliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString();
  }, []);

  const openReceipt = (saleId) => {
    const receiptUrl = `http://localhost:3000/saleService/sales/${saleId}/receipt`;
    // Open in new tab directly, letting the browser handle it
    window.open(receiptUrl, "_blank", "noopener,noreferrer");
  };

  const handleCheckout = async () => {
    if (!resolvedCustomerId)
      return toast.error("Customer information is required.");
    if (!cartItems.length) return toast.error("Cart is empty.");
    if (pointsSpent > availablePoints)
      return toast.error("Not enough loyalty points.");

    const salePayload = {
      customerID: resolvedCustomerId,
      employeeID: 0, // or parseInt(userInfo.user.userID) for cashier
      taxPercentage,
      discount: isCustomer ? 0 : discount,
      pointsSpent,
      productList,
    };

    try {
      // 1️⃣ Create the sale
      const sale = await createSale(salePayload).unwrap();
      toast.success("Sale completed successfully!");

      // 2️⃣ Open receipt in a new tab
      const openReceipt = (saleId) => {
        const receiptUrl = `http://localhost:3000/saleService/sales/${saleId}/receipt`;
        window.open(receiptUrl, "_blank", "noopener,noreferrer");
      };
      openReceipt(sale.saleID);

      // 3️⃣ Send receipt to customer via email
      if (customer?.email) {
        try {
          await fetch("/api/send-receipt-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              saleId: sale.id,
              customerEmail: customer.email,
            }),
          });
          toast.info("Receipt has been emailed to the customer.");
        } catch (emailErr) {
          console.error(emailErr);
          toast.error("Failed to send receipt email.");
        }
      }

      // 4️⃣ Navigate after checkout
      navigate(isCustomer ? "/catalog" : "/");
    } catch (err) {
      if (pointsSpent > 0) {
        toast.error("You need more loyalty points to pay the full amount.");
        return;
      }
      toast.error(err?.data?.message || "Checkout failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Links */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
        >
          Manage Cart
        </button>
        <button
          onClick={() => navigate("/catalog")}
          className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition"
        >
          Go to Catalog
        </button>
      </div>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Customer selection for cashier */}
      {!isCustomer && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Customer</label>
          {isLoading ? (
            <p>Loading customers...</p>
          ) : isError ? (
            <p className="text-red-500">Failed to load customers</p>
          ) : (
            <div className="flex gap-2">
              <select
                className="border rounded p-2 flex-1"
                value={customerId || ""}
                onChange={(e) => setCustomerId(Number(e.target.value))}
              >
                <option value="">-- Choose Customer --</option>
                {allCustomers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerId} - {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => navigate("/register")}
                className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition"
              >
                Create New Customer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loyalty Points */}
      {customer && (
        <div className="mt-3 p-3 border rounded bg-gray-50 mb-4">
          <p className="text-gray-700 font-medium">
            {isCustomer ? "Your Loyalty Points" : "Loyalty Points Available"}:{" "}
            {availablePoints}
          </p>
          <div className="mt-2">
            <label className="block text-sm font-medium">Points to Spend</label>
            <input
              type="number"
              min="0"
              max={availablePoints}
              value={pointsSpent}
              onChange={(e) =>
                setPointsSpent(
                  Math.min(Number(e.target.value) || 0, availablePoints)
                )
              }
              className="border rounded p-2 mt-1 w-32"
            />
          </div>
        </div>
      )}

      {/* Tax & Discount for cashier */}
      {!isCustomer && (
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block mb-1 font-medium">Tax %</label>
            <input
              type="number"
              step="0.01"
              value={taxPercentage}
              onChange={(e) =>
                setTaxPercentage(parseFloat(e.target.value) || 0)
              }
              className="border rounded p-2 w-24"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Discount (decimal)</label>
            <input
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="border rounded p-2 w-24"
            />
          </div>
        </div>
      )}

      {/* Customer info */}
      {isCustomer && (
        <div className="mb-6 p-3 border rounded bg-gray-50 space-y-1">
          <p>
            <strong>Payment Method:</strong> Cash on Delivery
          </p>
          <p>
            <strong>Delivery:</strong> Free, arriving on {deliveryDate}
          </p>
          <p>
            <strong>Tax:</strong> 2% (standard)
          </p>
        </div>
      )}

      {/* Order summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item._id} className="flex justify-between mb-1">
            <p>
              {item.name} x {item.qty}
            </p>
            <p>{(item.qty * item.price).toFixed(2)} Ks</p>
          </div>
        ))}
        <p className="mt-2 font-bold">Subtotal: {subtotal.toFixed(2)} Ks</p>
      </div>

      {/* Calculation summary */}
      <div className="mb-6 p-4 border rounded bg-gray-50 space-y-1">
        <p>Points Spent: {pointsSpent}</p>
        {!isCustomer && (
          <p>
            Discount: {discount * 100}% → -{discountValue.toFixed(2)} Ks
          </p>
        )}
        <p>Tax Percentage: {(taxPercentage * 100).toFixed(2)}%</p>
        <p>Tax: +{tax.toFixed(2)} Ks</p>
        <p className="font-bold mt-2">
          Estimated Total (before points applied): {estimatedTotal.toFixed(2)}{" "}
          Ks
        </p>
        <p className="text-xs text-gray-500">
          ⚠️ Final total will include loyalty point adjustment.
        </p>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isCheckoutLoading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        {isCheckoutLoading ? "Processing..." : "Confirm Checkout"}
      </button>
    </div>
  );
};

export default Checkout;
