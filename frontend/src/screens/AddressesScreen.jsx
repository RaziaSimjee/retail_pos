import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  useGetAllSuppliersQuery,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../slices/suppliersApiSlice";

export default function SuppliersAdminScreen() {
  const { data, isLoading, error, refetch } = useGetAllSuppliersQuery();
  const [addSupplier] = useAddSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      fullName: supplier.fullName,
      companyName: supplier.companyName || "",
      email: supplier.email,
      phone: supplier.phone || "",
    });
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id).unwrap();
        toast.success("Supplier deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete supplier");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSupplier({ id: selectedSupplier._id, ...formData }).unwrap();
      toast.success("Supplier updated successfully");
      setSelectedSupplier(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update supplier");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSupplier(formData).unwrap();
      toast.success("Supplier added successfully");
      setShowAddModal(false);
      setFormData({ fullName: "", companyName: "", email: "", phone: "" });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add supplier");
    }
  };

  if (isLoading) return <p className="text-center mt-4 text-gray-500">Loading suppliers...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error loading suppliers</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Suppliers</h2>

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">Full Name</th>
            <th className="py-2 px-4 border">Company Name</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Phone</th>
            <th className="py-2 px-4 border">Created At</th>
            <th className="py-2 px-4 border">Updated At</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.suppliers?.map((sup) => (
            <tr key={sup._id} className="text-center border-b">
              <td className="py-2 px-4">{sup.fullName}</td>
              <td className="py-2 px-4">{sup.companyName || "-"}</td>
              <td className="py-2 px-4">{sup.email}</td>
              <td className="py-2 px-4">{sup.phone || "-"}</td>
              <td className="py-2 px-4">{new Date(sup.createdAt).toLocaleString()}</td>
              <td className="py-2 px-4">{new Date(sup.updatedAt).toLocaleString()}</td>
              <td className="py-2 px-4 flex justify-center gap-2">
                <button onClick={() => handleEditClick(sup)} className="text-blue-500 hover:text-blue-700" title="Edit">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteClick(sup._id)} className="text-red-500 hover:text-red-700" title="Delete">
                  <FaTrash />
                </button>
                <Link
                  to={`/addresses/${sup._id}`}
                  className="text-green-600 hover:text-green-800 underline"
                >
                  View Addresses
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <FaPlus />
      </button>

      {/* Edit Supplier Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">Edit Supplier</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block mb-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block mb-1">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setSelectedSupplier(null)} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">Add Supplier</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block mb-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block mb-1">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
