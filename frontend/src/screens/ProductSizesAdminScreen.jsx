import React, { useState, useMemo } from "react";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import {
  useGetProductSizesQuery,
  useCreateProductSizeMutation,
  useUpdateProductSizeMutation,
  useDeleteProductSizeMutation,
} from "../slices/productSizeApiSlice.js";
import ProductSizeModal from "../components/ProductSizeModal.jsx";
import { FaFilter, FaTimes } from "react-icons/fa";

const ProductSizesAdminScreen = () => {
  const [pagination, setPagination] = useState({ skip: 0, take: 3 });
  const [searchText, setSearchText] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [currentSize, setCurrentSize] = useState(null);

  const { data = [], isLoading, isError, refetch } = useGetProductSizesQuery(
    pagination
  );

  const [deleteSize, { isLoading: isDeleting }] = useDeleteProductSizeMutation();
  const [updateSize, { isLoading: isUpdating }] = useUpdateProductSizeMutation();
  const [createSize, { isLoading: isCreating }] = useCreateProductSizeMutation();

  const emptySize = {
    sizeName: "",
    imageURL: "",
    minRange: 0,
    maxRange: 0,
    region: "",
    measurementUnit: "",
    description: "",
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this size?")) return;
    try {
      await deleteSize({ id }).unwrap();
      refetch();
      alert("Size deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete size.");
    }
  };

  const handleEdit = (size) => {
    setCurrentSize(size);
    setModalMode("edit");
  };

  const handleAdd = () => {
    setCurrentSize(emptySize);
    setModalMode("add");
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await createSize(formData).unwrap();
        alert("Size created successfully!");
      } else {
        await updateSize({ id: currentSize.sizeID, ...formData }).unwrap();
        alert("Size updated successfully!");
      }
      refetch();
      setModalMode(null);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save size.");
    }
  };

  // Filter sizes by search text
  const filteredSizes = useMemo(() => {
    if (!searchText.trim()) return data;
    return data.filter(
      (s) =>
        s.sizeName?.toLowerCase().includes(searchText.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        String(s.sizeID).includes(searchText)
    );
  }, [data, searchText]);

  if (isLoading)
    return <p className="text-center mt-4 text-gray-400">Loading sizes...</p>;
  if (isError)
    return <p className="text-center mt-4 text-red-500">Failed to load sizes</p>;

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-6 text-gray-900">Product Sizes</h1>

      {/* Search Field */}
      <div className="relative w-full max-w-xs mb-6">
        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, description, or ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-10 pr-8 py-2 border rounded-xl focus:ring focus:ring-blue-300 focus:outline-none text-sm"
        />
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Size Cards */}
      <div className="flex flex-wrap justify-start gap-6">
        {filteredSizes.length === 0 ? (
          <p className="text-gray-500 w-full text-center">No sizes found.</p>
        ) : (
          filteredSizes.map((size) => (
            <div
              key={size.sizeID}
              className="flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-200 hover:border-blue-400"
              style={{ width: "250px" }}
            >
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={size.imageURL || "https://via.placeholder.com/300x200"}
                  alt={size.sizeName}
                  onError={(e) => {
                    if (e.target.src !== "https://via.placeholder.com/300x200") {
                      e.target.src = "https://via.placeholder.com/300x200";
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex justify-between items-center">
                    <span>{size.sizeName}</span>
                    <span className="text-sm font-thin text-gray-400">
                      ID: {size.sizeID}
                    </span>
                  </h2>

                  <a
                    href={`/productsizes/${size.sizeID}`}
                    className="text-blue-500 hover:text-blue-600 text-sm mt-1 inline-block underline"
                  >
                    View Details
                  </a>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {size.description}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(size)}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(size.sizeID)}
                    disabled={isDeleting}
                    className="flex-1 bg-red-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              skip: Math.max(prev.skip - prev.take, 0),
            }))
          }
          disabled={pagination.skip === 0}
          className="px-4 py-2 bg-gray-300 rounded-xl disabled:opacity-50"
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
          className="px-4 py-2 bg-gray-300 rounded-xl"
        >
          Next
        </button>
      </div>

      {modalMode && (
        <ProductSizeModal
          mode={modalMode}
          size={currentSize}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isLoading={modalMode === "add" ? isCreating : isUpdating}
        />
      )}
    </div>
    
  );
};

export default ProductSizesAdminScreen;
