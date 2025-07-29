/**
 * Coach-Specific Layout Component
 * Provides consistent branding, navigation, and UX for all coach pages
 */

import React, { ReactNode } from 'react';
import { CoachHeader } from './CoachHeader';

interface CoachLayoutProps {
  children: ReactNode;
  currentPage?: string;
  showBranding?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CoachLayout({ 
  children, 
  currentPage,
  showBranding = true,
  maxWidth = '7xl',
  padding = 'lg'
}: CoachLayoutProps) {
  
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '7xl': return 'max-w-7xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-7xl';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'p-2';
      case 'md': return 'p-4';
      case 'lg': return 'p-6';
      default: return 'p-6';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <CoachHeader 
        currentPage={currentPage}
        showBranding={showBranding}
      />
      
      {/* Main Content */}
      <main className={`${getMaxWidthClass()} mx-auto ${getPaddingClass()}`}>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Powered by <span className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Pickle+</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Professional Coaching Platform</span>
              <span>© 2025 Pickle+</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}