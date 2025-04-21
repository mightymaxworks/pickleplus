/**
 * PKL-278651-ADMIN-0016-SYS-TOOLS - System Tools Navigation Component
 * 
 * This component registers system-related navigation items including Bounce Testing
 * to ensure they appear in both desktop and mobile navigation.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastModified 2025-04-21
 */

import React, { useEffect } from 'react';
import { Activity, Bot, Server } from 'lucide-react';
import { useAdminRegistry } from '../../hooks/useAdminRegistry';
import { NavCategory } from '../../hooks/useAdminComponents';

/**
 * SystemToolsNavItems component that registers system-related navigation items
 * Must match SystemNavRegistration interface
 */
export const SystemToolsNavItems: React.FC = () => {
  const { registerNavItem } = useAdminRegistry();

  useEffect(() => {
    // Register a header for the System Tools section
    registerNavItem({
      label: 'System Tools',
      path: '', // Empty path for headers
      icon: <Server size={18} />,
      group: NavCategory.SYSTEM,
      priority: 10,
      description: 'System administration tools'
    });

    // Register Bounce Testing navigation item
    registerNavItem({
      path: '/admin/bounce',
      label: 'Bounce Testing',
      icon: <Bot size={18} />,
      group: NavCategory.SYSTEM,
      priority: 11,
      description: 'Automated testing system'
    });

    // Register System Activity Monitor
    registerNavItem({
      path: '/admin/system-activity',
      label: 'Activity Monitor',
      icon: <Activity size={18} />,
      group: NavCategory.SYSTEM,
      priority: 12,
      description: 'System activity monitoring'
    });
  }, [registerNavItem]);

  // This component doesn't render anything visible
  return null;
};

export default SystemToolsNavItems;