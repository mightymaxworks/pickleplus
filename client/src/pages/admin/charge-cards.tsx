import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import ChargeCardAdminDashboard from '@/components/admin/ChargeCardAdminDashboard';

export default function AdminChargeCardsPage() {
  return (
    <StandardLayout pageTitle="Charge Card Management" showBackButton={true}>
      <ChargeCardAdminDashboard />
    </StandardLayout>
  );
}