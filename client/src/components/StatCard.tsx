import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
}

export function StatCard({ title, value, icon, iconColor, badge, badgeColor = "text-[#4CAF50]" }: StatCardProps) {
  return (
    <Card className="pickle-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{title}</span>
          <span className={`material-icons ${iconColor} text-xl`}>{icon}</span>
        </div>
        <div className="flex items-end">
          <span className="text-2xl font-bold">{value}</span>
          {badge && <span className={`text-sm ml-2 ${badgeColor}`}>{badge}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
