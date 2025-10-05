import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  useGetTotalSalesQuery,
  useGetTotalSalesByCustomerQuery,
  useGetTotalSalesByEmployeeQuery,
  useGetTotalSalesByMonthQuery,
  useGetTotalSalesByYearRangeQuery,
  useGetSalesCountQuery,
  useGetCustomerSalesCountQuery,
  useGetEmployeeSalesCountQuery,
  useGetProductSalesCountQuery,
  useExportSalesQuery
} from "../slices/saleApiSlice.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const role = userInfo?.user?.role?.toLowerCase();

  // Fetch data
  const { data: totalSalesData } = useGetTotalSalesQuery();
  const { data: salesCountData } = useGetSalesCountQuery();
  const { data: totalByCustomer } = useGetTotalSalesByCustomerQuery(1036);
  const { data: totalByEmployee } = useGetTotalSalesByEmployeeQuery(1);
  const { data: totalByMonth } = useGetTotalSalesByMonthQuery({ year: 2025, month: 10 });
  const { data: totalByYearRange } = useGetTotalSalesByYearRangeQuery({ startYear: 2024, endYear: 2025 });
  const { data: customerSalesCount } = useGetCustomerSalesCountQuery(1036);
  const { data: employeeSalesCount } = useGetEmployeeSalesCountQuery(1);
  const { data: productSalesCount } = useGetProductSalesCountQuery(22);
  const { data: exportData } = useExportSalesQuery({ fromId: 1, toId: 50 });

  // Chart data
  const barChartData = {
    labels: ["Total Sales", "Customer Total", "Employee Total"],
    datasets: [
      {
        label: "Amount",
        data: [
          totalSalesData?.totalSalesAmount || 0,
          totalByCustomer?.totalSalesAmount || 0,
          totalByEmployee?.totalSalesAmount || 0,
        ],
        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
      },
    ],
  };

  const lineChartData = {
    labels: ["2024-2025"], // Simplified example
    datasets: [
      {
        label: "Yearly Total Sales",
        data: [totalByYearRange?.totalSalesAmount || 0],
        borderColor: "#ff6384",
        backgroundColor: "#ff6384",
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: ["Customer 1036", "Employee 1", "Product 22"],
    datasets: [
      {
        label: "Counts",
        data: [
          customerSalesCount?.totalSales || 0,
          employeeSalesCount?.totalSales || 0,
          productSalesCount?.totalSales || 0,
        ],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"],
      },
    ],
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_URL}/saleService/sales/export/1/50`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export sales:", error);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {role !== "admin" && <p>Access restricted</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Total Sales Overview</h2>
          <Bar data={barChartData} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Yearly Sales</h2>
          <Line data={lineChartData} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Sales Count Distribution</h2>
          <Pie data={pieChartData} />
        </div>

        <div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
            onClick={handleExport}
          >
            Export Sales to Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
