import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  useGetTotalSalesByMonthQuery,
  useGetTotalSalesByYearRangeQuery,
} from "../slices/saleApiSlice";
import { skipToken } from "@reduxjs/toolkit/query/react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LineGraph = () => {
  const [mode, setMode] = useState("monthly"); // "monthly" or "yearly"
  const [year, setYear] = useState(2025);
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2025);

  // Monthly: fetch sales for each month of the selected year
  const monthlyQueries = monthNames.map((_, idx) =>
    useGetTotalSalesByMonthQuery({ year, month: idx + 1 })
  );

  const { data: yearlyData, isLoading: loadingYear } = useGetTotalSalesByYearRangeQuery(
    mode === "yearly" ? { startYear, endYear } : skipToken
  );

  const isLoadingMonthly = monthlyQueries.some((q) => q.isLoading);
  const isLoading = mode === "monthly" ? isLoadingMonthly : loadingYear;

  // Chart data
  const chartData = {
    labels: mode === "monthly"
      ? monthNames
      : Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i),
    datasets: [
      {
        label: "Total Sales ($)",
        data: mode === "monthly"
          ? monthlyQueries.map((q) => q.data?.totalSalesAmount ?? 0)
          : Array.from({ length: endYear - startYear + 1 }, (_, i) => yearlyData?.totalSalesAmount ?? 0),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `Sales: $${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Total Sales ($)",
          font: { weight: "bold" },
        },
      },
      x: {
        title: {
          display: true,
          text: mode === "monthly" ? "Month" : "Year",
          font: { weight: "bold" },
        },
      },
    },
  };

  return (
    <div >
  

      {/* Mode Selector */}
      <div className="mb-4 flex items-center gap-2">
        <label className="font-medium">Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Inputs */}
      {mode === "monthly" ? (
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block font-medium">Year:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder="Year"
              className="border p-1 rounded w-32"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block font-medium">Start Year:</label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              placeholder="Start Year"
              className="border p-1 rounded w-32"
            />
          </div>
          <div>
            <label className="block font-medium">End Year:</label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              placeholder="End Year"
              className="border p-1 rounded w-32"
            />
          </div>
        </div>
      )}

      {isLoading && <p>Loading...</p>}

      {/* Line Chart */}
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineGraph;