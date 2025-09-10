import React, { useState, useEffect } from "react";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useGetProductSizesQuery } from "../slices/productSizeApiSlice";
import { useGetColorsQuery } from "../slices/colorApiSlice";

const ProductVariantModal = ({ mode, variant, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(variant);

  // Fetch products, sizes, and colors from API
  const { data: products } = useGetProductsQuery({ skip: 0, take: 100 });
  const { data: sizes } = useGetProductSizesQuery({ skip: 0, take: 100 });
  const { data: colors } = useGetColorsQuery({ skip: 0, take: 100 });

  useEffect(() => {
    setFormData(variant);
  }, [variant]);

  const handleChange = (key, value) => setFormData({ ...formData, [key]: value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange("imageURL", reader.result); // base64
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {mode === "add" ? "Add Variant" : "Edit Variant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Product</label>
            <select
              value={formData.productID}
              onChange={(e) => handleChange("productID", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select product</option>
              {products?.map((p) => (
                <option key={p.productID} value={p.productID}>
                  {p.productName}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Size</label>
            <select
              value={formData.productSizeID}
              onChange={(e) => handleChange("productSizeID", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select size</option>
              {sizes?.map((s) => (
                <option key={s.productSizeID} value={s.productSizeID}>
                  {s.sizeName}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Color</label>
            <select
              value={formData.productColorID}
              onChange={(e) => handleChange("productColorID", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select color</option>
              {colors?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Barcode</label>
            <input
              type="text"
              value={formData.barcode || ""}
              onChange={(e) => handleChange("barcode", e.target.value)}
              placeholder="Enter barcode"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Selling Price</label>
            <input
              type="number"
              value={formData.sellingPrice}
              onChange={(e) => handleChange("sellingPrice", Number(e.target.value))}
              placeholder="Enter price"
              className="w-full border rounded-lg px-3 py-2"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", Number(e.target.value))}
              placeholder="Enter quantity"
              className="w-full border rounded-lg px-3 py-2"
              min="0"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Variant Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border rounded-lg px-3 py-2"
            />
            {formData.imageURL && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <img
                  src={formData.imageURL}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter description"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 ${
                mode === "add" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
              } text-white rounded-lg disabled:opacity-50`}
            >
              {isLoading
                ? mode === "add"
                  ? "Creating..."
                  : "Updating..."
                : mode === "add"
                ? "Create"
                : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductVariantModal;
