import React, { useState, useMemo } from "react";
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
import { FaFilter, FaTimes } from "react-icons/fa";

const ProductsAdminScreen = () => {
  const [pagination, setPagination] = useState({ skip: 0, take: 8 });
  const [searchText, setSearchText] = useState("");
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [currentProduct, setCurrentProduct] = useState(null);

  const { data = [], isLoading, isError, refetch } = useGetProductsQuery(
    pagination
  );

  const { data: categories } = useGetCategoriesQuery({ skip: 0, take: 100 });
  const { data: brands } = useGetBrandsQuery({ skip: 0, take: 100 });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const emptyProduct = {
    productName: "",
    imageURL: "",
    categoryID: 0,
    brandID: 0,
    description: "",
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct({ id }).unwrap();
      refetch();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product.");
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
      console.error("Save failed:", error);
      alert("Failed to save product.");
    }
  };

  // Filter products by search text
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return data;
    return data.filter(
      (p) =>
        p.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        String(p.productID).includes(searchText)
    );
  }, [data, searchText]);

  if (isLoading)
    return <p className="text-center mt-4 text-gray-400">Loading products...</p>;
  if (isError)
    return <p className="text-center mt-4 text-red-500">Failed to load products</p>;

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-6 text-gray-900">Products</h1>

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

      {/* Product Cards */}
      <div className="flex flex-wrap justify-start gap-6">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 w-full text-center">No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.productID}
              className="flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-200 hover:border-blue-400"
              style={{ width: "250px" }}
            >
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={product.imageURL || "https://via.placeholder.com/300x200"}
                  alt={product.productName}
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
                    <span>{product.productName}</span>
                    <span className="text-sm font-thin text-gray-400">
                      ID: {product.productID}
                    </span>
                  </h2>

                  <Link
                    to={`/products/${product.productID}`}
                    className="text-blue-500 hover:text-blue-600 text-sm mt-1 inline-block underline"
                  >
                    View Details
                  </Link>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
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
