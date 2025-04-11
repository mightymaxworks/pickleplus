/**
 * PKL-278651-ADMIN-0002-UI
 * Admin Passport Nav Item
 * 
 * This component provides a navigation item for the passport verification dashboard
 */

import React from 'react';
import { QrCode } from 'lucide-react';
import { AdminNavItem } from '../../types';

export const AdminPassportNavItem: AdminNavItem = {
  label: 'Passport Verification',
  path: '/admin/passport-verification',
  icon: <QrCode className="h-5 w-5" />,
  order: 20, // Place after dashboard but before other items
  permission: 'admin'
};

export default AdminPassportNavItem;