/**
 * PKL-278651-CHARGE-CARD-ADMIN - Charge Card Admin Navigation Item
 * 
 * This component registers the charge card management navigation item
 * to ensure it appears in both desktop and mobile navigation.
 * 
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-07-14
 */

import React, { useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { adminComponentRegistry } from '../../services/adminComponentRegistry';

/**
 * Register the charge card admin navigation item directly
 */
export function registerChargeCardAdminNav(): void {
  console.log('[Admin] Registering Charge Card Admin navigation item');
  
  const chargeCardNavItem = {
    id: 'charge-card-admin',
    label: 'Charge Cards',
    path: '/admin/charge-cards',
    icon: React.createElement(CreditCard, { size: 18 }),
    group: 'financial',
    priority: 15,
    description: 'Manage offline payments and credit allocations'
  };
  
  adminComponentRegistry.registerNavItemDirect(chargeCardNavItem);
  
  console.log('[Admin] Charge Card Admin navigation item registered successfully');
}

/**
 * ChargeCardAdminNavItem component that registers charge card navigation
 */
export const ChargeCardAdminNavItem: React.FC = () => {
  useEffect(() => {
    registerChargeCardAdminNav();
  }, []);

  // This component doesn't render anything visible
  return null;
};

// Note: Registration is handled by the component registration service