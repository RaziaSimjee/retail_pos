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
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [modalMode, setModalMode] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);

  const { data = [], isLoading, isError, refetch } = useGetProductsQuery(pagination);

  const { data: categories = [] } = useGetCategoriesQuery({ skip: 0, take: 100 });
  const { data: brands = [] } = useGetBrandsQuery({ skip: 0, take: 100 });

  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [createProduct] = useCreateProductMutation();

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
      alert("Failed to save product.");
    }
  };

  // 🔍 FILTER PRODUCTS
  const filteredProducts = useMemo(() => {
    return data.filter((p) => {
      const matchesSearch =
        !searchText ||
        p.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        String(p.productID).includes(searchText);

      const matchesBrand =
        !selectedBrand || p.brandID === Number(selectedBrand);

      const matchesCategory =
        !selectedCategory || p.categoryID === Number(selectedCategory);

      return matchesSearch && matchesBrand && matchesCategory;
    });
  }, [data, searchText, selectedBrand, selectedCategory]);

  if (isLoading)
    return <p className="text-center mt-4 text-gray-400">Loading products...</p>;
  if (isError)
    return <p className="text-center mt-4 text-red-500">Failed to load products</p>;

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-4 text-gray-900">Products</h1>

      {/* 🔽 FILTER BAR */}
      <div className="flex flex-wrap gap-4 mb-6">

        {/* 🔍 Search */}
        <div className="relative w-full max-w-xs">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, description, or ID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* 🏷 BRAND FILTER */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="">All Brands</option>
          {brands?.map((b) => (
            <option key={b.brandID} value={b.brandID}>
              {b.brandName}
            </option>
          ))}
        </select>

        {/* 📂 CATEGORY FILTER */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c.categoryID} value={c.categoryID}>
              {c.categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* 🛍 PRODUCT GRID */}
      <div className="flex flex-wrap justify-start gap-6">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 w-full text-center">No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.productID}
              className="flex flex-col bg-white rounded-3xl shadow-lg border overflow-hidden hover:border-blue-400 transition p-0"
              style={{ width: "250px" }}
            >
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={product.imageURL || "../assets/images/placeholderDress.jpg"}
                  alt={product.productName}
                  onError={(e) => (e.target.src = "../assets/images/placeholderDress.jpg")}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex justify-between items-center">
                    <span>{product.productName}</span>
                    <span className="text-sm text-gray-400">ID: {product.productID}</span>
                  </h2>

                  <Link
                    to={`/products/${product.productID}`}
                    className="text-blue-500 hover:text-blue-600 text-sm underline mt-1 inline-block"
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
                    className="flex-1 bg-blue-500 text-white py-2 text-sm rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.productID)}
                    className="flex-1 bg-red-500 text-white py-2 text-sm rounded-lg hover:bg-red-600"
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
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  );
};

export default ProductsAdminScreen;
