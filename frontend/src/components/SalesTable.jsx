// src/components/SalesTable.jsx
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

const SalesTable = ({ title }) => {
  // Fake data generated inside the component
  const mostSoldProducts = [
    { name: "Product A", category: "Category 1", sold: 250, image: null },
    { name: "Product B", category: "Category 2", sold: 220, image: null },
    { name: "Product C", category: "Category 3", sold: 200, image: null },
  ];

  const leastSoldProducts = [
    { name: "Product X", category: "Category 1", sold: 5, image: null },
    { name: "Product Y", category: "Category 2", sold: 8, image: null },
    { name: "Product Z", category: "Category 3", sold: 10, image: null },
  ];

  // Determine which data to use based on title
  const products =
    title === "Most Sold Products" ? mostSoldProducts : leastSoldProducts;

  return (
    <Card className="w-full shadow-lg rounded-2xl">
      <CardBody>
        <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
          {title}
        </Typography>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sold Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 flex items-center space-x-2">
                    {product.image && (
                      <Avatar
                        src={product.image}
                        size="sm"
                        alt={product.name}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-gray-700 font-medium">{product.name}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{product.category}</td>
                  <td className="px-4 py-2 text-gray-700 font-semibold">{product.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default SalesTable;
