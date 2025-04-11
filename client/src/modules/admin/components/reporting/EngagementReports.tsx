/**
 * PKL-278651-ADMIN-0010-REPORT
 * Engagement Reports Component
 * 
 * This component displays user engagement-related reports and metrics
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
import { ComparisonData, ReportTimePeriod } from "@shared/schema/admin/reports";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from "recharts";

interface EngagementReportsProps {
  timePeriod: ReportTimePeriod;
  onError: (message: string) => void;
}

export function EngagementReports({ timePeriod, onError }: EngagementReportsProps) {
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState<ComparisonData[]>([]);
  
  useEffect(() => {
    async function fetchEngagementReports() {
      setLoading(true);
      try {
        const response = await apiRequest(`/api/admin/reports/engagement?timePeriod=${timePeriod}`);
        setEngagementData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching engagement reports:", error);
        onError("Failed to load engagement reports. Please try again later.");
        setLoading(false);
      }
    }
    
    fetchEngagementReports();
  }, [timePeriod, onError]);
  
  const getBarColor = (change: number) => (change >= 0 ? "#4CAF50" : "#F44336");
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Engagement Metrics Comparison</CardTitle>
          <CardDescription>
            Current vs. previous period metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : engagementData && engagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={engagementData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === "current" ? "Current" : "Previous"
                  ]}
                />
                <Legend />
                <Bar dataKey="current" name="Current" fill="#2196F3">
                  <LabelList dataKey="percentChange" position="top" formatter={(value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`} />
                </Bar>
                <Bar dataKey="previous" name="Previous" fill="#9E9E9E" />
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
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>
            Most used features and functionality
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
          <CardTitle>Retention Metrics</CardTitle>
          <CardDescription>
            User retention over time
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