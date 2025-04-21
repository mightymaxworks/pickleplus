/**
 * PKL-278651-UI-0001-STDLAYOUT-DASH
 * Dashboard Page Component
 * 
 * Updated to use the DashboardContent component with the standard layout system
 * to prevent header duplication and maintain standard layout behavior.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default function Dashboard() {
  return <DashboardContent />;
}