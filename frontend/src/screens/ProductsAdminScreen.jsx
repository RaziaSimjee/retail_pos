import React, { useState } from "react";
import { Link } from "react-router-dom";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useCreateProductMutation,
} from "../slices/productApiSlice.js";
import { useGetCategoriesQuery } from "../slices/categoryApiSlice.js";
import { useGetBrandsQuery } from "../slices/brandApiSlice.js";
import ProductModal from "../components/ProductModal.jsx";

const ProductsAdminScreen = () => {
  const { data, isLoading, isError, refetch } = useGetProductsQuery({
    skip: 0,
    take: 100,
  });

  const { data: categories } = useGetCategoriesQuery({ skip: 0, take: 100 });
  const { data: brands } = useGetBrandsQuery({ skip: 0, take: 100 });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [currentProduct, setCurrentProduct] = useState(null);

  const emptyProduct = {
    productName: "",
    imageURL: "",
    categoryID: 0,
    brandID: 0,
    description: "",
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ id }).unwrap();
        refetch();
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Failed to delete the product:", error);
        alert("Failed to delete the product.");
      }
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setModalMode("edit");
  };

  const handleAdd = () => {
    setCurrentProduct(emptyProduct);
    setModalMode("add");
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await createProduct(formData).unwrap();
        alert("Product created successfully!");
      } else {
        await updateProduct({ id: currentProduct.productID, ...formData }).unwrap();
        alert("Product updated successfully!");
      }
      refetch();
      setModalMode(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  if (isLoading)
    return <p className="text-center mt-4 text-gray-400">Loading products...</p>;
  if (isError)
    return <p className="text-center mt-4 text-red-500">Failed to load products</p>;

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-8 text-gray-900">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.map((product) => (
          <div
            key={product.productID}
            className="flex flex-col bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-blue-400"
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={product.imageURL || "https://via.placeholder.com/300x200"}
                alt={product.productName}
                onError={(e) => (e.target.src = "https://via.placeholder.com/300x200")}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex justify-between items-center">{product.productName}
                  <span className="text-sm font-thin text-gray-400">ID: {product.productID}</span>
                </h2>

                {/* ✅ Client-side navigation */}
                <Link
                  to={`/products/${product.productID}`}
                  className="text-blue-500 hover:text-blue-600 text-sm mt-1 inline-block underline"
                >
                  View Details
                </Link>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.productID)}
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
        <ProductModal
          mode={modalMode}
          product={currentProduct}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isLoading={modalMode === "add" ? isCreating : isUpdating}
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  );
};

export default ProductsAdminScreen;
