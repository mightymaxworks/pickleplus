/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting Quick Action
 * 
 * This component provides a quick action for generating reports
 */

import { useToast } from "@/hooks/use-toast";
import { AdminQuickAction } from "../../types";
import { BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

// Quick action handler function
const handleGenerateReport = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  setLocation("/admin/reporting");
  
  toast({
    title: "Reports Dashboard",
    description: "Opening reports dashboard...",
  });
};

// Export in correct format for registration
export const AdminReportingQuickAction: AdminQuickAction = {
  id: "generate-report",
  label: "Generate Report",
  description: "Create a new data report",
  icon: <BarChart3 className="h-5 w-5" />,
  onClick: handleGenerateReport,
  order: 20
};