import React, { useState } from "react";
import {
  useGetProductVariantsQuery,
  useDeleteProductVariantMutation,
  useUpdateProductVariantMutation,
  useCreateProductVariantMutation,
} from "../slices/productVariantApiSlice";
import ProductVariantModal from "../components/ProductVaraintModal.jsx";
import FloatingAddButton from "../components/FloatingAddButton.jsx";

const ProductsVariantAdminScreen = () => {
  const { data: variants, isLoading, isError, refetch } = useGetProductVariantsQuery({ skip: 0, take: 100 });

  const [deleteVariant, { isLoading: isDeleting }] = useDeleteProductVariantMutation();
  const [updateVariant, { isLoading: isUpdating }] = useUpdateProductVariantMutation();
  const [createVariant, { isLoading: isCreating }] = useCreateProductVariantMutation();

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [currentVariant, setCurrentVariant] = useState(null);

  const emptyVariant = {
    productID: 0,
    productSizeID: 0,
    productColorID: 0,
    barcode: "",
    sellingPrice: 0,
    quantity: 0,
    imageURL: "",
    description: "",
  };

  const handleAdd = () => {
    setCurrentVariant(emptyVariant);
    setModalMode("add");
  };

  const handleEdit = (variant) => {
    setCurrentVariant(variant);
    setModalMode("edit");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      try {
        await deleteVariant(id).unwrap();
        refetch();
        alert("Variant deleted successfully!");
      } catch (error) {
        console.error("Failed to delete variant:", error);
        alert("Failed to delete variant.");
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await createVariant(formData).unwrap();
        alert("Variant created successfully!");
      } else {
        await updateVariant({ id: currentVariant.id, ...formData }).unwrap();
        alert("Variant updated successfully!");
      }
      refetch();
      setModalMode(null);
    } catch (error) {
      console.error("Failed to save variant:", error);
      alert("Failed to save variant.");
    }
  };

  if (isLoading) return <p className="text-center mt-4 text-gray-400">Loading variants...</p>;
  if (isError) return <p className="text-center mt-4 text-red-500">Failed to load variants</p>;

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-8 text-gray-900">Product Variants</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {variants?.map((variant) => (
          <div
            key={variant.id}
            className="flex flex-col bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-blue-400"
          >
            {/* Image */}
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={variant.imageURL || "https://via.placeholder.com/300x200"}
                alt={variant.product?.productName || "Variant"}
                onError={(e) => (e.target.src = "https://via.placeholder.com/300x200")}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* Variant Name */}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {variant.product?.productName || "Unnamed Product"}
                </h2>
                <p className="text-gray-600 mt-1">
                  Size: {variant.productSize?.sizeName || "N/A"}
                </p>
                <p className="text-gray-800 font-semibold mt-1">
                  Price: ${variant.sellingPrice.toFixed(2)}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(variant)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(variant.id)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              <div className="flex gap-2 mt-2">
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 text-sm rounded-lg hover:bg-gray-300 transition font-medium">
                  View Details
                </button>
                <button className="flex-1 bg-green-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-green-600 transition font-medium">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalMode && (
        <ProductVariantModal
          mode={modalMode}
          variant={currentVariant}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isLoading={modalMode === "add" ? isCreating : isUpdating}
        />
      )}
    </div>
  );
};

export default ProductsVariantAdminScreen;
