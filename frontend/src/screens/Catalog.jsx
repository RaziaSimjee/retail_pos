import React, { useState, useRef, useMemo } from "react";
import Webcam from "react-webcam";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetProductVariantsQuery,
  useGetVariantByBarcodeQuery,
  useReadBarcodeImageMutation,
} from "../slices/productVariantApiSlice";
import { addToCart } from "../slices/cartSlice";
import CartModal from "../components/CartModal.jsx";
import { FaFilter, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Catalog = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isCustomer = userInfo?.user?.role === "customer";
  const isPrivileged = ["admin", "cashier", "manager"].includes(
    userInfo?.user?.role
  );

  const [searchText, setSearchText] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceFilter, setPriceFilter] = useState([0, 1000000]);
  const [barcode, setBarcode] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [pagination, setPagination] = useState({ skip: 0, take: 8 });

  const webcamRef = useRef(null);
  const dispatch = useDispatch();
  const { cartItems = [] } = useSelector((state) => state.cart || {});

  // Fetch product variants
  const {
    data: variants = [],
    isLoading,
    isError,
  } = useGetProductVariantsQuery(pagination);

  // Barcode reading hooks
  const [readBarcodeImage] = useReadBarcodeImageMutation();
  const { data: scannedVariant, isFetching: fetchingVariant } =
    useGetVariantByBarcodeQuery(barcode, { skip: !barcode });

  // Add to cart
  const handleAddToCart = (variant) => {
    if (variant.quantity === 0) return;

    dispatch(
      addToCart({
        _id: variant.productVariantID,
        name: variant.product?.productName || "Unnamed Product",
        price: variant.sellingPrice || 0,
        qty: 1,
        quantity: variant.quantity,
        imageURL: variant.product.imageURL,
        size: variant.productSize?.sizeName,
        color: variant.productColor?.colorName,
      })
    );
    setCartOpen(true);
  };

  // Capture barcode from webcam
  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });

    try {
      const result = await readBarcodeImage(blob).unwrap();
      const code = result.replace(/['"]+/g, "").trim();
      setBarcode(code);
      setShowCamera(false);
    } catch (err) {
      alert("Failed to read barcode image.");
    }
  };

  // Filtered variants based on search, brand, price
  const filteredVariants = useMemo(() => {
    return variants.filter((variant) => {
      const matchesCategory =
        !selectedCategory ||
        variant.product?.category?.categoryName === selectedCategory;

      const matchesSearch =
        !searchText ||
        variant.product?.productName
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        variant.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        String(variant.productVariantID).includes(searchText);

      const matchesBrand =
        !selectedBrand || variant.product?.brand?.brandName === selectedBrand;

      const matchesPrice =
        variant.sellingPrice >= priceFilter[0] &&
        variant.sellingPrice <= priceFilter[1];

      return matchesCategory && matchesSearch && matchesBrand && matchesPrice;
    });
  }, [variants, selectedCategory, searchText, selectedBrand, priceFilter]);

  // Extract unique brands and categories for dropdown
  const brandOptions = useMemo(
    () =>
      Array.from(
        new Set(
          variants.map((v) => v.product?.brand?.brandName).filter(Boolean)
        )
      ),
    [variants]
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          variants.map((v) => v.product?.category?.categoryName).filter(Boolean)
        )
      ),
    [variants]
  );

  if (isLoading)
    return (
      <p className="text-center mt-6 text-gray-400">Loading products...</p>
    );
  if (isError)
    return (
      <p className="text-center mt-6 text-red-500">Failed to load products.</p>
    );

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-4xl font-bold text-gray-900">Catalog</h1>

        {isPrivileged && (
          <div className="flex gap-3 flex-wrap">
            <button
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              onClick={() => setShowCamera(true)}
            >
              📷 Scan product
            </button>

            <label className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              🗂 Filter by barcode
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const result = await readBarcodeImage(file).unwrap();
                  setBarcode(result.replace(/['"]+/g, "").trim());
                }}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6 flex-wrap">
        {/* Search */}
        <div className="w-full md:w-64 mb-2 md:mb-0 relative">
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

        {/* Brand */}
        <div className="w-full md:w-40 mb-2 md:mb-0">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring focus:ring-blue-300 focus:outline-none"
          >
            <option value="">All Brands</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="w-full md:w-40 mb-2 md:mb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="w-full md:w-40 mb-2 md:mb-0">
          <select
            value={priceFilter.join("-")}
            onChange={(e) => {
              const [min, max] = e.target.value.split("-").map(Number);
              setPriceFilter([min, max]);
            }}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring focus:ring-blue-300 focus:outline-none"
          >
            <option value="0-1000000">All Prices</option>
            <option value="0-5000">0 - 5,000 Ks</option>
            <option value="5000-20000">5,000 - 20,000 Ks</option>
            <option value="20000-50000">20,000 - 50,000 Ks</option>
            <option value="50000-1000000">50,000+ Ks</option>
          </select>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              className="rounded-lg mb-4 w-[400px] h-[300px] object-cover"
            />
            <div className="flex gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                onClick={handleCapture}
              >
                Capture & Scan
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                onClick={() => setShowCamera(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {barcode && scannedVariant && !fetchingVariant && (
          <div
            key={`scanned-${scannedVariant.productVariantID}`}
            className="flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-200"
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={
                  scannedVariant.product.imageURL?.startsWith("data:image")
                    ? scannedVariant.product.imageURL
                    : `data:image/png;base64,${scannedVariant.product.imageURL}`
                }
                alt={scannedVariant.product?.productName || "Variant"}
                onError={(e) =>
                  (e.target.src = "../assets/images/placeholderDress.jpg")
                }
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {scannedVariant.product?.productName || "Unnamed Product"}
              </h2>
              <Link
                to={`/productvariants/${scannedVariant.productVariantID}`}
                className="text-blue-500 hover:text-blue-600 text-sm underline mb-2"
              >
                View Details
              </Link>
              <p className="text-gray-700 font-medium mb-2">
                {scannedVariant.sellingPrice} Ks
              </p>
              <p className="text-gray-600 text-sm flex-1 mb-4 line-clamp-2">
                {scannedVariant.description || "No description available."}
              </p>
              {!isCustomer && (
                <button
                  onClick={() => handleAddToCart(scannedVariant)}
                  className="w-full bg-green-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        )}

        {filteredVariants.map((variant) => (
          <div
            key={variant.productVariantID}
            className="flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-200"
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={
                  variant.product.imageURL?.startsWith("data:image")
                    ? variant.product.imageURL
                    : `data:image/png;base64,${variant.product.imageURL}`
                }
                alt={variant.product?.productName || "Variant"}
                onError={(e) =>
                  (e.target.src = "../assets/images/placeholderDress.jpg")
                }
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {variant.product?.productName || "Unnamed Product"}
              </h2>
              <Link
                to={`/productvariants/${variant.productVariantID}`}
                className="text-blue-500 hover:text-blue-600 text-sm underline mb-2"
              >
                View Details
              </Link>
              <p className="text-gray-700 font-medium mb-2">
                {variant.sellingPrice} Ks
              </p>
              <p className="text-gray-600 text-sm flex-1 mb-4 line-clamp-2">
                {variant.description || "No description available."}
              </p>
              <button
                onClick={() => handleAddToCart(variant)}
                className="w-full bg-green-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-green-600 transition font-medium"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
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

      {/* Floating Cart Icon */}
      <button
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center justify-center z-50"
        onClick={() => setCartOpen(true)}
      >
        🛒
        {cartItems.length > 0 && (
          <span className="ml-2 font-bold">
            {cartItems.reduce((a, c) => a + c.qty, 0)}
          </span>
        )}
      </button>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Catalog;
