import React, { useEffect, useState } from "react";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";
import { useGetReceiptByIdQuery } from "../slices/saleApiSlice";
import DownloadReceiptButton from "../components/DownloadReceiptButton";

import { toast } from "react-toastify";

const Order = () => {
  // States
  const [sales, setSales] = useState([]);
  const [addresses, setAddresses] = useState({}); // store addresses by addressID
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

  // Fetch sales
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

        // Pre-fetch all addresses
        const addressIDs = [...new Set(data.map((sale) => sale.addressID))]; // unique addressIDs
        const addressResponses = await Promise.all(
          addressIDs.map((id) =>
            fetch(`http://localhost:3000/api/addresses/${id}`).then((res) =>
              res.json()
            )
          )
        );

        // Build a dictionary: addressID => address object
        const addressMap = {};
        addressResponses.forEach((resp) => {
          if (resp.address) {
            addressMap[resp.address.addressID] = resp.address;
          }
        });
        setAddresses(addressMap);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch sales or addresses");
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
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toLocaleDateString();
  };

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const handleStatusChange = async (saleID, field, value) => {
    try {
      setSales((prev) =>
        prev.map((s) => (s.saleID === saleID ? { ...s, [field]: value } : s))
      );

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
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        toast.error("Delivery date cannot be in the past.");
        return;
      }

      const newDateISO = selectedDate.toISOString();

      setSales((prev) =>
        prev.map((s) =>
          s.saleID === saleID ? { ...s, deliveryDate: newDateISO } : s
        )
      );

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

      {sales.map((sale) => {
        const address = addresses[sale.addressID]; // fetch from preloaded addresses

        return (
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
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleDeliveryDateChange(sale.saleID, e.target.value)
                      }
                      className="border rounded p-1"
                    />
                  ) : null}
                </p>
                <p className="text-gray-700 text-sm ml-[105px]">
                  Current Delivery Date:{" "}
                  {formatDateForDisplay(sale.deliveryDate)}
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
                <DownloadReceiptButton saleID={parseInt(sale.saleID, 10)} />

                {/* Display Address */}
                {address && (
                  <div className="mt-2 border-t pt-2">
                    <p>
                      <strong>Label:</strong> {address.label}
                    </p>
                    <p>
                      <strong>Country:</strong> {address.country}
                    </p>
                    <p>
                      <strong>State:</strong> {address.state}
                    </p>
                    <p>
                      <strong>Town:</strong> {address.town}
                    </p>
                    <p>
                      <strong>Lane No:</strong> {address.laneNo}
                    </p>
                    <p>
                      <strong>Building No:</strong> {address.buildingNo}
                    </p>
                    <p>
                      <strong>Floor:</strong> {address.floor}
                    </p>
                    <p>
                      <strong>Room No:</strong> {address.roomNo}
                    </p>
                    <p>
                      <strong>Zipcode:</strong> {address.zipcode}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Order;
