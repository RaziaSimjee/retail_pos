import React, { useEffect, useState } from "react";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";
import DownloadReceiptButton from "../components/DownloadReceiptButton";
import { toast } from "react-toastify";

const Order = () => {
  const [sales, setSales] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [expandedSaleID, setExpandedSaleID] = useState(null);

  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  const role = userInfo?.user?.role?.toLowerCase() || "customer";
  const userId = userInfo?.user?.userID;

  console.log(userId);

  // Fetch customer info if logged in user is customer
  const { data: userData } = useGetUserByIdQuery(
    role === "customer" ? userId : null,
    { skip: role !== "customer" }
  );
  console.log(userData);

  const customerId = role === "customer" ? userData?.customerId : null;
  console.log(userData);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        let url = "http://localhost:3000/api/sales";

        if (role === "customer" && customerId) {
          url = `http://localhost:3000/api/sales/customer/${parseInt(
            customerId,
            10
          )}`;
        } else if (role === "cashier") {
          url = `http://localhost:3000/api/sales/status/pending`;
        } // manager/admin: fetch all orders (default url)

        const res = await fetch(url);
        const data = await res.json();
        setSales(data);

        // Pre-fetch addresses
        const addressIDs = [...new Set(data.map((sale) => sale.addressID))];
        const addressResponses = await Promise.all(
          addressIDs.map((id) =>
            fetch(`http://localhost:3000/api/addresses/${id}`).then((res) =>
              res.json()
            )
          )
        );

        const addressMap = {};
        addressResponses.forEach((resp) => {
          if (resp.address) addressMap[resp.address.addressID] = resp.address;
        });
        setAddresses(addressMap);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch sales or addresses");
      }
    };

    if (role === "customer" && !customerId) return; // wait until customerID is loaded
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

  const canEditOrderStatus =
    role === "manager" || role === "admin" || role === "cashier";
  const canEditPaymentStatus = role === "manager" || role === "admin";
  const canEditDeliveryDate =
    role === "manager" || role === "admin" || role === "cashier";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {sales.length === 0 && <p>No sales found.</p>}

      {sales.map((sale) => {
        const address = addresses[sale.addressID];

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
                  {canEditOrderStatus ? (
                    role === "cashier" && sale.orderStatus !== "pending" ? (
                      sale.orderStatus
                    ) : (
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
                    )
                  ) : (
                    sale.orderStatus
                  )}
                </p>

                <p>
                  <strong>Payment Status:</strong>{" "}
                  {canEditPaymentStatus ? (
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
                  {canEditDeliveryDate ? (
                    role === "cashier" && sale.orderStatus !== "pending" ? (
                      formatDateForDisplay(sale.deliveryDate)
                    ) : (
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
                    )
                  ) : (
                    formatDateForDisplay(sale.deliveryDate)
                  )}
                </p>

                {role !== "customer" && (
                  <p className="text-gray-700 text-sm ml-[105px]">
                    Current Delivery Date:{" "}
                    {formatDateForDisplay(sale.deliveryDate)}
                  </p>
                )}
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
