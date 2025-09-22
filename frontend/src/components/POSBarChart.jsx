// src/components/POSBarChart.jsx
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
import { Card, CardBody, Typography } from "@material-tailwind/react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const POSBarChart = () => {
  // Fake sales data for POS dashboard
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sales ($)",
        data: [1200, 1900, 1500, 2200, 3000, 2500, 4000],
        backgroundColor: "#3b82f6", // Tailwind blue-500
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#f9fafb",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { color: "#6b7280" },
      },
    },
  };

  return (
    <Card className="w-full shadow-lg rounded-2xl">
      <CardBody>
        <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
          Weekly Sales
        </Typography>
        <div className="w-full h-72">
          <Bar data={data} options={options} />
        </div>
      </CardBody>
    </Card>
  );
};

export default POSBarChart;
