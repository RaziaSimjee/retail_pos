// src/components/RevenueChart.jsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Card, CardBody, Typography } from "@material-tailwind/react";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const RevenueChart = () => {
  // Fake revenue data (could later be replaced with API data)
  const fakeRevenueData = [
    { month: "Jan", revenue: 4200 },
    { month: "Feb", revenue: 3100 },
    { month: "Mar", revenue: 4800 },
    { month: "Apr", revenue: 6900 },
    { month: "May", revenue: 7500 },
    { month: "Jun", revenue: 8900 },
    { month: "Jul", revenue: 10200 },
    { month: "Aug", revenue: 9800 },
    { month: "Sep", revenue: 11500 },
    { month: "Oct", revenue: 12300 },
    { month: "Nov", revenue: 13800 },
    { month: "Dec", revenue: 15000 },
  ];

  const chartData = {
    labels: fakeRevenueData.map((item) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: fakeRevenueData.map((item) => item.revenue),
        borderColor: "#3b82f6", // Tailwind blue-500
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#374151", // Tailwind gray-700
        },
      },
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
        ticks: {
          color: "#6b7280",
        },
        grid: {
          color: "#f3f4f6",
        },
      },
      y: {
        ticks: {
          color: "#6b7280",
        },
        grid: {
          color: "#f3f4f6",
        },
      },
    },
  };

  return (
    <Card className="w-full shadow-lg rounded-2xl">
      <CardBody>
        <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
          Total Revenue Generated
        </Typography>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardBody>
    </Card>
  );
};

export default RevenueChart;
