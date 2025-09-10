import React from "react";
import { useParams } from "react-router-dom";
import { useGetProductSizeByIdQuery } from "../slices/productSizeApiSlice.js";
import GoBackLink from "./GoBackLink.jsx";

const ProductSizeDetails = () => {
  const { id } = useParams();
  const { data: size, isLoading, isError } = useGetProductSizeByIdQuery(id);

  if (isLoading)
    return (
      <p className="text-center mt-8 text-gray-400 text-lg animate-pulse">
        Loading size details...
      </p>
    );

  if (isError || !size)
    return (
      <p className="text-center mt-8 text-red-500 text-lg font-semibold">
        Size not found.
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-lg mt-10">
      {/* Go Back Link */}
      <GoBackLink to="/productsizes" label="Back to Sizes" />

      {/* Image */}
      <div className="w-full h-64 overflow-hidden rounded-2xl mb-6">
        <img
          src={size.imageURL || "https://via.placeholder.com/600x400"}
          alt={size.sizeName || "Product Size Image"}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/600x400";
          }}
        />
      </div>

      {/* Title & ID */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{size.sizeName}</h1>
      <p className="text-gray-500 text-sm mb-4">Product Size ID: {size.sizeID}</p>

      {/* Description */}
      <p className="text-gray-600 text-base mb-6 leading-relaxed">
        {size.description || "No description provided."}
      </p>

      {/* Details Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition">
          <p className="text-gray-700 font-medium">Region</p>
          <p className="text-gray-600">{size.region || "—"}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition">
          <p className="text-gray-700 font-medium">Measurement Unit</p>
          <p className="text-gray-600">{size.measurementUnit || "—"}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition">
          <p className="text-gray-700 font-medium">Min Range</p>
          <p className="text-gray-600">{size.minRange != null ? size.minRange : "—"}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition">
          <p className="text-gray-700 font-medium">Max Range</p>
          <p className="text-gray-600">{size.maxRange != null ? size.maxRange : "—"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductSizeDetails;
