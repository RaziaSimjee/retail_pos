// components/BarChart.jsx
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useGetTotalSalesByMonthQuery } from "../slices/saleApiSlice";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ year, month }) => {
  const { data, isLoading } = useGetTotalSalesByMonthQuery({ year, month });

  if (isLoading) return <p>Loading...</p>;

  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Sales ($)",
        data: [
          data.totalSalesAmount / 4,
          data.totalSalesAmount / 4,
          data.totalSalesAmount / 4,
          data.totalSalesAmount / 4,
        ], // Simplified weekly split
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f3f4f6" }, ticks: { color: "#6b7280" } },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
