import React, { useState, useEffect } from "react";

const ProductModal = ({ mode, product, onClose, onSubmit, isLoading, categories, brands }) => {
  const [formData, setFormData] = useState(product);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const handleChange = (key, value) => setFormData({ ...formData, [key]: value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("imageURL", reader.result); // convert to base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-bold mb-4">
          {mode === "add" ? "Add Product" : "Edit Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Product Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              placeholder="Enter product name"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border rounded-lg px-3 py-2"
            />
            {formData.imageURL && (
              <div className="mt-3">
                <img
                  src={formData.imageURL}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <select
              value={formData.categoryID}
              onChange={(e) => handleChange("categoryID", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat.categoryID} value={cat.categoryID}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Select */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Brand</label>
            <select
              value={formData.brandID}
              onChange={(e) => handleChange("brandID", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select brand</option>
              {brands?.map((b) => (
                <option key={b.brandID} value={b.brandID}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter product description"
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

export default ProductModal;
