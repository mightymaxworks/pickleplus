/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reports Page
 * 
 * This page displays the admin reporting dashboard
 */

import { ReportsDashboard } from "@/modules/admin/components/reporting/ReportsDashboard";
import { AdminLayout } from "@/modules/admin/components/AdminLayout";

export default function ReportsPage() {
  return (
    <AdminLayout>
      <ReportsDashboard />
    </AdminLayout>
  );
}