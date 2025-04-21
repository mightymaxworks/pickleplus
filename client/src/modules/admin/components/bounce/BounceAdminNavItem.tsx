/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Admin Navigation Item Component
 * 
 * This component registers the Bounce testing system in the admin navigation.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useEffect } from 'react';
import { useAdminNavRegistry } from '@/modules/admin/hooks/useAdminRegistry';
import { BoxSelect } from 'lucide-react';

export function BounceAdminNavItem() {
  const { registerNavItem } = useAdminNavRegistry();
  
  useEffect(() => {
    console.log('[Bounce] Registering Bounce admin navigation item');
    
    // Register the Bounce nav item with the admin registry
    registerNavItem({
      label: 'Bounce Testing',
      path: '/admin/bounce',
      icon: <BoxSelect className="h-5 w-5" />,
      priority: 500, // Position in the navigation
    });
    
    console.log('[Bounce] Admin navigation item registered');
    
    // No cleanup needed; the registry handles nav item removal
  }, [registerNavItem]);
  
  // This component doesn't render anything directly
  return null;
}

export default BounceAdminNavItem;