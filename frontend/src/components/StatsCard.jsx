// components/StatsCard.jsx
import { Card, CardBody, Typography } from "@material-tailwind/react";

// Props:
// title: string - title of the stat
// value: string | number - value to display
// Icon: React component - icon from @heroicons/react or similar
const StatsCard = ({ title, value, Icon }) => {
  return (
    <Card className="w-full max-w-xs shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
      <CardBody className="flex items-center justify-between p-6">
        {/* Icon Container */}
        <div className="bg-blue-100 text-blue-600 p-4 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>

        {/* Text Content */}
        <div className="text-right">
          <Typography variant="small" className="font-medium text-gray-600">
            {title}
          </Typography>
          <Typography variant="h4" className="font-bold text-gray-900">
            {value}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
};

export default StatsCard;
