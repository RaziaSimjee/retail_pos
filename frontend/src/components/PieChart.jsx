// components/PieChart.jsx
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const generateColors = (num) => {
  const colors = [];
  for (let i = 0; i < num; i++) {
    const hue = Math.floor(Math.random() * 360);
    colors.push(`hsl(${hue}, 70%, 70%)`);
  }
  return colors;
};

const PieChart = ({ sales }) => {
  if (!sales || sales.length === 0) return <p>No sales data available</p>;

  // Flatten all products from sales
  const allProducts = sales.flatMap((sale) => sale.productList);

  // Aggregate quantity by productName
  const productMap = {};
  allProducts.forEach((p) => {
    productMap[p.productName] = (productMap[p.productName] || 0) + p.quantity;
  });

  const labels = Object.keys(productMap);
  const data = Object.values(productMap);
  const backgroundColor = generateColors(labels.length);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Quantity Sold",
        data,
        backgroundColor,
      },
    ],
  }), [labels.join(','), data.join(',')]);

  const options = {
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw}`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return <Pie data={chartData} options={options} redraw />;
};

export default PieChart;
