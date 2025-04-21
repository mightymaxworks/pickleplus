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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Standard Header */}
      <AppHeader
        hideSearch={hideSearch}
        hideNotifications={hideNotifications}
        customNavItems={customNavItems}
        onLogout={onLogout}
        {...headerProps}
      />
      
      {/* Page Title (Optional) */}
      {pageTitle && (
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 mt-16 pt-4 pb-3">
          <div className="container mx-auto px-4 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pageTitle}</h1>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className={`container mx-auto px-4 sm:px-6 py-6 relative z-10 flex-1 ${pageTitle ? '' : 'mt-16'}`}>
        {children}
      </main>
      
      {/* Mobile Navigation */}
      {!hideMobileNav && <MobileNavigation />}
    </div>
  );
}