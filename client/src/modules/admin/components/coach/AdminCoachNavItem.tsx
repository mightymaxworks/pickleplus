/**
 * PKL-278651-COACH-ADMIN-001 - Admin Coach Navigation Item
 * Navigation component for coach management in admin dashboard
 */

import { useEffect } from 'react';
import { adminModule } from '../../index';
import { AdminNavItem } from '../../types';

export function AdminCoachNavItem() {
  useEffect(() => {
    const navItem: AdminNavItem = {
      label: 'Coach Applications',
      path: '/admin/coach-applications',
      icon: 'Users',
      order: 50,
      metadata: {
        category: 'user-management',
        description: 'Review and manage coach applications'
      }
    };

    // Register the navigation item
    (adminModule.exports as any).registerNavItem(navItem);
    console.log('[Admin] Coach Applications nav item registered');
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null; // This component doesn't render anything
}

export default AdminCoachNavItem;