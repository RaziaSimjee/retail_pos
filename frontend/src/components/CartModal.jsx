import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, adjustQty } from "../slices/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
export default function CartModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems = [] } = useSelector((state) => state.cart || {});

  if (!isOpen) return null;

  const handleIncrease = (item) => {
    if (item.qty >= item.quantity) {
      toast.warn(`Only ${item.quantity} items in stock!`);
      return;
    }
    dispatch(adjustQty({ id: item._id, qty: item.qty + 1 }));
  };

  const handleDecrease = (item) => {
    if (item.qty <= 1) return;
    dispatch(adjustQty({ id: item._id, qty: item.qty - 1 }));
  };

   const handleCheckoutClick = () => {
    onClose(); // close the modal
    navigate("/checkout"); // redirect to checkout page
  };

  // Calculate total quantity and subtotal
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg p-4 overflow-y-auto z-50">
      <button
        onClick={onClose}
        className="mb-4 text-black font-bold text-lg hover:text-gray-700 transition"
      >
        ✖
      </button>

      <h2 className="text-xl font-bold mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-600">Cart is empty</p>
      ) : (
        cartItems.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-start mb-4 border-b pb-2"
          >
            <img
              src={
                item.imageURL?.startsWith("data:image")
                  ? item.imageURL
                  : `data:image/png;base64,${item.imageURL}`
              }
              alt={item.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 ml-3">
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-700">
                Subtotal: {item.price * item.qty} Ks
              </p>
              {item.size && (
                <p className="text-sm text-gray-500">Size: {item.size}</p>
              )}
              {item.color && (
                <p className="text-sm text-gray-500">Color: {item.color}</p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleDecrease(item)}
                  className="px-2 py-1 border rounded hover:bg-gray-100 transition"
                >
                  -
                </button>
                <span className="font-medium">{item.qty}</span>
                <button
                  onClick={() => handleIncrease(item)}
                  className="px-2 py-1 border rounded hover:bg-gray-100 transition"
                >
                  +
                </button>
                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="ml-2 text-red-500 hover:text-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {cartItems.length > 0 && (
        <div className="mt-6 border-t pt-4 space-y-2">
          <p>Total Quantity: {totalQuantity}</p>
          <p className="text-gray-900 text-lg font-medium">
            Subtotal: {subtotal} Ks
          </p>
          <button  onClick={handleCheckoutClick}
          className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
