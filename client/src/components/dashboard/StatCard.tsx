import { StatItem } from "@/lib/types";

interface StatCardProps {
  stat: StatItem;
}

const StatCard = ({ stat }: StatCardProps) => {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-gray-500 text-sm">{stat.title}</div>
          <div className="text-gray-900 text-2xl font-bold mt-1">{stat.value}</div>
          {stat.change && (
            <div className="flex items-center mt-1 text-accent text-sm">
              <i className="fas fa-arrow-up mr-1"></i>
              <span>{stat.change}</span>
            </div>
          )}
        </div>
        <div className={`h-10 w-10 rounded-full ${stat.iconBgClass} flex items-center justify-center`}>
          <i className={stat.icon}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
