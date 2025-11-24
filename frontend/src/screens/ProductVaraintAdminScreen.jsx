import React, { useState, useMemo } from "react";
import {
  useGetProductVariantsQuery,
  useDeleteProductVariantMutation,
  useUpdateProductVariantMutation,
  useCreateProductVariantMutation,
} from "../slices/productVariantApiSlice";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../slices/categoryApiSlice";
import { useGetBrandsQuery } from "../slices/brandApiSlice";

import ProductVariantModal from "../components/ProductVariantModal.jsx";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import { FaFilter, FaTimes } from "react-icons/fa";

const ProductsVariantAdminScreen = () => {
  const [pagination, setPagination] = useState({ skip: 0, take: 8 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: variants = [],
    isLoading,
    isError,
    refetch,
  } = useGetProductVariantsQuery(pagination);
  console.log(variants);

  const { data: categories = [] } = useGetCategoriesQuery({
    skip: 0,
    take: 100,
  });

  const { data: brands = [] } = useGetBrandsQuery({
    skip: 0,
    take: 100,
  });

  const [deleteVariant] = useDeleteProductVariantMutation();
  const [updateVariant] = useUpdateProductVariantMutation();
  const [createVariant] = useCreateProductVariantMutation();

  const [modalMode, setModalMode] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

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
    if (!window.confirm("Are you sure you want to delete this variant?"))
      return;
    try {
      await deleteVariant(id).unwrap();
      refetch();
      alert("Variant deleted successfully!");
    } catch (error) {
      alert("Failed to delete variant.");
    }
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true); // start loading
    try {
      const payload = { ...formData };

      if (modalMode === "add") {
        await createVariant(payload).unwrap();
        alert("Variant created successfully!");
      } else {
        await updateVariant({
          id: currentVariant.productVariantID,
          ...payload,
        }).unwrap();
        alert("Variant updated successfully!");
      }

      refetch();
      setModalMode(null);
    } catch (error) {
      alert("Failed to save variant.");
    } finally {
      setIsSubmitting(false); // stop loading
    }
  };

  // -------------------------------------------
  // 🔍 FILTERING LOGIC
  // -------------------------------------------
  const filteredVariants = useMemo(() => {
    return variants
      .filter((v) => {
        if (!searchText.trim()) return true;
        const name = v.product?.productName?.toLowerCase() || "";
        const desc = v.description?.toLowerCase() || "";
        const id = String(v.productVariantID);

        return (
          name.includes(searchText.toLowerCase()) ||
          desc.includes(searchText.toLowerCase()) ||
          id.includes(searchText)
        );
      })
      .filter((v) => {
        if (!selectedCategory) return true;
        return v.product?.categoryID === Number(selectedCategory);
      })
      .filter((v) => {
        if (!selectedBrand) return true;
        return v.product?.brandID === Number(selectedBrand);
      });
  }, [variants, searchText, selectedCategory, selectedBrand]);

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

      <h1 className="text-4xl font-bold mb-6 text-gray-900">
        Product Variants
      </h1>

      {/* ------------------------------------------- */}
      {/* 🔍 SEARCH + FILTERS */}
      {/* ------------------------------------------- */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="relative w-64">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search variants..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border rounded-xl focus:ring focus:ring-blue-300 text-sm"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border py-2 px-3 rounded-xl text-sm w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.categoryID} value={c.categoryID}>
              {c.categoryName}
            </option>
          ))}
        </select>

        {/* Brand filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border py-2 px-3 rounded-xl text-sm w-48"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.brandID} value={b.brandID}>
              {b.brandName}
            </option>
          ))}
        </select>
      </div>

      {/* ------------------------------------------- */}
      {/* 🔥 FILTERED LIST */}
      {/* ------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredVariants.map((variant) => (
          <div
            key={variant.productVariantID}
            className="flex flex-col bg-white rounded-3xl shadow-lg overflow-hidden border hover:border-blue-400"
          >
            {/* Image */}
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <img
                src={
                  variant.product?.imageURL ||
                  "../assets/images/placeholderDress.jpg"
                }
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {variant.product?.productName}
              </h2>

              {/* View Details link under product name */}
              <Link
                to={`/productvariants/${variant.productVariantID}`}
                className="text-blue-500 hover:text-blue-600 text-sm underline mb-2"
              >
                View Details
              </Link>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {variant.description || "No description."}
              </p>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleEdit(variant)}
                  className="bg-blue-500 text-white py-2 px-3 text-sm rounded-lg flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(variant.productVariantID)}
                  className="bg-red-500 text-white py-2 px-3 text-sm rounded-lg flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredVariants.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">
            No matching variants found.
          </p>
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
          disabled={variants.length < pagination.take} // disable if fewer than page size
          className="px-4 py-2 bg-gray-300 rounded-xl disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {modalMode && (
        <ProductVariantModal
          mode={modalMode}
          variant={currentVariant}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default ProductsVariantAdminScreen;
