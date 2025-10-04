import React, { useEffect, useState } from "react";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";
import { toast } from "react-toastify";

const Order = () => {
  const [sales, setSales] = useState([]);
  const [expandedSaleID, setExpandedSaleID] = useState(null);

  // Get user role from localStorage
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  const role = userInfo?.user?.role?.toLowerCase() || "customer";
  const userId = userInfo?.user?.userID;

  // Fetch customer info if role is customer
  const { data: userData } = useGetUserByIdQuery(
    role === "customer" ? userId : null,
    { skip: role !== "customer" }
  );

  const customerId = role === "customer" ? userData?.customerId : null;

  useEffect(() => {
    const fetchSales = async () => {
      try {
        let url = "http://localhost:3000/api/sales";
        if (role === "customer" && customerId) {
          url = `http://localhost:3000/api/sales/${customerId}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSales();
  }, [role, customerId]);

  const handleToggleExpand = (saleID) => {
    setExpandedSaleID(expandedSaleID === saleID ? null : saleID);
  };

  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "N/A";
    const d = new Date(isoDate);
    const offset = d.getTimezoneOffset(); // in minutes
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toLocaleDateString();
  };

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const offset = d.getTimezoneOffset(); // in minutes
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const handleStatusChange = async (saleID, field, value) => {
    try {
      // Update status locally
      setSales((prev) =>
        prev.map((s) => (s.saleID === saleID ? { ...s, [field]: value } : s))
      );

      // Send update to backend
      await fetch(`http://localhost:3000/api/sales/update/${saleID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      toast.success("Status updated successfully");
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleDeliveryDateChange = async (saleID, value) => {
    try {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // remove time component

      if (selectedDate < today) {
        toast.error("Delivery date cannot be in the past.");
        return;
      }

      const newDateISO = selectedDate.toISOString();

      // Update locally
      setSales((prev) =>
        prev.map((s) =>
          s.saleID === saleID ? { ...s, deliveryDate: newDateISO } : s
        )
      );

      // Update backend
      await fetch(`http://localhost:3000/api/sales/update/${saleID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryDate: newDateISO }),
      });

      toast.success("Delivery date updated successfully");
    } catch (err) {
      console.error("Failed to update delivery date:", err);
      toast.error("Failed to update delivery date");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {sales.length === 0 && <p>No sales found.</p>}

      {sales.map((sale) => (
        <div
          key={sale._id}
          className="border rounded mb-4 p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <p>
                <strong>Sale ID:</strong> {sale.saleID}
              </p>
              <p>
                <strong>Customer ID:</strong> {sale.customerID}
              </p>
              <p>
                <strong>Order Status:</strong>{" "}
                {role === "manager" || role === "admin" ? (
                  <select
                    value={sale.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        sale.saleID,
                        "orderStatus",
                        e.target.value
                      )
                    }
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  sale.orderStatus
                )}
              </p>
              <p>
                <strong>Payment Status:</strong>{" "}
                {role === "manager" || role === "admin" ? (
                  <select
                    value={sale.paymentStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        sale.saleID,
                        "paymentStatus",
                        e.target.value
                      )
                    }
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  sale.paymentStatus
                )}
              </p>
              <p className="flex items-center gap-2">
                <strong>Delivery Date:</strong>
                {role === "manager" || role === "admin" ? (
                  <input
                    type="date"
                    value={
                      sale.deliveryDate
                        ? formatDateForInput(sale.deliveryDate)
                        : ""
                    }
                    min={new Date().toISOString().split("T")[0]} // cannot select past dates
                    onChange={(e) =>
                      handleDeliveryDateChange(sale.saleID, e.target.value)
                    }
                    className="border rounded p-1"
                  />
                ) : null}
              </p>

              {/* Always display current delivery date below */}
              <p className="text-gray-700 text-sm ml-[105px]">
                Current Delivery Date: {formatDateForDisplay(sale.deliveryDate)}
              </p>
            </div>

            <button
              onClick={() => handleToggleExpand(sale.saleID)}
              className="text-blue-500 font-bold text-xl"
            >
              {expandedSaleID === sale.saleID ? "▲" : "▼"}
            </button>
          </div>

          {expandedSaleID === sale.saleID && (
            <div className="mt-4 border-t pt-2 space-y-2">
              {sale.productList.map((p) => (
                <div
                  key={p.saleProductID}
                  className="flex justify-between border-b pb-1"
                >
                  <p>
                    {p.productName} x {p.quantity}
                  </p>
                  <p>
                    {p.unitPrice} Ks each → {p.totalPrice} Ks
                  </p>
                </div>
              ))}
              <p>
                <strong>Subtotal:</strong> {sale.subtotal} Ks
              </p>
              <p>
                <strong>Tax:</strong> {sale.tax} Ks
              </p>
              <p>
                <strong>Total:</strong> {sale.total} Ks
              </p>
              <p>
                <strong>Sale Date:</strong>{" "}
                {new Date(sale.saleDate).toLocaleString()}
              </p>
              {sale.receiptLink && (
                <a
                  href={sale.receiptLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Receipt
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Order;
