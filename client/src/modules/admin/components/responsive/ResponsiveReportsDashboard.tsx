/**
 * PKL-278651-ADMIN-0010-REPORT
 * Responsive Reports Dashboard
 * 
 * This component provides a mobile-optimized version of the reports dashboard
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, ChevronDown, RefreshCw, Filter, Users, Activity, BarChart } from "lucide-react";
import { ReportCategory, ReportTimePeriod } from "@shared/schema/admin/reports";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserReports } from "../reporting/UserReports";
import { MatchReports } from "../reporting/MatchReports";
import { EngagementReports } from "../reporting/EngagementReports";

export function ResponsiveReportsDashboard() {
  const [activeCategory, setActiveCategory] = useState<string>(ReportCategory.USER);
  const [timePeriod, setTimePeriod] = useState<ReportTimePeriod>(ReportTimePeriod.MONTH);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value as ReportTimePeriod);
    toast({
      title: "Filter Updated",
      description: `Time period set to ${value}`,
    });
  };

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
  };

  const handleError = (message: string) => {
    setError(message);
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case ReportCategory.USER:
        return <Users className="w-4 h-4 mr-2" />;
      case ReportCategory.MATCH:
        return <Activity className="w-4 h-4 mr-2" />;
      case ReportCategory.ENGAGEMENT:
        return <BarChart className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-sm text-muted-foreground">Mobile-optimized view</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <Select value={activeCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ReportCategory.USER}>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                User Reports
              </div>
            </SelectItem>
            <SelectItem value={ReportCategory.MATCH}>
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Match Reports
              </div>
            </SelectItem>
            <SelectItem value={ReportCategory.ENGAGEMENT}>
              <div className="flex items-center">
                <BarChart className="w-4 h-4 mr-2" />
                Engagement
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Time Period</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ReportTimePeriod.DAY}>Day</SelectItem>
              <SelectItem value={ReportTimePeriod.WEEK}>Week</SelectItem>
              <SelectItem value={ReportTimePeriod.MONTH}>Month</SelectItem>
              <SelectItem value={ReportTimePeriod.QUARTER}>Quarter</SelectItem>
              <SelectItem value={ReportTimePeriod.YEAR}>Year</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div>
        {activeCategory === ReportCategory.USER && (
          <UserReports timePeriod={timePeriod} onError={handleError} />
        )}
        
        {activeCategory === ReportCategory.MATCH && (
          <MatchReports timePeriod={timePeriod} onError={handleError} />
        )}
        
        {activeCategory === ReportCategory.ENGAGEMENT && (
          <EngagementReports timePeriod={timePeriod} onError={handleError} />
        )}
      </div>
    </div>
  );
}