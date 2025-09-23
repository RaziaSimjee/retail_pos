// src/pages/Spendings.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaFilter } from "react-icons/fa";
import {
  useGetAllLoyaltyWalletsQuery,
  useGetAllPointsSpentByWalletIdQuery,
  useGetTotalSpendingPointsByWalletIdQuery,
  useCreateLoyaltySpendingMutation,
  useUpdateLoyaltySpendingMutation,
  useDeleteLoyaltySpendingMutation,
} from "../slices/loyaltyProgramApiSlice";

export default function Spendings() {
  const { data: wallets, isLoading: walletsLoading } =
    useGetAllLoyaltyWalletsQuery({ skip: 0, take: 100 });

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [filter, setFilter] = useState("");

  const {
    data: spendings = [],
    isLoading: spendingsLoading,
    refetch,
  } = useGetAllPointsSpentByWalletIdQuery(
    { walletId: selectedWallet, skip: 0, take: 100 },
    { skip: !selectedWallet }
  );

  const {
    data: totalPointsData,
  } = useGetTotalSpendingPointsByWalletIdQuery(selectedWallet, {
    skip: !selectedWallet,
  });

  const totalPointsSpent = totalPointsData?.totalPointsSpent ?? 0;

  const [editingSpending, setEditingSpending] = useState(null);
  const [formData, setFormData] = useState({
    loyaltyWalletId: "",
    loyaltyPointsSpent: 0,
    description: "",
  });

  const [createSpending] = useCreateLoyaltySpendingMutation();
  const [updateSpending] = useUpdateLoyaltySpendingMutation();
  const [deleteSpending] = useDeleteLoyaltySpendingMutation();

  useEffect(() => {
    if (selectedWallet) {
      setFormData((prev) => ({ ...prev, loyaltyWalletId: selectedWallet }));
      setEditingSpending(null);
    }
  }, [selectedWallet]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.loyaltyWalletId) {
      toast.error("Select a wallet");
      return false;
    }
    if (formData.loyaltyPointsSpent <= 0) {
      toast.error("Points must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      loyaltyWalletId: Number(formData.loyaltyWalletId),
      loyaltyPointsSpent: Number(formData.loyaltyPointsSpent),
      description: formData.description,
    };

    try {
      if (editingSpending) {
        await updateSpending({ id: editingSpending.id, ...payload }).unwrap();
        toast.success("Spending updated successfully");
      } else {
        await createSpending(payload).unwrap();
        toast.success("Spending created successfully");
      }
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save spending");
    }
  };

  const resetForm = () => {
    setEditingSpending(null);
    setFormData({
      loyaltyWalletId: selectedWallet || "",
      loyaltyPointsSpent: 0,
      description: "",
    });
  };

  const handleEditClick = (spending) => {
    setEditingSpending(spending);
    setFormData({
      loyaltyWalletId: spending.loyaltyWalletId,
      loyaltyPointsSpent: spending.loyaltyPointsSpent,
      description: spending.description,
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Delete this spending?")) return;
    try {
      await deleteSpending(id).unwrap();
      toast.success("Spending deleted");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete spending");
    }
  };

  if (walletsLoading)
    return <p className="text-center mt-4 text-gray-500">Loading wallets...</p>;
  if (selectedWallet && spendingsLoading)
    return <p className="text-center mt-4 text-gray-500">Loading spendings...</p>;

  // Filter spendings by any field
  const filteredSpendings = spendings.filter((s) =>
    Object.values(s)
      .join(" ")
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Loyalty Spendings</h2>

      {/* Wallet selector and totals */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Wallet
          </label>
          <select
            className="border rounded p-2 w-full md:w-64"
            value={selectedWallet || ""}
            onChange={(e) => setSelectedWallet(Number(e.target.value))}
          >
            <option value="">-- Select Wallet --</option>
            {wallets?.map((w) => (
              <option key={w.loyaltyWalletId} value={w.loyaltyWalletId}>
                Wallet {w.loyaltyWalletId} - Customer {w.customerId}
              </option>
            ))}
          </select>
        </div>

        {selectedWallet && (
          <div className="flex gap-6 mt-2 md:mt-0">
            <div>
              Total Points Spent:{" "}
              <span className="font-semibold">{totalPointsSpent}</span>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {selectedWallet && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-gray-50 p-4 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {editingSpending && (
              <div className="col-span-full">
                <p className="text-sm text-gray-600">
                  Editing Spending ID:{" "}
                  <span className="font-semibold">{editingSpending.id}</span>
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Points Spent
              </label>
              <input
                type="number"
                name="loyaltyPointsSpent"
                value={formData.loyaltyPointsSpent}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                placeholder="Points"
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
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FaPlus /> {editingSpending ? "Update Spending" : "Add Spending"}
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

      {/* Filter Input */}
      {selectedWallet && (
        <div className="mb-4 relative w-full md:w-1/3">
        <FaFilter
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={16}
        />
        <input
          type="text"
          placeholder="Filter by ID, Points, Date, or Description"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 pl-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>
      )}

      {/* Spendings Table */}
      {selectedWallet && filteredSpendings.length > 0 ? (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Wallet ID</th>
                <th className="px-4 py-2">Points Spent</th>
                <th className="px-4 py-2">Spent Date</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpendings.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2">{s.loyaltyWalletId}</td>
                  <td className="px-4 py-2">{s.loyaltyPointsSpent}</td>
                  <td className="px-4 py-2">
                    {s.spentDate
                      ? new Date(s.spentDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2">{s.description}</td>
                  <td className="px-4 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(s.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSpendings.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No spendings match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : selectedWallet && filteredSpendings.length === 0 ? (
        <p className="text-gray-500 mt-4">
          No spendings found for this wallet.
        </p>
      ) : null}
    </div>
  );
}
