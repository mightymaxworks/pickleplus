/**
 * PKL-278651-ADMIN-0011-DASH
 * Responsive Dashboard Wrapper Component
 * 
 * This component selects the appropriate dashboard view based on screen size.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React from "react";
import { AdminDashboard } from "./AdminDashboard";
import ResponsiveAdminDashboard from "../responsive/ResponsiveAdminDashboard";
import { useIsSmallScreen } from "../../utils/deviceDetection";

export function ResponsiveDashboardWrapper() {
  // Detect small screens (mobile and tablet)
  const isSmallScreen = useIsSmallScreen();
  
  return isSmallScreen ? <ResponsiveAdminDashboard /> : <AdminDashboard />;
}