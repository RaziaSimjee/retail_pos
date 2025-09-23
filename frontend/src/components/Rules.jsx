import React, { useState, useMemo } from "react";
import {
  useGetAllLoyaltyRulesQuery,
  useCreateLoyaltyRuleMutation,
  useUpdateLoyaltyRuleMutation,
  useDeleteLoyaltyRuleMutation,
} from "../slices/loyaltyProgramApiSlice";
import { FaEdit, FaTrash, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Rules = () => {
  const {
    data: rules,
    isLoading,
    refetch,
  } = useGetAllLoyaltyRulesQuery({ skip: 0, take: 100 });

  const [createRule] = useCreateLoyaltyRuleMutation();
  const [updateRule] = useUpdateLoyaltyRuleMutation();
  const [deleteRule] = useDeleteLoyaltyRuleMutation();

  const [formState, setFormState] = useState({
    minAmount: "",
    maxAmount: "",
    awardPoints: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Filter state
  const [filter, setFilter] = useState("");

  const handleEdit = (rule) => {
    setFormState({
      minAmount: rule.minAmount,
      maxAmount: rule.maxAmount,
      awardPoints: rule.awardPoints,
    });
    setEditingId(rule.loyaltyPointRewardRuleId);
  };

  const resetForm = () => {
    setFormState({ minAmount: "", maxAmount: "", awardPoints: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { minAmount, maxAmount, awardPoints } = formState;

    // Validation
    if (minAmount <= 0) {
      toast.error("Min Amount must be greater than 0");
      return;
    }
    if (maxAmount < minAmount) {
      toast.error("Max Amount cannot be less than Min Amount");
      return;
    }
    if (awardPoints < 0) {
      toast.error("Award Points cannot be negative");
      return;
    }

    try {
      if (editingId) {
        await updateRule({ id: editingId, ...formState }).unwrap();
        toast.success("Rule updated successfully!");
      } else {
        await createRule(formState).unwrap();
        toast.success("Rule created successfully!");
      }
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save rule");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      try {
        await deleteRule(id).unwrap();
        toast.success("Rule deleted successfully!");
        refetch();
      } catch (err) {
        console.error("Error deleting rule:", err);
        const message = err?.data?.message || "Failed to delete rule";
        toast.error(message);
      }
    }
  };

  // Filtered rules logic
  const filteredRules = useMemo(() => {
    if (!filter.trim()) return rules || [];
    return (rules || []).filter((rule) => {
      const search = filter.toLowerCase();
      return (
        rule.loyaltyPointRewardRuleId.toString().includes(search) ||
        rule.minAmount.toString().includes(search) ||
        rule.maxAmount.toString().includes(search)
      );
    });
  }, [rules, filter]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loyalty Point Reward Rules</h1>

      {/* Filter Input */}
      <div className="mb-4 relative w-full md:w-1/3">
        <FaFilter
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={16}
        />
        <input
          type="text"
          placeholder="Filter by ID, Min Amount, or Max Amount"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 pl-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white p-4 rounded shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Min Amount</label>
            <input
              type="number"
              value={formState.minAmount}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  minAmount: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Max Amount</label>
            <input
              type="number"
              value={formState.maxAmount}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  maxAmount: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Award Points</label>
            <input
              type="number"
              value={formState.awardPoints}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  awardPoints: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update Rule" : "Create Rule"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-400 px-4 py-2 text-white hover:bg-gray-500 rounded"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        {isLoading ? (
          <p className="p-4 text-gray-500">Loading rules...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Award Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No rules found
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.loyaltyPointRewardRuleId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.loyaltyPointRewardRuleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.minAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.maxAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.awardPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(rule.loyaltyPointRewardRuleId)
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Rules;
