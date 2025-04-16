/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting Page
 * 
 * This page renders the admin reporting dashboard
 * Note: AdminLayout is provided by AdminProtectedRoute, so we don't need to wrap it here
 */

import { ReportsDashboard } from "@/modules/admin/components/reporting";

export default function ReportingPage() {
  return <ReportsDashboard />;
}