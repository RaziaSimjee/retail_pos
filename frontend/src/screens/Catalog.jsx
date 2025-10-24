import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetProductVariantsQuery,
  useGetVariantByBarcodeQuery,
  useReadBarcodeImageMutation,
} from "../slices/productVariantApiSlice";
import { addToCart } from "../slices/cartSlice";
import CartModal from "../components/CartModal.jsx";

const Catalog = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isCustomer = userInfo?.user?.role === "customer";
  const isPrivileged = ["admin", "cashier", "manager"].includes(
    userInfo?.user?.role
  );
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  const {
    data: variants,
    isLoading,
    isError,
  } = useGetProductVariantsQuery({ skip: 0, take: 100 });
  const dispatch = useDispatch();
  const [cartOpen, setCartOpen] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const { cartItems = [] } = useSelector((state) => state.cart || {});

  const handleAddToCart = (variant) => {
    if (variant.quantity === 0) return;

    const cartItem = {
      _id: variant.productVariantID,
      name: variant.product?.productName || "Unnamed Product",
      price: variant.sellingPrice || 0,
      qty: 1,
      quantity: variant.quantity,
      imageURL: variant.imageURL,
      size: variant.productSize?.sizeName,
      color: variant.productColor?.colorName,
    };

    dispatch(addToCart(cartItem));
    setCartOpen(true); // open cart modal
  };

  const [readBarcodeImage] = useReadBarcodeImageMutation();
  const { data: scannedVariant, isFetching: fetchingVariant } =
    useGetVariantByBarcodeQuery(barcode, { skip: !barcode });

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Convert base64 to Blob
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Catalog</h1>

        {isPrivileged && (
          <div className="flex gap-3">
            {/* Take photo directly */}
            <button
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              onClick={() => setShowCamera(true)}
            >
              📷 Take Image
            </button>

            {/* File upload fallback */}
            <label className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              🗂 Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const result = await readBarcodeImage(file).unwrap();
                  const code = result.replace(/['"]+/g, "").trim();
                  setBarcode(code);
                }}
                className="hidden"
              />
            </label>
          </div>
        )}
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

      {/* Scanned product preview */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
        {/* If barcode scanned, show product first */}
        {barcode && scannedVariant && !fetchingVariant && (
          <div
            key={`scanned-${scannedVariant.productVariantID}`}
            className="flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border  border-gray-200 "
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={
                  scannedVariant.imageURL?.startsWith("data:image")
                    ? scannedVariant.imageURL
                    : `data:image/png;base64,${scannedVariant.imageURL}`
                }
                alt={scannedVariant.product?.productName || "Variant"}
                onError={(e) =>
                  (e.target.src = "../assets/images/placeholderDress.jpg")
                }
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {scannedVariant.product?.productName || "Unnamed Product"}
              </h2>
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
      </div>

      {/* Catalog grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {variants?.map((variant) => (
          <div
            key={variant.productVariantID}
            className="flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-200"
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={
                  variant.imageURL?.startsWith("data:image")
                    ? variant.imageURL
                    : `data:image/png;base64,${variant.imageURL}`
                }
                alt={variant.product?.productName || "Variant"}
                onError={(e) =>
                  (e.target.src = "../assets/images/placeholderDress.jpg")
                }
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {variant.product?.productName || "Unnamed Product"}
              </h2>
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

      {/* Floating Cart Icon - Bottom Right */}
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
