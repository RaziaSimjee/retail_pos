import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetCart } from "../slices/cartSlice";
import { useCreateSaleMutation } from "../slices/saleApiSlice.js";
import {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
} from "../slices/loyaltyProgramApiSlice.js";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";
import { useGetAddressesByUserIdQuery } from "../slices/addressesApiSlice";
import { useGetUserByCustomerIdQuery } from "../slices/usersApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import UserForm from "../components/UserForm.jsx";
import { useRegisterMutation } from "../slices/usersApiSlice.js";
import CartModal from "../components/CartModal.jsx";
import ReceiptModal from "../components/ReceiptModal.jsx";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { userInfo } = useSelector((state) => state.auth);

  const isCustomer = userInfo?.user?.role === "customer";
  console.log(`is cusotmer: ${isCustomer}`);

  // State
  const [customerId, setCustomerId] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState(0.02);
  const [discount, setDiscount] = useState(0);
  const [pointsSpent, setPointsSpent] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  const [orderStatus, setOrderStatus] = useState("pending"); // cashier only
  const [paymentStatus, setPaymentStatus] = useState("pending"); // cashier only
  const [deliveryOption, setDeliveryOption] = useState("delivery"); // cashier only
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [expandedAddress, setExpandedAddress] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  // Fetch all customers for cashier
  const {
    data: allCustomers = [],
    isLoading: allLoading,
    isError: allError,
  } = useGetAllCustomersQuery({ skip: 0, take: 100 });
  const [registerUser, refetch] = useRegisterMutation();

  // Fetch customer info if logged in as customer
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(
    isCustomer ? userInfo.user.userID : null,
    { skip: !isCustomer }
  );

  console.log(`user id of customer: ${userInfo?.user?.userID}`);

  console.log("userData:", userData);
  console.log("customerID from userData:", userData?.customerId);

  const resolvedCustomerId = isCustomer ? userData?.customerId : customerId;

  console.log(resolvedCustomerId);

  // Fetch loyalty info
  const { data: customerData, isLoading: customerLoading } =
    useGetCustomerByIdQuery(resolvedCustomerId, { skip: !resolvedCustomerId });

  const customer = isCustomer
    ? customerData
    : allCustomers.find((c) => c.customerId === customerId);

  const isLoading = isCustomer ? userLoading || customerLoading : allLoading;
  const isError = allError;

  const { data: userByCustomer, isLoading: userByCustomerLoading } =
    useGetUserByCustomerIdQuery(customerId, {
      skip: !customerId || isCustomer,
    });
  console.log(userByCustomer);
  // Fetch the userID to get addresses
  const selectedUserId = isCustomer
    ? userInfo?.user?.userID
    : userByCustomer?.userID;

  console.log(selectedUserId);
  // Fetch addresses only if delivery is selected
  const {
    data: addressData,
    isLoading: addressLoading,
    isError: addressError,
  } = useGetAddressesByUserIdQuery(
    deliveryOption === "delivery" && selectedUserId
      ? selectedUserId
      : skipToken,
    { skip: deliveryOption !== "delivery" }
  );

  const addresses = addressData?.addresses || [];
  console.log(addresses);

  const [createSale, { isLoading: isCheckoutLoading }] =
    useCreateSaleMutation();

  // Update available points
  useEffect(() => {
    setAvailablePoints(customer?.loyaltyWallet?.points || 0);
    setPointsSpent(0);
    if (isCustomer && userData?.customerID) {
      setCustomerId(userData.customerID); // auto-select customerId
    }
  }, [isCustomer, userData, customer]);

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

  // ✅ Open receipt modal instead of new tab
  const openReceipt = (sale) => {
    setReceiptSale({
      ...sale,
      receiptLink: `http://localhost:3000/saleService/sales/${sale.saleID}/receipt`,
    });
    setIsReceiptOpen(true);
  };
  // handle add customer
  const handleAddSubmit = async (formData) => {
    setLoadingAction(true);
    try {
      await registerUser(formData).unwrap();
      toast.success("Customer registered successfully");
      refetch();
      setShowAddModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add customer");
    } finally {
      setLoadingAction(false);
    }
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

    if (deliveryOption === "delivery" && !selectedAddressId) {
      return toast.error("Please select a delivery address.");
    }

    try {
      // 1️⃣ Create the sale
      const sale = await createSale(salePayload).unwrap();
      toast.success("Sale completed successfully!");
      // 2️⃣ Clear the cart after successful sale
      dispatch(resetCart());
      // 3️⃣ Show receipt modal
      openReceipt(sale);
      let finalSale = {
        ...sale,
        orderStatus: "pending",
        paymentStatus: "pending",
        deliveryOption: "delivery",
        addressID: deliveryOption === "delivery" ? selectedAddressId : null,
        deliveryDate:
          deliveryOption === "delivery"
            ? new Date(Date.now() + 2 * 864e5)
            : null,
      };
      if (!isCustomer && userInfo.user.role === "cashier") {
        if (deliveryOption === "pickup") {
          finalSale.orderStatus = "completed";
          finalSale.paymentStatus = "completed";
        } else {
          finalSale.orderStatus = orderStatus;
          finalSale.paymentStatus = paymentStatus;
        }
        finalSale.deliveryOption = deliveryOption;
      }

      // 3️⃣ Save final sale object to MongoDB
      await fetch("http://localhost:3000/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalSale),
      });

      toast.info("Sale saved to database with order and payment status.");

      // 4️⃣ Send receipt to customer via email
      if (customer?.email) {
        try {
          await fetch("/api/send-receipt-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              saleId: sale.saleID,
              customerEmail: customer.email,
            }),
          });
          toast.info("Receipt has been emailed to the customer.");
        } catch (emailErr) {
          console.error(emailErr);
          toast.error("Failed to send receipt email.");
        }
      }
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
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/catalog"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition font-medium"
          >
            <FaArrowLeft /> Back to Catalog
          </Link>
        </div>
        <button
          className="fixed bottom-20 right-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white p-3 rounded-full shadow-lg hover:shadow-2xl hover:bg-blue-gray-300 transform transition-all flex items-center justify-center z-50"
          onClick={() => setIsCartOpen(true)}
          aria-label="Open Cart"
        >
          <FaShoppingCart size={20} />
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-2 bg-gray-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.reduce((a, c) => a + c.qty, 0)}
            </span>
          )}
        </button>
      </div>
      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={receiptSale}
        navigate={navigate}
      />
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
                onClick={() => setShowAddModal(true)}
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
      {/* Order options for cashier */}
      {/* Order options section */}
      {!isCustomer ? (
        // 🧾 Cashier view — editable
        <div className="mb-6 p-4 border rounded bg-gray-50 space-y-3">
          <h3 className="font-semibold">Order Options (Cashier)</h3>

          {/* Delivery or Pickup */}
          <div>
            <label className="block mb-1 font-medium">Delivery Option</label>
            <select
              value={deliveryOption}
              onChange={(e) => setDeliveryOption(e.target.value)}
              className="border rounded p-2 w-40"
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>

          {/* Estimated Delivery Date */}
          {deliveryOption === "delivery" && (
            <p className="mt-2 text-gray-700">
              Estimated Delivery Date:{" "}
              {new Date(Date.now() + 2 * 864e5).toLocaleDateString()}
            </p>
          )}

          {/* Address Selection (if delivery) */}
          {deliveryOption === "delivery" && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Select Delivery Address</h3>

              {addressLoading && <p>Loading addresses...</p>}
              {addressError && (
                <p className="text-red-500">Failed to load addresses.</p>
              )}
              {!addressLoading && addresses.length === 0 && (
                <p className="text-gray-500">No addresses found.</p>
              )}

              {addresses.length > 0 && (
                <div
                  className={`space-y-3 border p-3 rounded ${
                    addresses.length > 1 ? "max-h-64 overflow-y-auto" : ""
                  }`}
                >
                  {addresses.map((addr) => (
                    <div
                      key={addr.addressID}
                      className={`border rounded-lg p-3 ${
                        selectedAddressId === addr.addressID
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setExpandedAddress(
                            expandedAddress === addr.addressID
                              ? null
                              : addr.addressID
                          )
                        }
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={addr.addressID}
                            checked={selectedAddressId === addr.addressID}
                            onChange={() =>
                              setSelectedAddressId(addr.addressID)
                            }
                          />
                          <span className="font-medium">{addr.label}</span>
                        </label>
                        <span
                          className={`transition-transform ${
                            expandedAddress === addr.addressID
                              ? "rotate-180"
                              : ""
                          }`}
                        >
                          ⌄
                        </span>
                      </div>

                      {expandedAddress === addr.addressID && (
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <p>
                            {addr.buildingNo}, {addr.laneNo}, {addr.town}
                          </p>
                          <p>
                            {addr.state}, {addr.country}, {addr.zipcode}
                          </p>
                          {addr.floor && <p>Floor: {addr.floor}</p>}
                          {addr.roomNo && <p>Room: {addr.roomNo}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editable order/payment statuses */}
          {deliveryOption === "delivery" && (
            <div className="flex gap-4 mt-2">
              <div>
                <label className="block mb-1 font-medium">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="border rounded p-2 w-40"
                >
                  <option value="pending">Pending</option>
                  <option value="canceled">Canceled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="border rounded p-2 w-40"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}
        </div>
      ) : (
        // 🚫 Customer view — locked
        <div className="mb-6 p-4 border rounded bg-gray-50 space-y-3">
          <h3 className="font-semibold">Order Options</h3>

          {/* Locked Delivery Option */}
          <div>
            <label className="block mb-1 font-medium">Delivery Option</label>
            <select
              value="delivery"
              disabled
              className="border rounded p-2 w-40 bg-gray-100 text-gray-600 cursor-not-allowed"
            >
              <option value="delivery">Delivery (locked)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Customers can only select delivery.
            </p>
          </div>

          {/* Estimated Delivery Date */}
          <p className="mt-2 text-gray-700">
            Estimated Delivery Date:{" "}
            {new Date(Date.now() + 2 * 864e5).toLocaleDateString()}
          </p>

          {/* Delivery address selection */}
          {addresses.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Select Delivery Address</h3>
              <div
                className={`space-y-3 border p-3 rounded ${
                  addresses.length > 1 ? "max-h-64 overflow-y-auto" : ""
                }`}
              >
                {addresses.map((addr) => (
                  <div
                    key={addr.addressID}
                    className={`border rounded-lg p-3 ${
                      selectedAddressId === addr.addressID
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        setExpandedAddress(
                          expandedAddress === addr.addressID
                            ? null
                            : addr.addressID
                        )
                      }
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="selectedAddress"
                          value={addr.addressID}
                          checked={selectedAddressId === addr.addressID}
                          onChange={() => setSelectedAddressId(addr.addressID)}
                        />
                        <span className="font-medium">{addr.label}</span>
                      </label>
                      <span
                        className={`transition-transform ${
                          expandedAddress === addr.addressID ? "rotate-180" : ""
                        }`}
                      >
                        ⌄
                      </span>
                    </div>

                    {expandedAddress === addr.addressID && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>
                          {addr.buildingNo}, {addr.laneNo}, {addr.town}
                        </p>
                        <p>
                          {addr.state}, {addr.country}, {addr.zipcode}
                        </p>
                        {addr.floor && <p>Floor: {addr.floor}</p>}
                        {addr.roomNo && <p>Room: {addr.roomNo}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked statuses */}
          <div className="flex gap-4 mt-2 opacity-60">
            <div>
              <label className="block mb-1 font-medium">Order Status</label>
              <select
                value="pending"
                disabled
                className="border rounded p-2 w-40 bg-gray-100 text-gray-600 cursor-not-allowed"
              >
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Payment Status</label>
              <select
                value="pending"
                disabled
                className="border rounded p-2 w-40 bg-gray-100 text-gray-600 cursor-not-allowed"
              >
                <option value="pending">Pending</option>
              </select>
            </div>
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
      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Add New Customer
            </h3>
            <UserForm
              role="customer"
              onSubmit={handleAddSubmit}
              onCancel={() => setShowAddModal(false)}
              isLoading={loadingAction}
              submitText="Add"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
