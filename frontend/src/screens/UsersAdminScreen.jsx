import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import UserForm from "../components/UserForm.jsx";
import {
  useGetUsersByRoleQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRegisterMutation,
} from "../slices/usersApiSlice.js";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function UsersAdminScreen() {
  const { role } = useParams();
  const { data, error, isLoading, refetch } = useGetUsersByRoleQuery(role);

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [registerUser] = useRegisterMutation();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAddSubmit = async (formData) => {
    setLoadingAction(true);
    try {
      const res = await registerUser(formData).unwrap();
      toast.success("User registered successfully");
      console.log(res)
      setShowAddModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add user");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateSubmit = async (formData) => {
    setLoadingAction(true);
    try {
      await updateUser({ id: selectedUser.userID, ...formData }).unwrap();
      toast.success("User updated successfully");
      setSelectedUser(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update user");
    } finally {
      setLoadingAction(false);
    }
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
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
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

      <FloatingAddButton onClick={() => setShowAddModal(true)} />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Add New User</h3>
            <UserForm
              role={role}
              onSubmit={handleAddSubmit}
              onCancel={() => setShowAddModal(false)}
              isLoading={loadingAction}
              submitText="Add"
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Edit User</h3>
            <UserForm
              role={role}
              initialData={{
                username: selectedUser.username,
                email: selectedUser.email,
                userRole: selectedUser.userRole,
                DOB: selectedUser.DOB ? selectedUser.DOB.split("T")[0] : "",
                phoneNumber: selectedUser.phoneNumber || "",
                description: selectedUser.description || "",
              }}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setSelectedUser(null)}
              isLoading={loadingAction}
              submitText="Update"
            />
          </div>
        </div>
      )}
    </div>
  );
}