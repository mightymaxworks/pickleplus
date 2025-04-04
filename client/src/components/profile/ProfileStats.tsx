import { User } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ProfileStatsProps {
  user: User;
}

const ProfileStats = ({ user }: ProfileStatsProps) => {
  // Win/Loss data for pie chart
  const winLossData = [
    { name: "Wins", value: user.wins },
    { name: "Losses", value: user.losses },
  ];
  
  const COLORS = ["#4CAF50", "#F44336"];
  
  // Mock data for recent performance (in a real app, this would come from the API)
  const performanceData = [
    { month: "Jan", wins: 5, losses: 2 },
    { month: "Feb", wins: 3, losses: 4 },
    { month: "Mar", wins: 7, losses: 1 },
    { month: "Apr", wins: 2, losses: 3 },
    { month: "May", wins: 6, losses: 2 },
    { month: "Jun", wins: 4, losses: 4 },
  ];
  
  const winPercentage = user.totalMatches > 0 
    ? Math.round((user.wins / user.totalMatches) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Win/Loss Ratio</h3>
          
          <div className="flex flex-col items-center">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Matches']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{winPercentage}%</div>
              <div className="text-gray-500">Win Percentage</div>
            </div>
            
            <div className="mt-4 flex justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{user.wins}</div>
                <div className="text-gray-500">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{user.losses}</div>
                <div className="text-gray-500">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.totalMatches}</div>
                <div className="text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Performance Over Time</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wins" name="Wins" fill="#4CAF50" />
                <Bar dataKey="losses" name="Losses" fill="#F44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
