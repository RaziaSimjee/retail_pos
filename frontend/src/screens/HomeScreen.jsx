import {
  UserGroupIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  TruckIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";
import StatsCard from "../components/StatsCard";
import RevenueChart from "../components/RevenueChart";
import SalesTable from "../components/SalesTable";
import POSBarChart from "../components/POSBarChart";

const HomeScreen = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Categories" value="1,240" Icon={CubeIcon} />
        <StatsCard title="Total Brands" value="530" Icon={ShoppingCartIcon} />
        <StatsCard title="Total Products" value="600" Icon={IdentificationIcon} />
        <StatsCard title="Total Customers" value="2,350" Icon={UsersIcon} />
        <StatsCard title="Total Suppliers" value="120" Icon={TruckIcon} />
        <StatsCard title="Total Users" value="75" Icon={UserGroupIcon} />
      </div>

      {/* Revenue Chart & Sales Tables Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Revenue Chart */}
        <div className="w-full">
          <RevenueChart />
          <POSBarChart/>
        </div>

        {/* Right: Sales Tables */}
        <div className="flex flex-col gap-6">
          <SalesTable title="Most Sold Products" />
          <SalesTable title="Least Sold Products" />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
