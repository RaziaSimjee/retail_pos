import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaTimes } from "react-icons/fa";
import {
  useGetAllPurchaseItemsQuery,
  useAddPurchaseItemMutation,
  useUpdatePurchaseItemMutation,
  useDeletePurchaseItemMutation,
} from "../slices/purchaseItemApiSlice";
import { useGetProductVariantsQuery } from "../slices/productVariantApiSlice";
import { useGetAllPurchaseOrdersQuery } from "../slices/purchaseOrderApiSlice";

export default function PurchaseItemsAdminScreen() {
  const { data: itemsData, isLoading, error, refetch } = useGetAllPurchaseItemsQuery();
  const { data: variantsData } = useGetProductVariantsQuery();
  const { data: ordersData } = useGetAllPurchaseOrdersQuery();

  const [addItem] = useAddPurchaseItemMutation();
  const [updateItem] = useUpdatePurchaseItemMutation();
  const [deleteItem] = useDeletePurchaseItemMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    purchaseItemsID: "",
    purchaseOrderID: "",
    purchaseQuantity: "",
    perItemPrice: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.purchaseItemsID) {
      toast.error("Product variant must be selected");
      return false;
    }
    if (!formData.purchaseOrderID) {
      toast.error("Purchase Order must be selected");
      return false;
    }
    if (!formData.purchaseQuantity || formData.purchaseQuantity <= 0) {
      toast.error("Purchase quantity must be greater than 0");
      return false;
    }
    if (!formData.perItemPrice || formData.perItemPrice <= 0) {
      toast.error("Per item price must be greater than 0");
      return false;
    }
    return true;
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData({
      purchaseItemsID: item.purchaseItemsID,
      purchaseOrderID: item.purchaseOrderID,
      purchaseQuantity: item.purchaseQuantity,
      perItemPrice: item.perItemPrice,
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase item?"))
      return;
    try {
      await deleteItem(id).unwrap();
      toast.success("Purchase item deleted");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (selectedItem) {
        await updateItem({ id: selectedItem._id, ...formData }).unwrap();
        toast.success("Purchase item updated");
      } else {
        await addItem(formData).unwrap();
        toast.success("Purchase item added");
      }
      setSelectedItem(null);
      setShowAddModal(false);
      setFormData({
        purchaseItemsID: "",
        purchaseOrderID: "",
        purchaseQuantity: "",
        perItemPrice: "",
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save purchase item");
    }
  };

  // Filtered items for search
  const filteredItems = itemsData?.items?.filter((item) => {
    const s = search.toLowerCase();

    const variant = variantsData?.find(
      (v) => v.productVariantID === item.purchaseItemsID
    ) || {};

    const order = ordersData?.orders?.find(
      (o) => o._id === item.purchaseOrderID
    ) || {};

    return (
      (variant.product?.productName || "").toString().toLowerCase().includes(s) ||
      (variant.productVariantID || "").toString().toLowerCase().includes(s) ||
      (item.purchaseOrderID || "").toString().toLowerCase().includes(s) ||
      (order.supplierID?.fullName || order.supplierID || "").toString().toLowerCase().includes(s) ||
      (item.purchaseQuantity || "").toString().toLowerCase().includes(s) ||
      (item.perItemPrice || "").toString().toLowerCase().includes(s) ||
      (item.subTotal || "").toString().toLowerCase().includes(s)
    );
  });

  if (isLoading)
    return (
      <p className="text-center mt-4 text-gray-500">Loading purchase items...</p>
    );
  if (error)
    return (
      <p className="text-center mt-4 text-red-500">Error loading purchase items</p>
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Items</h2>

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
            <th className="py-2 px-4 border">Product Variant ID</th>
            <th className="py-2 px-4 border">Purchase Order ID</th>
            <th className="py-2 px-4 border">Quantity</th>
            <th className="py-2 px-4 border">Price</th>
            <th className="py-2 px-4 border">Subtotal</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems?.map((item) => (
            <tr key={item._id} className="text-center border-b">
              <td className="py-2 px-4">{item.purchaseItemsID}</td>
              <td className="py-2 px-4">
                {item.purchaseOrderID?._id || item.purchaseOrderID}
              </td>
              <td className="py-2 px-4">{item.purchaseQuantity}</td>
              <td className="py-2 px-4">{item.perItemPrice}</td>
              <td className="py-2 px-4">{item.subTotal}</td>
              <td className="py-2 px-4 flex justify-center gap-2">
                <button
                  onClick={() => handleEditClick(item)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteClick(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setShowAddModal(true);
          setSelectedItem(null);
        }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <FaPlus />
      </button>

      {/* Add/Edit Modal */}
      {(selectedItem || showAddModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">
              {selectedItem ? "Edit Purchase Item" : "Add Purchase Item"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Product Variant */}
              <div className="flex flex-col">
                <label htmlFor="purchaseItemsID" className="mb-1 font-medium">
                  Product Variant
                </label>
                <select
                  name="purchaseItemsID"
                  value={formData.purchaseItemsID}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select Product Variant</option>
                  {variantsData?.map((v) => (
                    <option key={v.productVariantID} value={v.productVariantID}>
                      {`Id: ${v.productVariantID} - ${v.product.productName}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Order */}
              <div className="flex flex-col">
                <label htmlFor="purchaseOrderID" className="mb-1 font-medium">
                  Purchase Order
                </label>
                <select
                  name="purchaseOrderID"
                  value={formData.purchaseOrderID}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select Purchase Order</option>
                  {ordersData?.orders?.map((order) => (
                    <option key={order._id} value={order._id}>
                      {`${order._id} - Supplier: ${
                        order.supplierID?.fullName || order.supplierID
                      }`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="flex flex-col">
                <label htmlFor="purchaseQuantity" className="mb-1 font-medium">
                  Quantity
                </label>
                <input
                  type="number"
                  name="purchaseQuantity"
                  value={formData.purchaseQuantity}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  min="1"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col">
                <label htmlFor="perItemPrice" className="mb-1 font-medium">
                  Per Item Price
                </label>
                <input
                  type="number"
                  name="perItemPrice"
                  value={formData.perItemPrice}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);
                    setShowAddModal(false);
                    setFormData({
                      purchaseItemsID: "",
                      purchaseOrderID: "",
                      purchaseQuantity: "",
                      perItemPrice: "",
                    });
                  }}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {selectedItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
