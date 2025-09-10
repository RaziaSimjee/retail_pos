import React, { useState } from "react";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import {
  useGetProductSizesQuery,
  useCreateProductSizeMutation,
  useUpdateProductSizeMutation,
  useDeleteProductSizeMutation,
} from "../slices/productSizeApiSlice.js";
import ProductSizeModal from "../components/ProductSizeModal.jsx";

const ProductSizesAdminScreen = () => {
  const { data, isLoading, isError, refetch } = useGetProductSizesQuery({
    skip: 0,
    take: 100,
  });

  const [deleteSize, { isLoading: isDeleting }] = useDeleteProductSizeMutation();
  const [updateSize, { isLoading: isUpdating }] = useUpdateProductSizeMutation();
  const [createSize, { isLoading: isCreating }] = useCreateProductSizeMutation();

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [currentSize, setCurrentSize] = useState(null);

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

  if (isLoading)
    return <p className="text-center mt-4 text-gray-400">Loading sizes...</p>;
  if (isError)
    return <p className="text-center mt-4 text-red-500">Failed to load sizes</p>;

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-6 text-gray-900">Sizes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.map((size) => (
          <div
            key={size.sizeID}
            className="flex flex-col bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden border-2 border-gray-200 hover:border-blue-400"
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={size.imageURL || "https://via.placeholder.com/300x200"}
                alt={size.sizeName}
                onError={(e) => {
                  if (e.target.src !== "https://via.placeholder.com/300x200")
                    e.target.src = "https://via.placeholder.com/300x200";
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex justify-between items-center">{size.sizeName}
                    <span className="text-sm font-thin text-gray-400">ID: {size.sizeID}</span>
                </h2>

                {/* ✅ View Details link below sizeName */}
                <a
                  href={`/productsizes/${size.sizeID}`}
                  className="text-blue-500 hover:text-blue-600 text-sm mt-1 inline-block underline"
                >
                  View Details
                </a>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{size.description}</p>
              </div>

              <div className="flex gap-2 mt-3">
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
        ))}
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
