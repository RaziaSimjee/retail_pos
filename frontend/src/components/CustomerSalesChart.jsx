// components/CustomerSalesChart.jsx
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useGetAllUsersQuery } from "../slices/usersApiSlice";
import { useGetTotalSalesByCustomerQuery } from "../slices/saleApiSlice";
import { skipToken } from "@reduxjs/toolkit/query/react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CustomerSalesChart = () => {
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Filter only customers
  const customers = usersData?.users?.filter((u) => u.userRole === "customer") ?? [];

  // Fetch selected customer total sales
  const { data: salesData, isLoading: salesLoading } = useGetTotalSalesByCustomerQuery(
    selectedCustomerId ?? skipToken
  );

  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].customerId); // default first customer
    }
  }, [customers, selectedCustomerId]);

  if (usersLoading) return <p>Loading customers...</p>;
  if (!customers.length) return <p>No customers found</p>;

  const chartData = {
    labels: [salesData?.customerID ?? "Customer"],
    datasets: [
      {
        label: "Total Purchases ($)",
        data: [salesData?.totalSalesAmount ?? 0],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Total Sales ($)" },
      },
      x: {
        title: { display: true, text: "Customer ID" },
      },
    },
  };

  return (
    <div >


      {/* Customer Dropdown */}
 
      <div className="flex items-center gap-3 mb-4">
        <label className="font-medium text-gray-700 text-sm">Customer:</label>
        <select
          className="border border-gray-300 bg-white px-3 py-1 rounded-md text-sm focus:ring focus:ring-blue-200"
          value={selectedCustomerId ?? ""}
          onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
        >
          {customers.map((customer) => (
            <option key={customer.customerId} value={customer.customerId}>
              {customer.username} (ID: {customer.customerId})
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {salesLoading && <p>Loading sales...</p>}

      {/* Chart */}
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CustomerSalesChart;
