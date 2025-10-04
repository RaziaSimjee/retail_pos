import React, { useState } from "react";
import { toast } from "react-toastify";

const DownloadReceiptButton = ({ saleID }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!saleID) {
      toast.error("Invalid sale ID");
      return;
    }

    setIsDownloading(true);
    try {
      // Construct the receipt URL
      const receiptUrl = `http://localhost:3000/saleService/sales/${saleID}/receipt`;

      // Fetch the receipt
      const response = await fetch(receiptUrl);
      if (!response.ok) throw new Error("Failed to fetch receipt");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt_${saleID}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Receipt downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
    >
      {isDownloading ? "Downloading..." : "Download Receipt"}
    </button>
  );
};

export default DownloadReceiptButton;
