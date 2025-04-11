/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting Page
 * 
 * This page renders the admin reporting dashboard
 */

import { AdminLayout } from "@/modules/admin/components/AdminLayout";
import { ReportsDashboard } from "@/modules/admin/components/reporting";
//import { Helmet } from "react-helmet";

export default function ReportingPage() {
  return (
    <AdminLayout>
      <ReportsDashboard />
    </AdminLayout>
  );
}