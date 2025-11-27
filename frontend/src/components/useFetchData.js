import { useEffect, useState } from "react";

const useFetchData = () => {
  const [data, setData] = useState({
    totalSales: null,
    salesByCategory: null,
    salesByItem: null,
    salesByBrand: null,
    inventoryData: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          totalSalesRes,
          salesByCategoryRes,
          salesByItemRes,
          salesByBrandRes,
          inventoryDataRes,
        ] = await Promise.all([
          fetch("/sales/total"),
          fetch("/sales/category"),
          fetch("/sales/item"),
          fetch("/sales/brand"),
          fetch("/inventory/data"),
        ]);

        const [
          totalSales,
          salesByCategory,
          salesByItem,
          salesByBrand,
          inventoryData,
        ] = await Promise.all([
          totalSalesRes.json(),
          salesByCategoryRes.json(),
          salesByItemRes.json(),
          salesByBrandRes.json(),
          inventoryDataRes.json(),
        ]);

        setData({
          totalSales,
          salesByCategory,
          salesByItem,
          salesByBrand,
          inventoryData,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};

export default useFetchData;
