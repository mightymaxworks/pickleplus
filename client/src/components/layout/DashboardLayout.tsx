import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { MobileNavigation } from './MobileNavigation';
import { User } from '@shared/schema';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#FF5722] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If no user, we shouldn't get here due to ProtectedRoute
  if (!user) {
    return null;
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          
          <div className="flex items-center">
            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-sm font-medium text-white">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">
                {user.displayName || user.username}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation user={user} />
    </div>
  );
}