// components/ScatterPlot.jsx
import { Scatter } from "react-chartjs-2";
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { useGetAllSalesQuery } from "../slices/saleApiSlice";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const ScatterPlot = () => {
  const { data, isLoading } = useGetAllSalesQuery();

  if (isLoading) return <p>Loading...</p>;

  const chartData = {
    datasets: [
      {
        label: "Sales Total",
        data: data.map((sale) => ({ x: sale.saleID, y: sale.total })), // use saleID from backend
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "Sale ID" },
        ticks: { stepSize: 1 }, // ensures integer steps on x-axis
      },
      y: {
        title: { display: true, text: "Total ($)" },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Total: $${context.raw.y.toFixed(2)}`,
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return <Scatter data={chartData} options={options} />;
};

export default ScatterPlot;
