// src/pages/Wallets.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaFilter } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";
import {
  useGetAllLoyaltyWalletsQuery,
  useGetCustomerLoyaltyWalletQuery,
  useGetAllCustomersQuery,
  useCreateLoyaltyWalletMutation,
  useUpdateLoyaltyWalletMutation,
  useDeleteLoyaltyWalletMutation,
} from "../slices/loyaltyProgramApiSlice";

export default function Wallets() {
  const { userInfo } = useSelector((state) => state.auth);
  const userID = userInfo?.user?.userID?.toLowerCase();

  // Fetch logged-in user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetUserByIdQuery(userID, { skip: !userID });

  // Fetch all customers (for admin)
  const { data: customers } = useGetAllCustomersQuery({ skip: 0, take: 100 });

  const [filter, setFilter] = useState("");
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState({
    customerId: "",
    points: 0,
    expiryDate: "",
    description: "",
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const isAdmin = profileData?.userRole === "admin";

  // Fetch wallets
  const {
    data: walletsData,
    isLoading: walletsLoading,
    error: walletsError,
    refetch,
  } = isAdmin
    ? useGetAllLoyaltyWalletsQuery({ skip: 0, take: 100 })
    : useGetCustomerLoyaltyWalletQuery(profileData?.customerId, {
        skip: !profileData?.customerId,
      });

  // Ensure wallets is always an array
  const wallets = isAdmin
    ? walletsData || []
    : walletsData
    ? [walletsData]
    : [];

  // Admin mutations
  const [createWallet] = useCreateLoyaltyWalletMutation();
  const [updateWallet] = useUpdateLoyaltyWalletMutation();
  const [deleteWallet] = useDeleteLoyaltyWalletMutation();

  if (profileLoading)
    return <p className="text-center mt-4 text-gray-500">Loading profile...</p>;
  if (profileError || !profileData)
    return (
      <p className="text-center mt-4 text-red-500">Failed to load profile.</p>
    );

  if (walletsLoading)
    return <p className="text-center mt-4 text-gray-500">Loading wallets...</p>;
  if (walletsError)
    return (
      <p className="text-center mt-4 text-red-500">Error loading wallets</p>
    );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const today = new Date().toISOString().split("T")[0];
    if (!formData.customerId) {
      toast.error("Customer is required");
      return false;
    }
    if (!formData.expiryDate) {
      toast.error("Expiry date is required");
      return false;
    }
    if (formData.expiryDate === today) {
      toast.error("Expiry date cannot be today");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      customerId: Number(formData.customerId),
      points: Number(formData.points),
      expiryDate: new Date(formData.expiryDate).toISOString(),
      description: formData.description,
    };

    try {
      if (editingWallet) {
        setUpdateLoading(true);
        await updateWallet({
          id: editingWallet.loyaltyWalletId,
          ...payload,
        }).unwrap();
        toast.success("Wallet updated successfully");
      } else {
        setCreateLoading(true);
        await createWallet(payload).unwrap();
        toast.success("Wallet created successfully");
      }
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save wallet");
    } finally {
      setCreateLoading(false);
      setUpdateLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ customerId: "", points: 0, expiryDate: "", description: "" });
    setEditingWallet(null);
  };

  const handleEditClick = (wallet) => {
    setEditingWallet(wallet);
    setFormData({
      customerId: wallet.customerId,
      points: wallet.points,
      expiryDate: wallet.expiryDate.split("T")[0],
      description: wallet.description,
    });
  };

  const handleDeleteClick = async (walletId) => {
    if (!window.confirm("Are you sure you want to delete this wallet?")) return;
    try {
      await deleteWallet(walletId).unwrap();
      toast.success("Wallet deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete wallet");
    }
  };

  const filteredWallets = wallets.filter((wallet) =>
    Object.values(wallet).join(" ").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Loyalty Wallets</h2>

      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-gray-50 p-4 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              {editingWallet ? (
                <input
                  type="text"
                  value={formData.customerId}
                  disabled
                  className="border rounded p-2 w-full bg-gray-200 cursor-not-allowed"
                />
              ) : (
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers?.map((cust) => (
                    <option key={cust.customerId} value={cust.customerId}>
                      {cust.customerId} - {cust.username || cust.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                placeholder="Points"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                placeholder="Description"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={createLoading || updateLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded text-white ${
                editingWallet
                  ? updateLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                  : createLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaPlus />
              {editingWallet
                ? updateLoading
                  ? "Updating..."
                  : "Update Wallet"
                : createLoading
                ? "Creating..."
                : "Add Wallet"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Input - only for admin */}
      {isAdmin && (
        <div className="mb-4 relative w-full md:w-1/3">
          <FaFilter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Filter by points, wallet id, customer id, date or description"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 pl-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full border border-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Wallet ID</th>
              <th className="px-4 py-2">Customer ID</th>
              <th className="px-4 py-2">Points</th>
              <th className="px-4 py-2">Expiry Date</th>
              <th className="px-4 py-2">Description</th>
              {isAdmin && <th className="px-4 py-2 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredWallets.map((wallet) => (
              <tr
                key={wallet.loyaltyWalletId}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-4 py-2">{wallet.loyaltyWalletId}</td>
                <td className="px-4 py-2">{wallet.customerId}</td>
                <td className="px-4 py-2">{wallet.points}</td>
                <td className="px-4 py-2">
                  {new Date(wallet.expiryDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{wallet.description}</td>
                {isAdmin && (
                  <td className="px-4 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(wallet)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(wallet.loyaltyWalletId)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filteredWallets.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="text-center py-4 text-gray-500"
                >
                  No wallets match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
