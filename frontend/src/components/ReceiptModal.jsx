import React from "react";

const ReceiptModal = ({ isOpen, onClose, sale, navigate }) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Order Completed 🎉</h2>

        <div className="space-y-2">
          <p><strong>Sale ID:</strong> {sale.saleID}</p>
          <p><strong>Subtotal:</strong> {sale.subtotal} Ks</p>
          <p><strong>Tax:</strong> {sale.tax} Ks</p>
          <p><strong>Discount:</strong> {sale.discount} Ks</p>
          <p><strong>Points Spent:</strong> {sale.pointsSpent}</p>
          <p className="font-bold"><strong>Total:</strong> {sale.total} Ks</p>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          <ul className="list-disc pl-5 space-y-1">
            {sale.productList?.map((item) => (
              <li key={item.saleProductID}>
                {item.productName} × {item.quantity} → {item.totalPrice} Ks
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between mt-6">
          <a
            href={sale.receiptLink}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download Receipt
          </a>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Catalog
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
