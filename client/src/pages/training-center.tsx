/**
 * PKL-278651-TRAINING-CENTER-001 - Training Center Management Page
 * Main entry point for the training center check-in system
 */

import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import PremiumTrainingCenterCheckIn from '@/components/training-center/PremiumTrainingCenterCheckIn';

export default function TrainingCenterPage() {
  return (
    <StandardLayout>
      <PremiumTrainingCenterCheckIn />
    </StandardLayout>
  );
}