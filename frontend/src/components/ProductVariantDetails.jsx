import React from "react";
import { useParams } from "react-router-dom";
import { useGetProductVariantsByIdQuery } from "../slices/productVariantApiSlice.js";
import GoBackLink from "./GoBackLink.jsx";

const ProductVariantDetails = () => {
  const { id } = useParams();
  const {
    data: variant,
    isLoading,
    isError,
  } = useGetProductVariantsByIdQuery(id);

  if (isLoading) {
    return (
      <p className="text-center mt-8 text-gray-400 text-lg animate-pulse">
        Loading product variant...
      </p>
    );
  }

  if (isError || !variant) {
    return (
      <p className="text-center mt-8 text-red-500 text-lg font-semibold">
        Product variant not found.
      </p>
    );
  }

  const getImageSrc = (base64) => {
    if (!base64) return "https://via.placeholder.com/150";
    return base64.startsWith("data:image")
      ? base64
      : `data:image/png;base64,${base64}`;
  };

  const downloadBarcode = () => {
    if (!variant.barCodeImage) return;
    const link = document.createElement("a");
    link.href = getImageSrc(variant.barCodeImage);
    link.download = `barcode-${
      variant.barcode || variant.productVariantID
    }.png`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      {/* Back Link */}
      <GoBackLink to="/productvariants" label="Back to Product Variants" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/2 h-72 overflow-hidden rounded-2xl">
          <img
            src={getImageSrc(variant.product.imageURL)}
            alt={variant.product?.productName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900">
            {variant.product?.productName || "Unnamed Product"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Variant ID:{" "}
            <span className="font-medium">{variant.productVariantID}</span>
          </p>
          <p className="text-gray-600 mt-3 leading-relaxed">
            {variant.description || "No description provided."}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <span className="font-medium">Price:</span> $
              {variant.sellingPrice}
            </p>
            <p>
              <span className="font-medium">Quantity in Stock:</span>{" "}
              {variant.quantity}
            </p>
            <p>
              <span className="font-medium">Barcode:</span> {variant.barcode}
            </p>
          </div>
        </div>
      </div>

      {/* Barcode Image + Download */}
      {variant.barCodeImage && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Barcode</h2>
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Left Column: Barcode info */}
            <div className="flex flex-col items-center md:items-start">
              {/* Barcode Value */}
              <p className="text-gray-700 mb-3 text-center md:text-left">
                <span className="font-medium">Barcode:</span>{" "}
                {variant.barcode}
              </p>

              {/* Barcode Image */}
              <img
                src={getImageSrc(variant.barCodeImage)}
                alt="Barcode"
                className="w-56 object-contain border rounded-lg bg-white p-2 mb-3"
              />

              {/* Download Button */}
              <button
                onClick={downloadBarcode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-sm"
              >
                Download Barcode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Info */}
      {variant.product && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Product Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-xl bg-gray-50">
              <img
                src={getImageSrc(variant.product.imageURL)}
                alt={variant.product.productName}
                className="w-24 h-24 mb-3 rounded-lg object-cover"
              />
              <p>
                <span className="font-medium">Product ID:</span>{" "}
                {variant.product.productID}
              </p>
              <p className="mt-2 text-gray-600">
                {variant.product.description}
              </p>
            </div>
            {/* Category Info */}
            {variant.product.category && (
              <div className="p-4 border rounded-xl bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">Category</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={getImageSrc(variant.product.category.imageURL)}
                    alt={variant.product.category.categoryName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-gray-800 font-medium">
                      {variant.product.category.categoryName}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {variant.product.category.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Brand Info */}
      {variant.product?.brand && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Brand Information</h2>
          <div className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50">
            <img
              src={getImageSrc(variant.product.brand.imageURL)}
              alt={variant.product.brand.brandName}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <p className="text-gray-800 font-medium">
                {variant.product.brand.brandName}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {variant.product.brand.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Size & Color */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Variant Specifications</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {variant.productSize && (
            <div className="p-4 border rounded-xl bg-gray-50">
              <h3 className="font-semibold mb-2">Size Information</h3>
              <p>
                <span className="font-medium">Size Name:</span>{" "}
                {variant.productSize.sizeName}
              </p>
              <p>
                <span className="font-medium">Range:</span>{" "}
                {variant.productSize.minRange} - {variant.productSize.maxRange}{" "}
                {variant.productSize.measurementUnit}
              </p>
              <p>
                <span className="font-medium">Region:</span>{" "}
                {variant.productSize.region}
              </p>
              <p className="mt-2 text-gray-600">
                {variant.productSize.description}
              </p>
            </div>
          )}

          {variant.productColor && (
            <div className="p-4 border rounded-xl bg-gray-50">
              <h3 className="font-semibold mb-2">Color Information</h3>
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full border"
                  style={{
                    backgroundColor:
                      variant.productColor.colorName.toLowerCase(),
                  }}
                ></div>
                <div>
                  <p className="font-medium">
                    {variant.productColor.colorName}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {variant.productColor.description || "No description"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Serial Numbers */}
      {variant.productSerialNumbers?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Product Serial Numbers
          </h2>
          <ul className="space-y-2">
            {variant.productSerialNumbers.map((serial, idx) => (
              <li
                key={idx}
                className="p-3 border rounded-lg bg-gray-50 text-sm font-mono text-gray-700"
              >
                {serial.serialNumber || JSON.stringify(serial)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Dates */}
      <div className="text-sm text-gray-500 mt-6 border-t pt-4">
        <p>
          <span className="font-medium text-gray-700">Created:</span>{" "}
          {new Date(variant.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-medium text-gray-700">Updated:</span>{" "}
          {new Date(variant.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ProductVariantDetails;
