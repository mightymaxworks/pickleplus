import React, { ReactNode } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}