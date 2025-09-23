// src/pages/Rewards.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  useGetAllLoyaltyWalletsQuery,
  useGetLoyaltyRewardsByWalletIdQuery,
  useCreateLoyaltyRewardMutation,
  useUpdateLoyaltyRewardMutation,
  useDeleteLoyaltyRewardMutation,
  useGetLoyaltyRewardsCountByWalletIdQuery,
  useGetTotalPointsRewardedByWalletIdQuery,
} from "../slices/loyaltyProgramApiSlice";

export default function Rewards() {
  // Fetch wallets
  const { data: wallets, isLoading: walletsLoading } = useGetAllLoyaltyWalletsQuery({ skip: 0, take: 100 });
  const [selectedWallet, setSelectedWallet] = useState("");

  // Fetch rewards for selected wallet
  const { data: rewards = [], isLoading: rewardsLoading, refetch } = useGetLoyaltyRewardsByWalletIdQuery(
    { walletId: selectedWallet, skip: 0, take: 100 },
    { skip: !selectedWallet }
  );

  // Fetch totals
  const { data: totalRewards = 0 } = useGetLoyaltyRewardsCountByWalletIdQuery(selectedWallet, { skip: !selectedWallet });
  const { data: totalPoints } = useGetTotalPointsRewardedByWalletIdQuery(selectedWallet, { skip: !selectedWallet });

  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    loyaltyWalletId: "",
    loyaltyPointsRewarded: 0,
    rewardedDate: new Date().toISOString().split("T")[0],
  });

  const [createReward] = useCreateLoyaltyRewardMutation();
  const [updateReward] = useUpdateLoyaltyRewardMutation();
  const [deleteReward] = useDeleteLoyaltyRewardMutation();

  // Update wallet id in form when selection changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, loyaltyWalletId: selectedWallet }));
  }, [selectedWallet]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.loyaltyWalletId) { toast.error("Select a wallet"); return false; }
    if (formData.loyaltyPointsRewarded <= 0) { toast.error("Points must be greater than 0"); return false; }
    if (!formData.rewardedDate) { toast.error("Rewarded date is required"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      loyaltyWalletId: Number(formData.loyaltyWalletId),
      loyaltyPointsRewarded: Number(formData.loyaltyPointsRewarded),
      rewardedDate: new Date(formData.rewardedDate).toISOString(),
    };

    try {
      if (editingReward) {
        await updateReward({ id: editingReward.loyaltyPointsAwardId, ...payload }).unwrap();
        toast.success("Reward updated successfully");
      } else {
        await createReward(payload).unwrap();
        toast.success("Reward created successfully");
      }
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save reward");
    }
  };

  const resetForm = () => {
    setEditingReward(null);
    setFormData({
      loyaltyWalletId: selectedWallet || "",
      loyaltyPointsRewarded: 0,
      rewardedDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleEditClick = (reward) => {
    setEditingReward(reward);
    setFormData({
      loyaltyWalletId: reward.loyaltyWalletId,
      loyaltyPointsRewarded: reward.loyaltyPointsRewarded,
      rewardedDate: reward.rewardedDate.split("T")[0],
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reward?")) return;
    try {
      await deleteReward(id).unwrap();
      toast.success("Reward deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete reward");
    }
  };

  if (walletsLoading) return <p className="text-center mt-4 text-gray-500">Loading wallets...</p>;
  if (selectedWallet && rewardsLoading) return <p className="text-center mt-4 text-gray-500">Loading rewards...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Loyalty Rewards</h2>

      {/* Wallet selector and totals */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Wallet</label>
          <select
            className="border rounded p-2 w-full md:w-64"
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
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
            <div>Total Rewards: <span className="font-semibold">{totalRewards || 0}</span></div>
            <div>Total Points Earned: <span className="font-semibold">{totalPoints?.totalPointsEarned || 0}</span></div>
          </div>
        )}
      </div>

      {/* Add/Edit Reward Form */}
      {selectedWallet && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Points Rewarded</label>
              <input
                type="number"
                name="loyaltyPointsRewarded"
                value={formData.loyaltyPointsRewarded}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                placeholder="Points"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rewarded Date</label>
              <input
                type="date"
                name="rewardedDate"
                value={formData.rewardedDate}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FaPlus /> {editingReward ? "Update Reward" : "Add Reward"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Rewards Table */}
      {selectedWallet && rewards.length > 0 ? (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Reward ID</th>
                <th className="px-4 py-2">Wallet ID</th>
                <th className="px-4 py-2">Points Rewarded</th>
                <th className="px-4 py-2">Rewarded Date</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.loyaltyPointsAwardId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{r.loyaltyPointsAwardId}</td>
                  <td className="px-4 py-2">{r.loyaltyWalletId}</td>
                  <td className="px-4 py-2">{r.loyaltyPointsRewarded}</td>
                  <td className="px-4 py-2">{new Date(r.rewardedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(r)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(r.loyaltyPointsAwardId)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedWallet && rewards.length === 0 ? (
        <p className="text-gray-500 mt-4">No rewards found for this wallet.</p>
      ) : null}
    </div>
  );
}
