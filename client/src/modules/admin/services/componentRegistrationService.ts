/**
 * PKL-278651-ADMIN-0002-UI
 * Component Registration Service
 *
 * This service registers admin components from various modules
 */

import React from 'react';
import { adminComponentRegistry } from './adminComponentRegistry';
import { 
  AdminPassportNavItem,
  passportVerificationCard, 
  passportVerificationView
} from '../components/passport';
import { AdminMobileTestNavItem } from '../components/mobile-test';
import { AdminUserManagementNavItem } from '../components/user-management';
import { AdminPlayerManagementNavItem } from '../components/user-management/AdminPlayerManagementNavItem'; // PKL-278651-PLAYER-ADMIN-001
import { registerReportingComponents } from './reportingComponentRegistration';
import { registerFeedbackComponents } from './feedbackComponentRegistration';
import BounceAdminNavItem from '../components/bounce/BounceAdminNavItem';
import { SystemToolsNavItems } from '../components/system'; // PKL-278651-ADMIN-0016-SYS-TOOLS
import AdminCoachNavItem from '../components/coach/AdminCoachNavItem'; // PKL-278651-COACH-ADMIN-001
import TrainingCenterAdminNavItem from '../components/training-center/TrainingCenterAdminNavItem'; // PKL-278651-TRAINING-CENTER-ADMIN-001
import { ChargeCardAdminNavItem } from '../components/charge-cards/ChargeCardAdminNavItem'; // PKL-278651-CHARGE-CARD-ADMIN
import { Trophy } from 'lucide-react';
// Import settings module to register its components
import '../components/settings';

/**
 * Register passport verification components
 */
export function registerPassportVerificationComponents() {
  // Register passport verification nav item
  adminComponentRegistry.registerNavItem('passport', AdminPassportNavItem);
  
  // Register passport verification dashboard card
  adminComponentRegistry.registerDashboardCard('passport', passportVerificationCard);
  
  // Register passport verification view
  adminComponentRegistry.registerAdminView('passport', passportVerificationView);
}

/**
 * Register mobile test components
 */
export function registerMobileTestComponents() {
  // Register mobile test nav item
  adminComponentRegistry.registerNavItem('admin', AdminMobileTestNavItem);
}

/**
 * Register user management components
 * PKL-278651-ADMIN-0015-USER
 */
export function registerUserManagementComponents() {
  // Register user management nav item
  adminComponentRegistry.registerNavItem('core', AdminUserManagementNavItem);
  
  console.log('[Admin] User Management components registered');
}



/**
 * Register Bounce testing system components
 * PKL-278651-BOUNCE-0001-CORE
 */
export function registerBounceComponents() {
  // Register Bounce admin nav item
  adminComponentRegistry.registerNavItem('bounce', BounceAdminNavItem);
  
  console.log('[Admin] Bounce testing components registered');
}

/**
 * Register player management components
 * PKL-278651-PLAYER-ADMIN-001
 */
export function registerPlayerManagementComponents() {
  // Register player management nav item
  adminComponentRegistry.registerNavItem('players', AdminPlayerManagementNavItem);
  
  console.log('[Admin] Player management components registered');
}

/**
 * Register coach management components
 * PKL-278651-COACH-ADMIN-001
 */
export function registerCoachComponents() {
  // Register coach applications nav item
  adminComponentRegistry.registerNavItem('coach', AdminCoachNavItem);
  
  console.log('[Admin] Coach management components registered');
}

/**
 * Register training center management components
 * PKL-278651-TRAINING-CENTER-ADMIN-001
 */
export function registerTrainingCenterComponents() {
  // Register training center admin nav item
  adminComponentRegistry.registerNavItem('training-center', TrainingCenterAdminNavItem);
  
  console.log('[Admin] Training center management components registered');
}

/**
 * Register system tools components
 * PKL-278651-ADMIN-0016-SYS-TOOLS
 */
export function registerSystemToolsComponents() {
  try {
    // Use dynamic import for browser compatibility
    import('../components/system/SystemToolsNavItems').then(({ registerSystemItems }) => {
      registerSystemItems();
      console.log('[Admin] System tools components initialized');
    }).catch(error => {
      console.error('[Admin] Error registering system tools components:', error);
    });
  } catch (error) {
    console.error('[Admin] Error registering system tools components:', error);
  }
}

/**
 * Register charge card management components
 * PKL-278651-CHARGE-CARD-ADMIN
 */
export function registerChargeCardComponents() {
  try {
    // Import and register the charge card navigation item
    import('../components/charge-cards/ChargeCardAdminNavItem').then(({ registerChargeCardAdminNav }) => {
      registerChargeCardAdminNav();
      console.log('[Admin] Charge card components registered successfully');
    }).catch(error => {
      console.error('[Admin] Error registering charge card components:', error);
    });
  } catch (error) {
    console.error('[Admin] Error registering charge card components:', error);
  }
}

/**
 * Register match management components
 * Admin system for managing competitions, matches, and ranking points
 */
export function registerMatchManagementComponents() {
  // Register match management nav item
  adminComponentRegistry.registerNavItem('matches', {
    label: 'Match Management',
    path: '/admin/match-management',
    icon: React.createElement(Trophy, { size: 18 }),
    order: 4
  });
  
  console.log('[Admin] Match management components registered');
}

/**
 * Register all admin components
 */
export function registerAllAdminComponents() {
  console.log('[Admin] Registering admin components');
  
  // Register module-specific components
  registerPassportVerificationComponents();
  registerMobileTestComponents();
  registerReportingComponents();
  registerFeedbackComponents();
  registerUserManagementComponents(); // Added User Management
  registerPlayerManagementComponents(); // Added Player Management
  registerBounceComponents(); // Added Bounce Testing System
  registerCoachComponents(); // Added Coach Management
  registerTrainingCenterComponents(); // Added Training Center Management
  registerMatchManagementComponents(); // Added Match Management System
  registerSystemToolsComponents(); // Added System Tools
  // registerChargeCardComponents(); // Hidden for coaching features focus
  
  console.log('[Admin] Admin components registered');
}