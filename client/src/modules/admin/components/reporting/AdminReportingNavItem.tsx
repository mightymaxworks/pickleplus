/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting Nav Item
 * 
 * This component registers the reporting dashboard in the admin navigation
 */

import { AdminNavItem } from "../../types";
import { BarChart3 } from "lucide-react";

export const AdminReportingNavItem: AdminNavItem = {
  label: "Reporting & Analytics",
  icon: <BarChart3 className="h-5 w-5" />,
  path: "/admin/reporting",
  order: 50 // Position in the middle of the navigation
};