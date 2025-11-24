// components/PieChart.jsx
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useGetProductSalesQuery } from "../slices/saleApiSlice";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ productIds }) => {
  const { data, isLoading } = useGetProductSalesQuery({ productId: productIds[0], skip: 0, take: 100 });

  if (isLoading) return <p>Loading...</p>;

  // Extract quantities and labels
  const quantities = data.map((sale) => sale.productList[0].quantity);
  const labels = data.map((sale) => sale.productList[0].productName);

  // Calculate total for percentages
  const total = quantities.reduce((sum, qty) => sum + qty, 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sales Count",
        data: quantities,
        backgroundColor: ["#3b82f6", "#f87171", "#34d399", "#fbbf24"],
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${context.label}: ${value} (${percentage})`;
          },
        },
      },
      legend: {
        position: "bottom",
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;