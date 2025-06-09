/**
 * PKL-278651-TRAINING-CENTER-ADMIN-001 - Training Center Admin Navigation
 * Navigation item for training center administration
 */

import React from 'react';
import { Building2 } from 'lucide-react';
import { AdminNavItem } from '../../types';

export const TrainingCenterAdminNavItem: AdminNavItem = {
  label: 'Training Centers',
  path: '/admin/training-centers',
  icon: React.createElement(Building2, { size: 18 }),
  order: 50
};

export default TrainingCenterAdminNavItem;