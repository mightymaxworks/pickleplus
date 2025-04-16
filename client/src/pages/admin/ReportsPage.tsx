/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reports Page
 * 
 * This page displays the admin reporting dashboard
 * Note: AdminLayout is provided by AdminProtectedRoute, so we don't need to wrap it here
 */

import { ReportsDashboard } from "@/modules/admin/components/reporting/ReportsDashboard";

export default function ReportsPage() {
  return <ReportsDashboard />;
}