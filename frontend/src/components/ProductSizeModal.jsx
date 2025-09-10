import React, { useState, useEffect } from "react";

const ProductSizeModal = ({ mode, size, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    sizeName: "",
    imageURL: "",
    minRange: 0,
    maxRange: 0,
    region: "",
    measurementUnit: "",
    description: "",
  });

  useEffect(() => {
    if (size) setFormData(size);
  }, [size]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFormData({ ...formData, imageURL: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {mode === "add" ? "Add Size" : "Edit Size"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Size Name */}
          <div>
            <label className="block text-sm font-medium">Size Name</label>
            <input
              type="text"
              name="sizeName"
              value={formData.sizeName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium">Upload Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="w-full mt-1"
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

          {/* Min & Max Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Min Range</label>
              <input
                type="number"
                name="minRange"
                value={formData.minRange}
                onChange={handleNumberChange}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Max Range</label>
              <input
                type="number"
                name="maxRange"
                value={formData.maxRange}
                onChange={handleNumberChange}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                required
              />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          {/* Measurement Unit */}
          <div>
            <label className="block text-sm font-medium">Measurement Unit</label>
            <input
              type="text"
              name="measurementUnit"
              value={formData.measurementUnit}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? (mode === "add" ? "Creating..." : "Updating...") : mode === "add" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductSizeModal;
