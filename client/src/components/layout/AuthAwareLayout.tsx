import React, { ReactNode } from 'react';
import { HeaderNav } from '@/components/layout/HeaderNav';
import { useAuth } from '@/hooks/use-auth';

interface AuthAwareLayoutProps {
  children: ReactNode;
}

/**
 * Layout component that is aware of authentication state
 * and renders appropriate header navigation based on that state
 */
export function AuthAwareLayout({ children }: AuthAwareLayoutProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav
        user={user}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}