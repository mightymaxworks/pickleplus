/**
 * PKL-278651-DASH-0011-PASSPORT
 * Player Passport Dashboard Component
 * 
 * Updated to use the PassportDashboard component featuring prominent QR code
 * functionality and Pickle Points integration. Replaces horizontal scrolling
 * with clean, passport-style tabbed layout.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import React from 'react';
import PassportDashboard from '@/components/dashboard/PassportDashboard';

export default function Dashboard() {
  return <PassportDashboard />;
}