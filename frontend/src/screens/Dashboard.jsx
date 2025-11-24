import { useState } from "react";
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

// API hooks
import { useGetCustomersCountQuery } from "../slices/loyaltyProgramApiSlice";
import { useGetProductsCountQuery } from "../slices/productApiSlice";
import { useGetProductVariantsQuery } from "../slices/productVariantApiSlice";
import { useGetBrandsCountQuery } from "../slices/brandApiSlice";
import { useGetCategoriesCountQuery } from "../slices/categoryApiSlice";
import { useGetTotalSalesQuery } from "../slices/saleApiSlice";
import { useGetAllUsersQuery } from "../slices/usersApiSlice";
import { useGetAllSuppliersQuery } from "../slices/suppliersApiSlice";

const Dashboard = () => {
  const [fromId, setFromId] = useState(1);
  const [toId, setToId] = useState(1000);
  const [downloadAll, setDownloadAll] = useState(false);

  const queryFromId = downloadAll ? 1 : fromId;
  const queryToId = downloadAll ? 1000 : toId;

  const { data: categoryCount, isLoading: categoriesLoading } = useGetCategoriesCountQuery();
  const { data: brandCount, isLoading: brandsLoading } = useGetBrandsCountQuery();
  const { data: productCount, isLoading: productsLoading } = useGetProductsCountQuery();
  const { data: variantData, isLoading: variantsLoading } = useGetProductVariantsQuery();
  const { data: customerData, isLoading: customersLoading } = useGetCustomersCountQuery();
  const { data: totalSalesData, isLoading: salesLoading } = useGetTotalSalesQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: suppliersData, isLoading: suppliersLoading } = useGetAllSuppliersQuery();

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
      <div className="p-10 text-gray-500">
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
        <p>Loading insights...</p>
      </div>
    );
  }

  const adminCount = usersData?.users?.filter((u) => u.userRole === "admin")?.length ?? 0;
  const managerCount = usersData?.users?.filter((u) => u.userRole === "manager")?.length ?? 0;
  const cashierCount = usersData?.users?.filter((u) => u.userRole === "cashier")?.length ?? 0;
  const supplierCount = suppliersData?.suppliers?.length ?? 0;

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/saleService/sales/export/${queryFromId}/${queryToId}`,
        { method: "GET" }
      );
      if (!response.ok) throw new Error("Failed to download file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales_data_${queryFromId}_${queryToId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download sales data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={downloadAll}
              onChange={(e) => setDownloadAll(e.target.checked)}
              className="mr-2 accent-blue-500"
            />
            Download All (1–1000)
          </label>

          {!downloadAll && (
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={fromId}
                onChange={(e) => setFromId(Number(e.target.value))}
                placeholder="From ID"
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
              <input
                type="number"
                min={1}
                value={toId}
                onChange={(e) => setToId(Number(e.target.value))}
                placeholder="To ID"
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>
          )}

          <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            ⬇️ Export Sales (.xlsx)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
        <StatsCard title="Categories" value={categoryCount ?? 0} Icon={CubeIcon} />
        <StatsCard title="Brands" value={brandCount ?? 0} Icon={ShoppingCartIcon} />
        <StatsCard title="Products" value={productCount ?? 0} Icon={IdentificationIcon} />
        <StatsCard title="Variants" value={variantData?.length ?? 0} Icon={CubeIcon} />
        <StatsCard title="Customers" value={customerData?.totalCustomers ?? 0} Icon={UsersIcon} />
        <StatsCard title="Suppliers" value={supplierCount} Icon={TruckIcon} />
        <StatsCard title="Admins" value={adminCount} Icon={UserGroupIcon} />
        <StatsCard title="Managers" value={managerCount} Icon={UserGroupIcon} />
        <StatsCard title="Cashiers" value={cashierCount} Icon={UserGroupIcon} />
        <StatsCard
          title="Total Sales"
          value={totalSalesData ? `$${totalSalesData.totalSalesAmount.toFixed(2)}` : "0"}
          Icon={ShoppingCartIcon}
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Line Graph */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Over Time</h2>
          <LineGraph />
        </div>

        {/* Scatter Plot */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Individual Sale Totals</h2>
          <ScatterPlot />
        </div>

        {/* Customer Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Sales Overview</h2>
          <CustomerSalesChart />
        </div>

        {/* Bar + Pie Charts (Side by Side on large, stacked on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Sales (Oct 2025)</h2>
            <BarChart year={2025} month={10} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by Product</h2>
            <PieChart productIds={[22]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
