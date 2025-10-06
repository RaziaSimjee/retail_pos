import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({ data }) => {
  // Spread the data to prevent Chart.js internal mutation from reusing same object
  return <Bar data={{ ...data }} />;
};

export default BarChart;
