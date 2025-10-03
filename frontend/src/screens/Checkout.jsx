import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCreateSaleMutation } from "../slices/saleApiSlice";
import {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
} from "../slices/loyaltyProgramApiSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { userInfo } = useSelector((state) => state.auth); // employee info

  const [customerId, setCustomerId] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState(0.02); // 2% default
  const [discount, setDiscount] = useState(0); // e.g. 0.03 for 3%
  const [pointsSpent, setPointsSpent] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);

  const { data: customers = [], isLoading, isError } = useGetAllCustomersQuery({
    skip: 0,
    take: 100,
  });

  const { data: customer } = useGetCustomerByIdQuery(customerId, {
    skip: !customerId,
  });

  const [createSale, { isLoading: isCheckoutLoading }] = useCreateSaleMutation();

  // Update available points when customer changes
  useEffect(() => {
    if (customer?.loyaltyWallet) {
      setAvailablePoints(customer.loyaltyWallet.points || 0);
    } else {
      setAvailablePoints(0);
    }
    setPointsSpent(0);
  }, [customer]);

  // Prepare product list for backend
  const productList = cartItems.map((item) => ({
    productVariantID: item._id,
    productName: item.name,
    quantity: item.qty,
    unitPrice: item.price,
  }));

  // Subtotal before adjustments
  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty * item.price, 0),
    [cartItems]
  );

  // Calculate discount + tax (preview only)
  const discountValue = subtotal * discount;
  const taxableAmount = subtotal - discountValue;
  const tax = taxableAmount * taxPercentage;
  const estimatedTotal = taxableAmount + tax; // Points adjustment happens in backend

  const handleCheckout = async () => {
    if (!customerId) {
      toast.error("Please select a customer before checkout.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Cart is empty.");
      return;
    }
    if (pointsSpent > availablePoints) {
      toast.error("Customer does not have enough loyalty points.");
      return;
    }

    const salePayload = {
      customerID: customerId,
      customerId: customerId, // handle backend inconsistency
      employeeID: userInfo.userID,
      taxPercentage,
      discount,
      pointsSpent,
      productList,
    };

    try {
      const sale = await createSale(salePayload).unwrap();
      toast.success("Sale completed successfully!");

      // Download receipt
      if (sale.receiptLink) {
        const link = document.createElement("a");
        link.href = sale.receiptLink;
        link.download = `receipt_${sale.saleID}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      // Send receipt email
      if (customer?.email) {
        await fetch("/api/send-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customer.email,
            receiptLink: sale.receiptLink,
          }),
        });
        toast.info("Receipt sent to customer email.");
      }

      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || "Checkout failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Customer dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Customer</label>
        {isLoading ? (
          <p>Loading customers...</p>
        ) : isError ? (
          <p className="text-red-500">Failed to load customers</p>
        ) : (
          <select
            className="border rounded p-2 w-full"
            value={customerId || ""}
            onChange={(e) => setCustomerId(Number(e.target.value))}
          >
            <option value="">-- Choose Customer --</option>
            {customers.map((c) => (
              <option key={c.customerId} value={c.customerId}>
                {c.customerId} - {c.name}
              </option>
            ))}
          </select>
        )}

        {/* Show points if selected */}
        {customerId && (
          <div className="mt-3 p-3 border rounded bg-gray-50">
            <p className="text-gray-700 font-medium">
              Loyalty Points Available: {availablePoints}
            </p>

            {availablePoints > 0 ? (
              <div className="mt-2">
                <label className="block text-sm font-medium">
                  Points to Spend
                </label>
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
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                This customer does not have a loyalty wallet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tax and discount inputs */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Tax %</label>
          <input
            type="number"
            step="0.01"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
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

      {/* Order Summary */}
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

      {/* Calculation Summary */}
      <div className="mb-6 p-4 border rounded bg-gray-50 space-y-1">
        <p>Points Spent: {pointsSpent}</p>
        <p>Discount: {discount * 100}% → -{discountValue.toFixed(2)} Ks</p>
        <p>Tax Percentage: {(taxPercentage * 100).toFixed(2)}%</p>
        <p>Tax: +{tax.toFixed(2)} Ks</p>
        <p className="font-bold mt-2">
          Estimated Total (before points applied): {estimatedTotal.toFixed(2)} Ks
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
