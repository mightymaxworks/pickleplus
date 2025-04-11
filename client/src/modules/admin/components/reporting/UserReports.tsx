/**
 * PKL-278651-ADMIN-0010-REPORT
 * User Reports Component
 * 
 * This component displays user-related reports and metrics
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
import { TimeSeriesData, ReportTimePeriod } from "@shared/schema/admin/reports";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

interface UserReportsProps {
  timePeriod: ReportTimePeriod;
  onError: (message: string) => void;
}

export function UserReports({ timePeriod, onError }: UserReportsProps) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<TimeSeriesData[]>([]);
  
  useEffect(() => {
    async function fetchUserReports() {
      setLoading(true);
      try {
        const response = await apiRequest(`/api/admin/reports/user?timePeriod=${timePeriod}`);
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user reports:", error);
        onError("Failed to load user reports. Please try again later.");
        setLoading(false);
      }
    }
    
    fetchUserReports();
  }, [timePeriod, onError]);
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>
            New user registrations over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : userData && userData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="New Users" fill="#FF5722" />
              </BarChart>
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
          <CardTitle>Demographic Breakdown</CardTitle>
          <CardDescription>
            User distribution by age group and region
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
          <CardTitle>Skill Level Distribution</CardTitle>
          <CardDescription>
            User distribution by skill level
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