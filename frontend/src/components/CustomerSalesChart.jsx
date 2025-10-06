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
    <div className="bg-white p-4 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Customer Sales</h2>

      {/* Customer Dropdown */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Customer:</label>
        <select
          className="border p-2 rounded w-64"
          value={selectedCustomerId ?? ""}
          onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
        >
          {customers.map((customer) => (
            <option key={customer.customerId} value={customer.customerId}>
              {customer.customerId} - {customer.username}
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
