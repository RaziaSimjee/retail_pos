import React, { useState } from "react";
import {
  useGetProductVariantsQuery,
  useDeleteProductVariantMutation,
  useUpdateProductVariantMutation,
  useCreateProductVariantMutation,
} from "../slices/productVariantApiSlice";
import ProductVariantModal from "../components/ProductVariantModal.jsx";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import { FaFilter, FaTimes } from "react-icons/fa";

const ProductsVariantAdminScreen = () => {
  const {
    data: variants,
    isLoading,
    isError,
    refetch,
  } = useGetProductVariantsQuery({ skip: 0, take: 100 });

  const [deleteVariant, { isLoading: isDeleting }] =
    useDeleteProductVariantMutation();
  const [updateVariant, { isLoading: isUpdating }] =
    useUpdateProductVariantMutation();
  const [createVariant, { isLoading: isCreating }] =
    useCreateProductVariantMutation();

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
    const [searchText, setSearchText] = useState("");
  const [currentVariant, setCurrentVariant] = useState(null);

  const emptyVariant = {
    productID: 0,
    productSizeID: 0,
    productColorID: 0,
    barcode: "",
    barCodeImage: "",
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
    // Prepare payload for backend
    const payload = {
      productID: formData.productID,
      productSizeID: formData.productSizeID,
      productColorID: formData.productColorID,
      barcode: formData.barcode,
      barCodeImage: formData.barCodeImage,
      sellingPrice: formData.sellingPrice,
      quantity: formData.quantity,
      imageURL: formData.imageURL,
      description: formData.description,
    };

    if (modalMode === "add") {
      await createVariant(payload).unwrap();
      alert("Variant created successfully!");
    } else {
      await updateVariant({
        id: currentVariant.productVariantID, // <- use correct ID
        ...payload,
      }).unwrap();
      alert("Variant updated successfully!");
    }

    refetch();
    setModalMode(null);
  } catch (error) {
    console.error("Failed to save variant:", error);
    alert("Failed to save variant.");
  }
};


  if (isLoading)
    return (
      <p className="text-center mt-6 text-gray-400">Loading variants...</p>
    );
  if (isError)
    return (
      <p className="text-center mt-6 text-red-500">Failed to load variants</p>
    );

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Product Variants
      </h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {variants?.map((variant) => (
          <div
            key={variant.productVariantID}
            className="flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-200 hover:border-blue-400"
          >
            {/* Image */}
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={
                  variant.product.imageURL || "../assets/images/placeholderDress.jpg"
                }
                alt={variant.product?.productName || "Variant"}
                onError={(e) =>
                  (e.target.src = "../assets/images/placeholderDress.jpg")
                }
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {variant.product?.productName || "Unnamed Product"}
              </h2>

              <a
                href={`/productVariants/${variant.productVariantID}`}
                className="text-blue-600 underline text-sm font-medium mb-3"
              >
                View Details
              </a>

              <p className="text-gray-600 text-sm flex-1 mb-4 line-clamp-2">
                {variant.description || "No description available."}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(variant)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(variant.productVariantID)}
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
