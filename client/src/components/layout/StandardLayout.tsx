/**
 * PKL-278651-UI-0001-STDLAYOUT
 * Standardized Page Layout Component
 * 
 * A reusable layout component that provides consistent structure across the application,
 * including the standard header, main content area, and optional mobile navigation.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { AppHeader } from './AppHeader';
import { MobileNavigation } from './MobileNavigation';

export interface StandardLayoutProps {
  children?: React.ReactNode;
  hideSearch?: boolean;
  hideNotifications?: boolean;
  customNavItems?: Array<{
    label: string;
    icon: React.ReactNode;
    path: string;
  }>;
  hideMobileNav?: boolean;
  onLogout?: () => void;
  pageTitle?: string;
  headerProps?: Record<string, any>;
}

export function StandardLayout({
  children,
  hideSearch = false,
  hideNotifications = false,
  customNavItems,
  hideMobileNav = false,
  onLogout,
  pageTitle,
  headerProps = {}
}: StandardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 mt-[-41px] mb-[-41px]">
      {/* Standard Header */}
      <AppHeader
        hideSearch={hideSearch}
        hideNotifications={hideNotifications}
        customNavItems={customNavItems}
        onLogout={onLogout}
        {...headerProps}
      />
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 pt-0 pb-2 md:pb-2 pb-20 relative z-10 flex-1 mt-16">
        {children}
      </main>
      {/* Mobile Navigation */}
      {!hideMobileNav && <MobileNavigation />}
    </div>
  );
}