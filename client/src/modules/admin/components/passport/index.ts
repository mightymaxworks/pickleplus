/**
 * PKL-278651-ADMIN-0002-UI
 * Passport Verification Module
 * 
 * This module integrates passport verification features into the admin dashboard.
 */

import { AdminDashboardCard, AdminViewComponent } from '../../types';
import { PassportVerificationCard } from './PassportVerificationCard';
import { AdminPassportNavItem } from './AdminPassportNavItem';
import PassportVerificationDashboard from '@/components/admin/PassportVerificationDashboard';

// Export passport verification dashboard card for registration
export const passportVerificationCard: AdminDashboardCard = {
  id: 'passport-verification-card',
  component: PassportVerificationCard,
  width: 'third',
  height: 'medium',
  order: 20,
  permission: 'admin'
};

// Export passport verification dashboard view for registration
export const passportVerificationView: AdminViewComponent = {
  id: 'passport-verification-view',
  path: '/admin/passport-verification',
  component: PassportVerificationDashboard,
  permission: 'admin'
};

// Export all passport verification components
export {
  PassportVerificationCard,
  AdminPassportNavItem,
  PassportVerificationDashboard
};