/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Admin Mobile Test Nav Item
 * 
 * This component registers the mobile test page in the admin navigation.
 */

import { Smartphone } from 'lucide-react';
import { AdminNavItem } from '../../types';

export const AdminMobileTestNavItem: AdminNavItem = {
  label: "Mobile Test",
  path: "/admin/mobile-test",
  icon: <Smartphone className="h-5 w-5" />,
  order: 80
};