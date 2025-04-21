/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Admin Navigation Item Component
 * 
 * This component registers the Bounce testing system in the admin navigation sidebar.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useEffect } from 'react';
import { Bot } from 'lucide-react';
import { useAdminRegistry } from '../../hooks/useAdminRegistry';

/**
 * Component that registers itself with the admin registry to appear in the admin sidebar
 */
const BounceAdminNavItem: React.FC = () => {
  const { registerNavItem } = useAdminRegistry();

  useEffect(() => {
    // Register this module in the admin navigation
    registerNavItem({
      id: 'bounce',
      label: 'Bounce Testing',
      path: '/admin/bounce',
      icon: <Bot className="h-4 w-4" />,
      group: 'tools',
      description: 'Automated testing system',
      priority: 45, // Position between Bug Reports (50) and Mobile Test (40)
    });

    console.log('[Admin] Bounce testing navigation item registered');
  }, [registerNavItem]);

  // This component doesn't render anything itself
  return null;
};

export default BounceAdminNavItem;