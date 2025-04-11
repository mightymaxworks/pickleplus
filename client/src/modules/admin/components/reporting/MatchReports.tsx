/**
 * PKL-278651-ADMIN-0010-REPORT
 * Match Reports Component
 * 
 * This component displays match-related reports and metrics
 */

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { CategoryData, ReportTimePeriod } from "@shared/schema/admin/reports";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MatchReportsProps {
  timePeriod: ReportTimePeriod;
  onError: (message: string) => void;
}

export function MatchReports({ timePeriod, onError }: MatchReportsProps) {
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<CategoryData[]>([]);
  
  useEffect(() => {
    async function fetchMatchReports() {
      setLoading(true);
      try {
        const response = await apiRequest<CategoryData[]>(`/api/admin/reports/match?timePeriod=${timePeriod}`, {
          method: 'GET',
        });
        setMatchData(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching match reports:", error);
        onError("Failed to load match reports. Please try again later.");
        setLoading(false);
      }
    }
    
    fetchMatchReports();
  }, [timePeriod, onError]);
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Match Distribution</CardTitle>
          <CardDescription>
            Match activity by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : matchData && matchData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={matchData}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {matchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for the selected time period
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Match Validation Rate</CardTitle>
          <CardDescription>
            Percentage of matches that have been validated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Data coming soon
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Venues</CardTitle>
          <CardDescription>
            Most popular locations for pickleball matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Data coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}