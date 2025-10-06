import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAllPurchaseOrdersQuery,
  useAddPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} from "../slices/purchaseOrderApiSlice";
import { useGetAllSuppliersQuery } from "../slices/suppliersApiSlice";

export default function PurchaseOrdersAdminScreen() {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch } = useGetAllPurchaseOrdersQuery();
  const { data: suppliersData } = useGetAllSuppliersQuery();

  const [addOrder] = useAddPurchaseOrderMutation();
  const [updateOrder] = useUpdatePurchaseOrderMutation();
  const [deleteOrder] = useDeletePurchaseOrderMutation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    supplierID: "",
    purchaseDate: "",
    totalAmount: "",
    notes: "",
    purchasedBy: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.supplierID) {
      toast.error("Supplier is required");
      return false;
    }
    if (!formData.purchaseDate) {
      toast.error("Purchase Date is required");
      return false;
    }
    if (!formData.totalAmount || Number(formData.totalAmount) <= 0) {
      toast.error("Total Amount must be greater than 0");
      return false;
    }
    return true;
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setFormData({
      supplierID: order.supplierID?._id || order.supplierID || "",
      purchaseDate: order.purchaseDate ? new Date(order.purchaseDate).toISOString().slice(0, 10) : "",
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
      setFormData({ supplierID: "", purchaseDate: "", totalAmount: "", notes: "", purchasedBy: "" });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save purchase order");
    }
  };

  if (ordersLoading) return <p className="text-center mt-4 text-gray-500">Loading purchase orders...</p>;
  if (ordersError) return <p className="text-center mt-4 text-red-500">Error loading purchase orders</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>

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
          {ordersData?.orders?.map((order) => {
            // Find supplier object if populated
            const supplier = suppliersData?.suppliers?.find(
              (s) => s._id === order.supplierID || s._id === order.supplierID?._id
            );

            return (
              <tr key={order._id} className="text-center border-b">
                <td className="py-2 px-4">
                  {supplier 
                    ? `${supplier._id}`
                    : typeof order.supplierID === "string"
                    ? order.supplierID
                    : "-"}
                </td>
                <td className="py-2 px-4">{order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString() : "-"}</td>
                <td className="py-2 px-4">{order.totalAmount ?? "-"}</td>
                <td className="py-2 px-4">{order.notes ?? "-"}</td>
                <td className="py-2 px-4">{order.purchasedBy ?? "-"}</td>
                <td className="py-2 px-4 flex justify-center gap-2">
                  <button onClick={() => handleEditClick(order)} className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteClick(order._id)} className="text-red-500 hover:text-red-700">
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
        onClick={() => { setShowAddModal(true); setSelectedOrder(null); }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <FaPlus />
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">{selectedOrder ? "Edit Purchase Order" : "Add Purchase Order"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Supplier Dropdown */}
              <div className="flex flex-col">
                <label htmlFor="supplierID" className="mb-1 font-medium">Supplier</label>
                <select
                  name="supplierID"
                  id="supplierID"
                  value={formData.supplierID}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select Supplier</option>
                  {suppliersData?.suppliers?.map((sup) => (
                    <option key={sup._id} value={sup._id}>
                      {sup.fullName} -- {sup._id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="purchaseDate" className="mb-1 font-medium">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  id="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="totalAmount" className="mb-1 font-medium">Total Amount</label>
                <input
                  type="number"
                  name="totalAmount"
                  id="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="notes" className="mb-1 font-medium">Notes</label>
                <input
                  type="text"
                  name="notes"
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="purchasedBy" className="mb-1 font-medium">Purchased By</label>
                <input
                  type="text"
                  name="purchasedBy"
                  id="purchasedBy"
                  value={formData.purchasedBy}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{selectedOrder ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
