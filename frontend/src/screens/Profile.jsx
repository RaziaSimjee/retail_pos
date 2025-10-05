import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useGetUserByIdQuery } from "../slices/usersApiSlice";
import {
  useGetAddressesByUserIdQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from "../slices/addressesApiSlice";

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const userID = userInfo?.user?.userID?.toLowerCase();

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading, isError: profileError } =
    useGetUserByIdQuery(userID, { skip: !userID });

  // Fetch addresses
  const {
    data: addressData,
    isLoading: addressLoading,
    isError: addressError,
  } = useGetAddressesByUserIdQuery(userID, { skip: !userID });
  const addresses = addressData?.addresses || [];

  // Mutations
  const [addAddress, { isLoading: adding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();

  // Local state
  const [formState, setFormState] = useState({
    country: "",
    state: "",
    town: "",
    laneNo: "",
    buildingNo: "",
    floor: "",
    roomNo: "",
    zipcode: "",
    label: "",
    addressID: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (profileLoading) return <p className="p-6 text-gray-500">Loading profile...</p>;
  if (profileError || !profileData)
    return <p className="p-6 text-red-500">Failed to load profile.</p>;

  const { username, userRole, DOB, email, phoneNumber, description } = profileData;

  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.label || !formState.country) {
      toast.error("Label and Country are required.");
      return;
    }

    try {
      if (isEditing) {
        await updateAddress(formState).unwrap();
        toast.success("Address updated successfully!");
      } else {
        await addAddress({ ...formState, userID }).unwrap();
        toast.success("Address added successfully!");
      }
      setFormState({
        country: "",
        state: "",
        town: "",
        laneNo: "",
        buildingNo: "",
        floor: "",
        roomNo: "",
        zipcode: "",
        label: "",
        addressID: null,
      });
      setIsEditing(false);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save address.");
      console.error(err);
    }
  };

  const handleEdit = (addr) => {
    setFormState(addr);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (addressID) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(addressID).unwrap();
        toast.success("Address deleted successfully!");
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete address.");
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-7 mb-20 space-y-6">
      {/* User Profile */}
      <div >
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        <div className="space-y-2">
          <p><span className="font-semibold">Username:</span> {username}</p>
          <p><span className="font-semibold">Role:</span> {userRole}</p>
          <p><span className="font-semibold">Date of Birth:</span>{" "}
            {new Date(DOB).toLocaleDateString()}</p>
          <p><span className="font-semibold">Email:</span> {email}</p>
          <p><span className="font-semibold">Phone Number:</span> {phoneNumber}</p>
          {description && <p><span className="font-semibold">Description:</span> {description}</p>}
        </div>
      </div>

      {/* Addresses */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex justify-between items-center">
          My Addresses
          <button
            className="text-green-600 hover:underline text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Address
          </button>
        </h2>
        {addressLoading && <p className="text-gray-500">Loading addresses...</p>}
        {addressError && <p className="text-red-500">Failed to load addresses.</p>}
        {addresses.length === 0 && <p className="text-gray-500">No addresses found.</p>}

        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.addressID} className="border rounded p-3 flex justify-between items-start">
              <div>
                <p className="font-medium">{addr.label || "Address"}</p>
                <p>{addr.buildingNo}, {addr.laneNo}, {addr.town}</p>
                <p>{addr.state}, {addr.country}, {addr.zipcode}</p>
                {addr.floor && <p>Floor: {addr.floor}</p>}
                {addr.roomNo && <p>Room: {addr.roomNo}</p>}
              </div>
              <div className="flex flex-col gap-1 ml-4">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => handleEdit(addr)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => handleDelete(addr.addressID)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Add/Edit Address */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
              <h3 className="text-lg font-bold mb-4">{isEditing ? "Edit Address" : "Add New Address"}</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="label"
                  placeholder="Label *"
                  value={formState.label}
                  onChange={handleInputChange}
                  required
                  className="border rounded p-2 w-full"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country *"
                  value={formState.country}
                  onChange={handleInputChange}
                  required
                  className="border rounded p-2 w-full"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formState.state}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="Zipcode"
                    value={formState.zipcode}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <input
                    type="text"
                    name="town"
                    placeholder="Town"
                    value={formState.town}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <input
                    type="text"
                    name="laneNo"
                    placeholder="Lane No"
                    value={formState.laneNo}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <input
                    type="text"
                    name="buildingNo"
                    placeholder="Building No"
                    value={formState.buildingNo}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <input
                    type="text"
                    name="floor"
                    placeholder="Floor"
                    value={formState.floor}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <input
                    type="text"
                    name="roomNo"
                    placeholder="Room No"
                    value={formState.roomNo}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    onClick={() => { setIsModalOpen(false); setIsEditing(false); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding || updating}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    {adding || updating ? "Saving..." : isEditing ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
