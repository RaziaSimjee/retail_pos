// pages/Dashboard.jsx
import { useState } from "react"; // <-- IMPORT useState
import {
  UserGroupIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  TruckIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";

import StatsCard from "../components/StatsCard";
import BarChart from "../components/BarChart";
import PieChart from "../components/PieChart";
import LineGraph from "../components/LineGraph";
import ScatterPlot from "../components/ScatterPlot";
import CustomerSalesChart from "../components/CustomerSalesChart";

import { API_GATEWAY_URL } from "../constants";
// Count hooks
import { useGetCustomersCountQuery } from "../slices/loyaltyProgramApiSlice";
import { useGetProductsCountQuery } from "../slices/productApiSlice";
import { useGetProductVariantsQuery } from "../slices/productVariantApiSlice";
import { useGetBrandsCountQuery } from "../slices/brandApiSlice";
import { useGetCategoriesCountQuery } from "../slices/categoryApiSlice";
import {
  useGetTotalSalesQuery,

} from "../slices/saleApiSlice";
import { useGetAllUsersQuery } from "../slices/usersApiSlice";
import { useGetAllSuppliersQuery } from "../slices/suppliersApiSlice";

const Dashboard = () => {
  // States
  const [fromId, setFromId] = useState(1);
  const [toId, setToId] = useState(1000);
  const [downloadAll, setDownloadAll] = useState(false);

  // Determine actual from/to ids based on "Download All"
  const queryFromId = downloadAll ? 1 : fromId;
  const queryToId = downloadAll ? 1000 : toId;

  // Fetch counts
  const { data: categoryCount, isLoading: categoriesLoading } =
    useGetCategoriesCountQuery();
  const { data: brandCount, isLoading: brandsLoading } =
    useGetBrandsCountQuery();
  const { data: productCount, isLoading: productsLoading } =
    useGetProductsCountQuery();
  const { data: variantData, isLoading: variantsLoading } =
    useGetProductVariantsQuery();
  const { data: customerData, isLoading: customersLoading } =
    useGetCustomersCountQuery();
  const { data: totalSalesData, isLoading: salesLoading } =
    useGetTotalSalesQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: suppliersData, isLoading: suppliersLoading } =
    useGetAllSuppliersQuery();



  // Show loading indicator until all data is ready
  const isLoading =
    categoriesLoading ||
    brandsLoading ||
    productsLoading ||
    variantsLoading ||
    customersLoading ||
    salesLoading ||
    usersLoading ||
    suppliersLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p>Loading data...</p>
      </div>
    );
  }

  // Count users by role
  const adminCount =
    usersData?.users?.filter((user) => user.userRole === "admin")?.length ?? 0;
  const managerCount =
    usersData?.users?.filter((user) => user.userRole === "manager")?.length ??
    0;
  const cashierCount =
    usersData?.users?.filter((user) => user.userRole === "cashier")?.length ??
    0;

  // Count suppliers
  const supplierCount = suppliersData?.suppliers?.length ?? 0;

  // Optional: handle null values for CSV export
  const replacer = (key, value) => (value === null ? "" : value);

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/saleService/sales/export/${queryFromId}/${queryToId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob(); // get the file as blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sales_data_${queryFromId}_${queryToId}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download sales data");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Categories"
          value={categoryCount ?? 0}
          Icon={CubeIcon}
        />
        <StatsCard
          title="Total Brands"
          value={brandCount ?? 0}
          Icon={ShoppingCartIcon}
        />
        <StatsCard
          title="Total Products"
          value={productCount ?? 0}
          Icon={IdentificationIcon}
        />
        <StatsCard
          title="Total Product Variants"
          value={variantData?.length ?? 0}
          Icon={CubeIcon}
        />
        <StatsCard
          title="Total Customers"
          value={customerData?.totalCustomers ?? 0}
          Icon={UsersIcon}
        />
        <StatsCard
          title="Total Suppliers"
          value={supplierCount}
          Icon={TruckIcon}
        />
        <StatsCard
          title="Total Admins"
          value={adminCount}
          Icon={UserGroupIcon}
        />
        <StatsCard
          title="Total Managers"
          value={managerCount}
          Icon={UserGroupIcon}
        />
        <StatsCard
          title="Total Cashiers"
          value={cashierCount}
          Icon={UserGroupIcon}
        />
        <StatsCard
          title="Total Sales"
          value={
            totalSalesData
              ? `$${totalSalesData.totalSalesAmount.toFixed(2)}`
              : "0"
          }
          Icon={ShoppingCartIcon}
        />
      </div>

      {/* Download Excel Form */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Export Sales Data</h2>
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={downloadAll}
              onChange={(e) => setDownloadAll(e.target.checked)}
            />
            Download All (Sale ID 1-1000)
          </label>
        </div>

        {!downloadAll && (
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              min={1}
              value={fromId}
              onChange={(e) => setFromId(Number(e.target.value))}
              placeholder="From Sale ID"
              className="border p-1 rounded w-32"
            />
            <input
              type="number"
              min={1}
              value={toId}
              onChange={(e) => setToId(Number(e.target.value))}
              placeholder="To Sale ID"
              className="border p-1 rounded w-32"
            />
          </div>
        )}

        <button
          onClick={handleDownload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Download Sales Data (.xlsx)
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="w-full bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Weekly Sales</h2>
          <BarChart year={2025} month={10} />
        </div>

        <div className="w-full bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Sales by Product</h2>
          <PieChart productIds={[22]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="w-full bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Sales Over Years</h2>
          <LineGraph />
        </div>

        <div className="w-full bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Individual Sale Totals</h2>
          <ScatterPlot />
        </div>

        {/* Customer Sales Chart full width */}
        <div className="w-full bg-white p-4 rounded-2xl shadow-lg">
          <CustomerSalesChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
