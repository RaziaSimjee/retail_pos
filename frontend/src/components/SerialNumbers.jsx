import React, { useState, useMemo } from "react";
import {
  useGetAllSerialNumbersQuery,
  useCreateSerialNumbersMutation,
  useUpdateSerialNumbersMutation,
  useDeleteSerialNumbersMutation,
  useGetProductVariantsQuery,
} from "../slices/productVariantApiSlice";
import {
  FaSpinner,
  FaTrash,
  FaEdit,
  FaTimes,
  FaFilter,
} from "react-icons/fa";

const SerialNumbers = () => {
  // Pagination state
  const [pagination, setPagination] = useState({ skip: 0, take: 100 });

  // Fetch serial numbers
  const {
    data: serialNumbers = [],
    isLoading,
    isError,
    error,
  } = useGetAllSerialNumbersQuery(pagination);

  // Fetch product variants for dropdown
  const { data: productVariants = [], isLoading: variantsLoading } =
    useGetProductVariantsQuery();

  // Mutations
  const [createSerialNumber] = useCreateSerialNumbersMutation();
  const [updateSerialNumber] = useUpdateSerialNumbersMutation();
  const [deleteSerialNumber] = useDeleteSerialNumbersMutation();

  // Form state
  const [form, setForm] = useState({
    productVariantID: "",
    serialNumber: "",
  });

  // Editing state
  const [editingSerial, setEditingSerial] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [filterText, setFilterText] = useState("");

  /** Handle form input changes */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /** Reset form */
  const handleCancel = () => {
    setForm({ productVariantID: "", serialNumber: "" });
    setEditingSerial(null);
  };

  /** Create or Update serial number */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingSerial) {
        await updateSerialNumber({
          id: editingSerial.productSerialNumberID,
          productVariantID: form.productVariantID,
          serialNumber: form.serialNumber,
        }).unwrap();
      } else {
        await createSerialNumber(form).unwrap();
      }
      handleCancel();
    } catch (err) {
      console.error("Save failed:", err);
      alert(err?.data?.message || "Failed to save serial number!");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Delete serial number */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this serial number?"))
      return;
    try {
      await deleteSerialNumber(id).unwrap();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.data?.message || "Failed to delete serial number!");
    }
  };

  /** Start editing a row */
  const handleEdit = (sn) => {
    setEditingSerial(sn);
    setForm({
      productVariantID: sn.productVariantID,
      serialNumber: sn.serialNumber,
    });
  };

  /** Filter serial numbers by productVariantID or any other primitive field */
  const filteredSerialNumbers = useMemo(() => {
    if (!filterText.trim()) return serialNumbers;

    const lowercasedFilter = filterText.toLowerCase();

    return serialNumbers.filter((sn) =>
      Object.entries(sn).some(([key, value]) => {
        if (typeof value === "string" || typeof value === "number") {
          return String(value).toLowerCase().includes(lowercasedFilter);
        }
        return false;
      })
    );
  }, [serialNumbers, filterText]);

  /** Loading state */
  if (isLoading || variantsLoading) {
    return (
      <p className="text-center mt-8 text-gray-400 text-lg animate-pulse">
        Loading serial numbers...
      </p>
    );
  }

  /** Error state */
  if (isError) {
    return (
      <p className="text-center mt-8 text-red-500 text-lg font-semibold">
        Failed to load serial numbers:{" "}
        {error?.data?.message || error?.error || "Unknown error"}
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Manage Serial Numbers
      </h1>

      {/* Filter Section */}
      <div className="relative mb-6 w-64">
        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Filter by Variant ID or other..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full pl-10 pr-8 py-1 border rounded-lg focus:ring focus:ring-blue-300 text-sm"
        />
        {filterText && (
          <button
            onClick={() => setFilterText("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            title="Clear Filter"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 mb-8 p-4 border rounded-xl bg-gray-50"
      >
        {/* Product Variant Dropdown */}
        <select
          name="productVariantID"
          value={form.productVariantID}
          onChange={handleChange}
          required
          className="p-2 border rounded-lg focus:ring focus:ring-blue-300"
        >
          <option value="">Select Product Variant</option>
          {productVariants?.map((variant) => (
            <option
              key={variant.productVariantID}
              value={variant.productVariantID}
            >
              {variant.productVariantID} -{" "}
              {variant.product?.productName || "Unnamed Product"}
            </option>
          ))}
        </select>

        {/* Serial Number Input */}
        <input
          type="text"
          name="serialNumber"
          placeholder="Serial Number"
          value={form.serialNumber}
          onChange={handleChange}
          required
          className="p-2 border rounded-lg focus:ring focus:ring-blue-300"
        />

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              editingSerial
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-300`}
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin w-4 h-4" />
            ) : editingSerial ? (
              "Update"
            ) : (
              "Add"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Serial Numbers Table */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-700">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Product Variant ID</th>
              <th className="p-3 border">Serial Number</th>
              <th className="p-3 border">Created At</th>
              <th className="p-3 border">Updated At</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSerialNumbers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No serial numbers found.
                </td>
              </tr>
            ) : (
              filteredSerialNumbers.map((sn) => (
                <tr key={sn.productSerialNumberID} className="hover:bg-gray-50">
                  <td className="p-3 border">{sn.productSerialNumberID}</td>
                  <td className="p-3 border">{sn.productVariantID}</td>
                  <td className="p-3 border">{sn.serialNumber}</td>
                  <td className="p-3 border">
                    {new Date(sn.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border">
                    {new Date(sn.updatedAt).toLocaleString()}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(sn)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sn.productSerialNumberID)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              skip: Math.max(prev.skip - prev.take, 0),
            }))
          }
          disabled={pagination.skip === 0}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              skip: prev.skip + prev.take,
            }))
          }
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SerialNumbers;
