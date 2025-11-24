import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaTimes} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAllPurchaseOrdersQuery,
  useAddPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} from "../slices/purchaseOrderApiSlice";
import { useGetAllSuppliersQuery } from "../slices/suppliersApiSlice";

export default function PurchaseOrdersAdminScreen() {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch } =
    useGetAllPurchaseOrdersQuery();
  const { data: suppliersData } = useGetAllSuppliersQuery();

  const [addOrder] = useAddPurchaseOrderMutation();
  const [updateOrder] = useUpdatePurchaseOrderMutation();
  const [deleteOrder] = useDeletePurchaseOrderMutation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    supplierID: "",
    purchaseDate: "",
    totalAmount: "",
    notes: "",
    purchasedBy: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.supplierID) return toast.error("Supplier is required"), false;
    if (!formData.purchaseDate) return toast.error("Purchase Date is required"), false;
    if (!formData.totalAmount || Number(formData.totalAmount) <= 0)
      return toast.error("Total Amount must be greater than 0"), false;
    return true;
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setFormData({
      supplierID: order.supplierID?._id || order.supplierID || "",
      purchaseDate: order.purchaseDate
        ? new Date(order.purchaseDate).toISOString().slice(0, 10)
        : "",
      totalAmount: order.totalAmount,
      notes: order.notes || "",
      purchasedBy: order.purchasedBy || "",
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase order?")) return;
    try {
      await deleteOrder(id).unwrap();
      toast.success("Purchase order deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete purchase order");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (selectedOrder) {
        await updateOrder({ id: selectedOrder._id, ...formData }).unwrap();
        toast.success("Purchase order updated successfully");
      } else {
        await addOrder(formData).unwrap();
        toast.success("Purchase order added successfully");
      }
      setSelectedOrder(null);
      setShowAddModal(false);
      setFormData({
        supplierID: "",
        purchaseDate: "",
        totalAmount: "",
        notes: "",
        purchasedBy: "",
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save purchase order");
    }
  };

  if (ordersLoading)
    return <p className="text-center mt-4 text-gray-500">Loading purchase orders...</p>;
  if (ordersError)
    return <p className="text-center mt-4 text-red-500">Error loading purchase orders</p>;

  // ------------------------------------------------
  // 🔍 FILTER LOGIC (SEARCH BAR)
  // ------------------------------------------------
  const filteredOrders = ordersData?.orders?.filter((order) => {
    const s = search.toLowerCase();

    const supplier =
      suppliersData?.suppliers?.find(
        (sup) => sup._id === order.supplierID || sup._id === order.supplierID?._id
      ) || {};

return (
    (supplier.fullName || "").toString().toLowerCase().includes(s) ||
    (supplier._id || "").toString().toLowerCase().includes(s) ||
    (order.notes || "").toString().toLowerCase().includes(s) ||
    (order.purchasedBy || "").toString().toLowerCase().includes(s) ||
    (order.totalAmount || "").toString().toLowerCase().includes(s) ||
    (order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString() : "").toString().toLowerCase().includes(s)
  );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>

     {/* 🔍 Search Field */}
      <div className="relative w-full max-w-xs mb-6">
        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search purchase orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-8 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">Supplier</th>
            <th className="py-2 px-4 border">Purchase Date</th>
            <th className="py-2 px-4 border">Total Amount</th>
            <th className="py-2 px-4 border">Notes</th>
            <th className="py-2 px-4 border">Purchased By</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders?.map((order) => {
            const supplier = suppliersData?.suppliers?.find(
              (s) => s._id === order.supplierID || s._id === order.supplierID?._id
            );

            return (
              <tr key={order._id} className="text-center border-b">
                <td className="py-2 px-4">
                  {supplier ? `${supplier.fullName} (${supplier._id})` : "-"}
                </td>
                <td className="py-2 px-4">
                  {order.purchaseDate
                    ? new Date(order.purchaseDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="py-2 px-4">{order.totalAmount ?? "-"}</td>
                <td className="py-2 px-4">{order.notes ?? "-"}</td>
                <td className="py-2 px-4">{order.purchasedBy ?? "-"}</td>
                <td className="py-2 px-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleEditClick(order)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(order._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setShowAddModal(true);
          setSelectedOrder(null);
        }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <FaPlus />
      </button>

      {/* ADD/EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">
              {selectedOrder ? "Edit Purchase Order" : "Add Purchase Order"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Supplier */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Supplier</label>
                <select
                  name="supplierID"
                  value={formData.supplierID}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Select Supplier</option>
                  {suppliersData?.suppliers?.map((sup) => (
                    <option key={sup._id} value={sup._id}>
                      {sup.fullName} -- {sup._id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Date */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded"
                />
              </div>

              {/* Total Amount */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Total Amount</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded"
                  min="0.01"
                  step="0.01"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded"
                />
              </div>

              {/* Purchased By */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Purchased By</label>
                <input
                  type="text"
                  name="purchasedBy"
                  value={formData.purchasedBy}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {selectedOrder ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
