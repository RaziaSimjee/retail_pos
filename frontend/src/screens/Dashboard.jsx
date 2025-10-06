import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import { 
  useGetTotalSalesQuery,
  useGetTotalSalesByCustomerQuery,
  useGetTotalSalesByEmployeeQuery,
  useGetTotalSalesByYearRangeQuery,
  useGetCustomerSalesCountQuery,
  useGetEmployeeSalesCountQuery,
  useGetProductSalesCountQuery
} from "../slices/saleApiSlice";

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const role = userInfo?.user?.role?.toLowerCase();

  // Fetch API data
  const { data: totalSalesData } = useGetTotalSalesQuery();
  const { data: totalByCustomer } = useGetTotalSalesByCustomerQuery(1036);
  const { data: totalByEmployee } = useGetTotalSalesByEmployeeQuery(1);
  const { data: totalByYearRange } = useGetTotalSalesByYearRangeQuery({ startYear: 2024, endYear: 2025 });
  const { data: customerSalesCount } = useGetCustomerSalesCountQuery(1036);
  const { data: employeeSalesCount } = useGetEmployeeSalesCountQuery(1);
  const { data: productSalesCount } = useGetProductSalesCountQuery(22);

  // Memoize chart data to prevent re-renders from reusing the same object
  const barChartData = useMemo(() => ({
    labels: ["Total Sales", "Customer Total", "Employee Total"],
    datasets: [
      {
        label: "Sales Amount",
        data: [
          totalSalesData?.totalSalesAmount || 0,
          totalByCustomer?.totalSalesAmount || 0,
          totalByEmployee?.totalSalesAmount || 0
        ],
        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"]
      }
    ]
  }), [totalSalesData, totalByCustomer, totalByEmployee]);

  const lineChartData = useMemo(() => ({
    labels: ["2024-2025"],
    datasets: [
      {
        label: "Yearly Total Sales",
        data: [totalByYearRange?.totalSalesAmount || 0],
        borderColor: "#ff6384",
        backgroundColor: "#ff6384",
        tension: 0.4
      }
    ]
  }), [totalByYearRange]);

  const pieChartData = useMemo(() => ({
    labels: ["Customer 1036", "Employee 1", "Product 22"],
    datasets: [
      {
        label: "Sales Count",
        data: [
          customerSalesCount?.totalSales || 0,
          employeeSalesCount?.totalSales || 0,
          productSalesCount?.totalSales || 0
        ],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"]
      }
    ]
  }), [customerSalesCount, employeeSalesCount, productSalesCount]);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {role !== "admin" && <p>Access restricted</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart data={barChartData} />
        <LineChart data={lineChartData} />
        <PieChart data={pieChartData} />
      </div>
    </div>
  );
};

export default Dashboard;
