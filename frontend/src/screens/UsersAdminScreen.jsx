import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import {
  useGetUsersByRoleQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRegisterMutation,
} from "../slices/usersApiSlice.js";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function UsersAdminScreen() {
  const { role } = useParams();
  const { data, error, isLoading, refetch } = useGetUsersByRoleQuery(role);

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [registerUser] = useRegisterMutation();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userRole: role,
    DOB: "",
    phoneNumber: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState({
    phoneNumber: "",
    DOB: "",
    password: "",
    confirmPassword: "",
  });

  // =========================
  // Helpers
  // =========================
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      userRole: role,
      DOB: "",
      phoneNumber: "",
      description: "",
    });
    setFormErrors({
      phoneNumber: "",
      DOB: "",
      password: "",
      confirmPassword: "",
    });
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,12}$/;

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      userRole: user.userRole,
      DOB: user.DOB ? user.DOB.split("T")[0] : "",
      phoneNumber: user.phoneNumber || "",
      description: user.description || "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({
      phoneNumber: "",
      DOB: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
        toast.success("User deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate phone number
    if (name === "phoneNumber") {
      const phoneRegex = /^\+?[0-9]*$/;
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: phoneRegex.test(value)
          ? ""
          : "Phone number must contain only numbers and an optional leading +",
      }));
    }

    // Validate DOB
    if (name === "DOB") {
      if (value) {
        const dob = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

        setFormErrors((prev) => ({
          ...prev,
          DOB: age < 18 ? "User must be at least 18 years old" : "",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          DOB: "Please enter a valid date",
        }));
      }
    }

    if (name === "password") {
      setFormErrors((prev) => ({
        ...prev,
        password: passwordRegex.test(value)
          ? ""
          : "Password must be 8-12 characters and include uppercase, lowercase, number, and special character.",
        confirmPassword:
          formData.confirmPassword && value !== formData.confirmPassword
            ? "Passwords do not match."
            : "",
      }));
    }

    if (name === "confirmPassword") {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.password ? "Passwords do not match." : "",
      }));
    }
  };

  // =========================
  // SUBMIT HANDLERS
  // =========================

  // Update user
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (formErrors.phoneNumber || formErrors.DOB) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      await updateUser({ id: selectedUser.userID, ...formData }).unwrap();
      toast.success("User updated successfully");
      setSelectedUser(null);
      refetch();
    } catch (err) {
      console.error("Update user error:", err);

      if (err?.data?.code === 11000) {
        toast.error(
          "A user with this email already exists. Please use a different email."
        );
      } else if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Register new user
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (formErrors.phoneNumber || formErrors.DOB) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      await registerUser(formData).unwrap();
      toast.success("User registered successfully");
      resetForm();
      setShowAddModal(false);
      refetch();
    } catch (err) {
      console.error("Register user error:", err);

      if (err?.data?.code === 11000) {
        toast.error(
          "A user with this email already exists. Please use a different email."
        );
      } else if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 capitalize">{role} Users</h2>

      {/* Users Table */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">Username</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Role</th>
            <th className="py-2 px-4 border">DOB</th>
            <th className="py-2 px-4 border">Phone</th>
            <th className="py-2 px-4 border">Description</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.users?.map((user) => (
            <tr key={user.userID} className="text-center">
              <td className="py-2 px-4 border">{user.username}</td>
              <td className="py-2 px-4 border">{user.email}</td>
              <td className="py-2 px-4 border">{user.userRole}</td>
              <td className="py-2 px-4 border">
                {user.DOB ? new Date(user.DOB).toLocaleDateString() : "-"}
              </td>
              <td className="py-2 px-4 border">{user.phoneNumber || "-"}</td>
              <td className="py-2 px-4 border">{user.description || "-"}</td>
              <td className="py-2 px-4 border flex justify-center items-center space-x-2">
                <button
                  onClick={() => handleEditClick(user)}
                  className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteClick(user.userID)}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
                <Link
                  to={`/addresses/${user.userID}`}
                  className="text-green-600 underline hover:text-green-800"
                >
                  View Addresses
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setShowAddModal(true)} />

      {/* =========================
     ADD USER MODAL (Single-column, scrollable)
========================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Add New User
            </h3>
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col relative">
                <label className="mb-1 font-medium">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </span>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col relative">
                <label className="mb-1 font-medium">Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <AiOutlineEye />
                  ) : (
                    <AiOutlineEyeInvisible />
                  )}
                </span>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Role</label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>

              {/* DOB */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">DOB</label>
                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    formErrors.DOB ? "border-red-500" : ""
                  }`}
                  required
                />
                {formErrors.DOB && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.DOB}</p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    formErrors.phoneNumber ? "border-red-500" : ""
                  }`}
                  required
                />
                {formErrors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
     EDIT USER MODAL (Single-column, scrollable)
========================== */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Edit User</h3>
            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col relative">
                <label className="mb-1 font-medium">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                />
                <span
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col relative">
                <label className="mb-1 font-medium">Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                />
                <span
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <AiOutlineEye />
                  ) : (
                    <AiOutlineEyeInvisible />
                  )}
                </span>
              </div>

              {/* Role */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Role</label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>

              {/* DOB */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">DOB</label>
                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
