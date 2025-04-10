import React, { ReactNode } from 'react';
import { HeaderNav } from '@/components/layout/HeaderNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}