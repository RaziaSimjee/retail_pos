import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetProductByIdQuery } from "../slices/productApiSlice.js";
import GoBackLink from "./GoBackLink.jsx";
const ProductDetails = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id);

  if (isLoading)
    return (
      <p className="text-center mt-8 text-gray-400 text-lg animate-pulse">
        Loading product...
      </p>
    );
  if (isError || !product)
    return (
      <p className="text-center mt-8 text-red-500 text-lg font-semibold">
        Product not found.
      </p>
    );

  const getImageSrc = (base64) => {
    if (!base64) return "https://via.placeholder.com/80";
    return base64.startsWith("data:image") ? base64 : `data:image/png;base64,${base64}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <GoBackLink to="/products" label="Back to Products" />
      {/* Product Image */}
      <div className="w-full h-64 overflow-hidden rounded-2xl mb-6">
        <img
          src={product.imageURL || "https://via.placeholder.com/600x400"}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Title & Description */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>
      <p className="text-gray-400 text-sm mb-4">Product ID: {product.productID}</p>
      <p className="text-gray-600 text-base mb-6 leading-relaxed">{product.description}</p>

      {/* Category Info */}
      {product.category && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Category</h2>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl shadow-sm">
            <img
              src={getImageSrc(product.category.imageURL)}
              alt={product.category.categoryName}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p className="text-gray-800 font-medium">{product.category.categoryName}</p>
              <p className="text-gray-500 text-sm mt-1">{product.category.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Brand Info */}
      {product.brand && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Brand</h2>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl shadow-sm">
            <img
              src={getImageSrc(product.brand.imageURL)}
              alt={product.brand.brandName}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p className="text-gray-800 font-medium">{product.brand.brandName}</p>
              <p className="text-gray-500 text-sm mt-1">{product.brand.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="text-sm text-gray-500 mt-4 space-y-1">
        <p>
          <span className="font-medium text-gray-700">Created:</span>{" "}
          {new Date(product.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-medium text-gray-700">Updated:</span>{" "}
          {new Date(product.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Back Button */}
      {/* <div className="mt-6">
        <Link
          to="/products"
          className="px-5 py-2 bg-blue-600 text-white text-base rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          ⬅ Back to Products
        </Link>
      </div> */}
    </div>
  );
};

export default ProductDetails;
