import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // to get ID from URL
import {
  useGetAddressesByUserIdQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from "../slices/addressesApiSlice";
import FloatingAddButton from "../components/FloatingAddButton";
import { toast } from "react-toastify";

export default function AddressesScreen() {
  const { id } = useParams(); // userID from URL
  const { data, isLoading, error, refetch } = useGetAddressesByUserIdQuery(id);
  const [addAddress] = useAddAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    label: "",
    zipcode: "",
    town: "",
    laneNo: "",
    buildingNo: "",
    floor: "",
    roomNo: "",
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (selectedAddress) {
      setFormData({ ...selectedAddress });
    }
  }, [selectedAddress]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        userID: id, // always assign URL ID
      };

      if (selectedAddress) {
        await updateAddress({ id: selectedAddress.addressID, ...payload }).unwrap();
        toast.success("Address updated successfully");
      } else {
        await addAddress(payload).unwrap();
        toast.success("Address added successfully");
      }

      setFormOpen(false);
      setSelectedAddress(null);
      setFormData({
        country: "",
        state: "",
        label: "",
        zipcode: "",
        town: "",
        laneNo: "",
        buildingNo: "",
        floor: "",
        roomNo: "",
      });

      refetch(); // refresh list
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setFormOpen(true);
  };

  const handleDelete = async (addressID) => {
    if (window.confirm("Delete this address?")) {
      try {
        await deleteAddress(addressID).unwrap();
        toast.success("Address deleted");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed");
      }
    }
  };

  if (isLoading) return <p>Loading addresses...</p>;
  if (error) return <p>Error loading addresses</p>;

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!formOpen && (
        <FloatingAddButton
          onClick={() => {
            setSelectedAddress(null);
            setFormOpen(true);
          }}
        />
      )}

      <h2 className="text-3xl font-bold mb-6 text-gray-900">Addresses</h2>

      {/* Cards container */}
      <div className="flex flex-wrap gap-6">
        {data?.addresses?.map((addr) => (
          <div
            key={addr.addressID}
            className="flex flex-col bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-blue-400 w-96"
          >
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-1 text-sm">
                <div className="flex">
                  <span className="font-semibold w-24">User ID:</span>
                  <span className="truncate">{addr.userID || "-"}</span>
                </div>

                <div className="flex">
                  <span className="font-semibold w-24">Country:</span>
                  <span className="truncate">{addr.country}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">State:</span>
                  <span className="truncate">{addr.state || "-"}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">Label:</span>
                  <span className="truncate">{addr.label || "-"}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">Zipcode:</span>
                  <span className="truncate">{addr.zipcode || "-"}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">Town:</span>
                  <span className="truncate">{addr.town || "-"}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">Lane No:</span>
                  <span className="truncate">{addr.laneNo || "-"}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">Building No:</span>
                  <span className="truncate">{addr.buildingNo || "-"}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">Floor:</span>
                  <span className="truncate">{addr.floor || "-"}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-24">Room No:</span>
                  <span className="truncate">{addr.roomNo || "-"}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition font-medium"
                  onClick={() => handleEdit(addr)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 bg-red-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-600 transition font-medium"
                  onClick={() => handleDelete(addr.addressID)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Update Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl">
            <h3 className="text-lg font-bold mb-4">
              {selectedAddress ? "Update Address" : "Add Address"}
            </h3>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleAddOrUpdate}
            >
              {[
                "country",
                "state",
                "label",
                "zipcode",
                "town",
                "laneNo",
                "buildingNo",
                "floor",
                "roomNo",
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {selectedAddress ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}