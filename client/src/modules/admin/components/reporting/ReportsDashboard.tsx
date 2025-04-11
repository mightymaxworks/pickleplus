/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reports Dashboard
 * 
 * This component renders the main reports dashboard for the admin interface
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCategory, ReportTimePeriod } from "@shared/schema/admin/reports";
import { ReportFilter } from "./ReportFilter";
import { UserReports } from "./UserReports";
import { MatchReports } from "./MatchReports";
import { EngagementReports } from "./EngagementReports";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResponsiveReportsDashboard } from "../responsive/ResponsiveReportsDashboard";
import { useIsSmallScreen } from "../../utils/deviceDetection";

export function ReportsDashboard() {
  const [activeCategory, setActiveCategory] = useState<string>(ReportCategory.USER);
  const [timePeriod, setTimePeriod] = useState<ReportTimePeriod>(ReportTimePeriod.MONTH);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use the standardized device detection utility from our framework
  const isSmallScreen = useIsSmallScreen();
  
  // Use responsive component for mobile and tablet views
  if (isSmallScreen) {
    return <ResponsiveReportsDashboard />;
  }

  const handleFilterChange = (timePeriod: ReportTimePeriod) => {
    setTimePeriod(timePeriod);
    toast({
      title: "Filter Updated",
      description: `Time period set to ${timePeriod}`,
    });
  };

  const handleError = (message: string) => {
    setError(message);
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  };

  const clearError = () => setError(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <ReportFilter onFilterChange={handleFilterChange} timePeriod={timePeriod} />
      
      <Tabs defaultValue={ReportCategory.USER} value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
        <TabsList>
          <TabsTrigger value={ReportCategory.USER}>User Reports</TabsTrigger>
          <TabsTrigger value={ReportCategory.MATCH}>Match Reports</TabsTrigger>
          <TabsTrigger value={ReportCategory.ENGAGEMENT}>Engagement</TabsTrigger>
          <TabsTrigger value={ReportCategory.SYSTEM}>System</TabsTrigger>
        </TabsList>
        
        <TabsContent value={ReportCategory.USER} className="space-y-4">
          <UserReports timePeriod={timePeriod} onError={handleError} />
        </TabsContent>
        
        <TabsContent value={ReportCategory.MATCH} className="space-y-4">
          <MatchReports timePeriod={timePeriod} onError={handleError} />
        </TabsContent>
        
        <TabsContent value={ReportCategory.ENGAGEMENT} className="space-y-4">
          <EngagementReports timePeriod={timePeriod} onError={handleError} />
        </TabsContent>
        
        <TabsContent value={ReportCategory.SYSTEM} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                System monitoring and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                System performance metrics are coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}