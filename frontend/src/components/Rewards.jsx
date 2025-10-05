import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaFilter } from "react-icons/fa";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetAllLoyaltyWalletsQuery,
  useGetLoyaltyRewardsByWalletIdQuery,
  useCreateLoyaltyRewardMutation,
  useUpdateLoyaltyRewardMutation,
  useDeleteLoyaltyRewardMutation,
  useGetLoyaltyRewardsCountByWalletIdQuery,
  useGetTotalPointsRewardedByWalletIdQuery,
  useGetCustomerLoyaltyWalletQuery,
} from "../slices/loyaltyProgramApiSlice";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";

export default function Rewards() {
  const { userInfo } = useSelector((state) => state.auth);
  const role = userInfo?.user?.role?.toLowerCase();
  const isCustomer = role === "customer";
  const userId = userInfo?.user?.userID;

  // --- Step 1: fetch user for customerId ---
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(
    userId ?? skipToken,
    { skip: !isCustomer || !userId }
  );

  // --- Step 2: fetch customer's single wallet ---
  const { data: customerWalletData, isLoading: customerWalletLoading } =
    useGetCustomerLoyaltyWalletQuery(userData?.customerId ?? skipToken, {
      skip: !userData?.customerId || !isCustomer,
    });

  // --- Admin: fetch all wallets ---
  const { data: wallets, isLoading: walletsLoading } =
    useGetAllLoyaltyWalletsQuery({ skip: 0, take: 100 }, { skip: isCustomer });

  // --- Selected wallet ---
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Preselect for customer
  useEffect(() => {
    if (customerWalletData?.loyaltyWalletId) {
      setSelectedWallet(customerWalletData.loyaltyWalletId);
    }
  }, [customerWalletData]);

  const [filter, setFilter] = useState("");
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    loyaltyWalletId: "",
    loyaltyPointsRewarded: 0,
    rewardedDate: new Date().toISOString().split("T")[0],
  });

  const [createReward, { isLoading: isCreating }] = useCreateLoyaltyRewardMutation();
  const [updateReward, { isLoading: isUpdating }] = useUpdateLoyaltyRewardMutation();
  const [deleteReward] = useDeleteLoyaltyRewardMutation();

  // Fetch rewards for selected wallet
  const {
    data: rewards = [],
    isLoading: rewardsLoading,
    refetch,
  } = useGetLoyaltyRewardsByWalletIdQuery(
    selectedWallet ? { walletId: selectedWallet, skip: 0, take: 100 } : skipToken
  );

  // Fetch totals
  const { data: totalRewards = 0 } = useGetLoyaltyRewardsCountByWalletIdQuery(
    selectedWallet ?? skipToken
  );
  const { data: totalPoints } = useGetTotalPointsRewardedByWalletIdQuery(
    selectedWallet ?? skipToken
  );

  // --- Update formData when wallet changes ---
  useEffect(() => {
    if (selectedWallet) {
      setFormData((prev) => ({ ...prev, loyaltyWalletId: selectedWallet }));
      setEditingReward(null);
    }
  }, [selectedWallet]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.loyaltyWalletId) {
      toast.error("Select a wallet");
      return false;
    }
    if (formData.loyaltyPointsRewarded <= 0) {
      toast.error("Points must be greater than 0");
      return false;
    }
    if (!formData.rewardedDate) {
      toast.error("Rewarded date is required");
      return false;
    }
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

  const filteredRewards = rewards.filter((r) => {
    const search = filter.toLowerCase();
    return (
      r.loyaltyPointsAwardId.toString().includes(search) ||
      r.loyaltyWalletId.toString().includes(search) ||
      r.loyaltyPointsRewarded.toString().includes(search) ||
      new Date(r.rewardedDate).toLocaleDateString().toLowerCase().includes(search)
    );
  });

  if (
    walletsLoading ||
    userLoading ||
    customerWalletLoading ||
    (selectedWallet && rewardsLoading)
  ) {
    return <p className="text-center mt-4 text-gray-500">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Loyalty Rewards</h2>

      {/* Wallet selector & totals */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-6">
        {isCustomer && selectedWallet && customerWalletData ? (
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 w-full md:w-auto">
            <div>
              <label className="block text-sm font-medium mb-2">Your Wallet</label>
              <input
                type="text"
                value={`Wallet ${selectedWallet} - Points: ${customerWalletData.points}`}
                readOnly
                className="border border-gray-300 rounded p-2 w-full md:w-64 bg-white cursor-not-allowed"
              />
            </div>
            <div className="mt-2 md:mt-0">
              <label className="block text-sm font-medium mb-2">Total Rewards</label>
              <input
                type="text"
                value={totalRewards || 0}
                readOnly
                className="border border-gray-300 rounded p-2 w-full md:w-40 bg-white cursor-not-allowed"
              />
            </div>
          </div>
        ) : !isCustomer ? (
          <div className="flex flex-col md:flex-row md:items-center md:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select Wallet</label>
              <select
                className="border border-gray-300 rounded p-2 w-full md:w-64 bg-white"
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
              <div className="mt-2 md:mt-0">
                <label className="block text-sm font-medium mb-2">Total Rewards</label>
                <input
                  type="text"
                  value={totalRewards || 0}
                  readOnly
                  className="border border-gray-300 rounded p-2 w-full md:w-40 bg-white cursor-not-allowed"
                />
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Filter */}
      {selectedWallet && (
        <div className="mb-4 relative w-full md:w-1/3">
          <FaFilter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Filter by points, wallet id, or date"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 pl-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Add/Edit form */}
      {selectedWallet && !isCustomer && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {editingReward && (
              <div className="col-span-full">
                <p className="text-sm text-gray-600">
                  Editing Reward ID:{" "}
                  <span className="font-semibold">{editingReward.loyaltyPointsAwardId}</span>
                </p>
              </div>
            )}
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
              disabled={isCreating || isUpdating}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FaPlus />
              {editingReward ? (isUpdating ? "Updating..." : "Update Reward") : isCreating ? "Adding..." : "Add Reward"}
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

      {/* Rewards table */}
      {selectedWallet && filteredRewards.length > 0 ? (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Reward ID</th>
                <th className="px-4 py-2">Wallet ID</th>
                <th className="px-4 py-2">Points Rewarded</th>
                <th className="px-4 py-2">Rewarded Date</th>
                {!isCustomer && <th className="px-4 py-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRewards.map((r) => (
                <tr key={r.loyaltyPointsAwardId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{r.loyaltyPointsAwardId}</td>
                  <td className="px-4 py-2">{r.loyaltyWalletId}</td>
                  <td className="px-4 py-2">{r.loyaltyPointsRewarded}</td>
                  <td className="px-4 py-2">{new Date(r.rewardedDate).toLocaleDateString()}</td>
                  {!isCustomer && (
                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                      <button onClick={() => handleEditClick(r)} className="text-blue-500 hover:text-blue-700" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteClick(r.loyaltyPointsAwardId)} className="text-red-500 hover:text-red-700" title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedWallet && filteredRewards.length === 0 ? (
        <p className="text-gray-500 mt-4">No rewards found matching your filter.</p>
      ) : null}
    </div>
  );
}
