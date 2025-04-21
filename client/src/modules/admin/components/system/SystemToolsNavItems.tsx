/**
 * PKL-278651-ADMIN-0016-SYS-TOOLS
 * System Tools Navigation Items Component
 * 
 * This component registers system tools in the admin navigation sidebar
 * to ensure they appear in the mobile navigation.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useEffect } from 'react';
import { Bot, Settings } from 'lucide-react';
import { adminComponentRegistry } from '../../services/adminComponentRegistry';

/**
 * Component that directly registers system tools in the admin navigation
 */
const SystemToolsNavItems: React.FC = () => {
  useEffect(() => {
    // Directly register Bounce in the admin navigation
    // This ensures it appears in both desktop and mobile navigation
    adminComponentRegistry.registerNavItemDirect({
      id: 'bounce-direct',
      label: 'Bounce Testing',
      path: '/admin/bounce',
      icon: <Bot className="h-4 w-4" />,
      group: 'system',
      description: 'Automated testing system',
      priority: 15,
    });

    console.log('[Admin] System tools navigation items registered directly');
  }, []);

  // This component doesn't render anything itself
  return null;
};

export default SystemToolsNavItems;