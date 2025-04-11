/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting Dashboard Card
 * 
 * This component displays a summary of reporting capabilities on the admin dashboard
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminDashboardCard } from "../../types";
import { BarChart3, ArrowRight } from "lucide-react";
import { Link } from "wouter";

// Component to render the dashboard card
const ReportingDashboardCard = () => (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center text-lg">
          <BarChart3 className="h-5 w-5 mr-2" />
          Analytics Dashboard
        </CardTitle>
        <CardDescription>
          Access user, match and engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">3</span>
            <span className="text-xs text-muted-foreground">Report Categories</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">10+</span>
            <span className="text-xs text-muted-foreground">Data Visualizations</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 px-6 py-4 flex justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/reporting">
            View Reports
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

// Export the dashboard card in the correct format for registration
export const AdminReportingDashboardCard: AdminDashboardCard = {
  id: "reporting-dashboard",
  component: ReportingDashboardCard,
  width: 'third',
  height: 'medium',
  order: 30
};