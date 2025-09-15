/**
 * Mobile-first page wrapper component
 * Provides consistent mobile layout with header, content, and optional sticky actions
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface MobilePageProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
  stickyActions?: React.ReactNode;
  className?: string;
}

export const MobilePage: React.FC<MobilePageProps> = ({
  title,
  showBackButton = true,
  onBack,
  children,
  stickyActions,
  className = ''
}) => {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-10 w-10 p-0 min-w-[44px] min-h-[44px]"
              data-testid="mobile-back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>
      </header>

      {/* Page Content */}
      <main className={`flex-1 container mx-auto max-w-screen-sm p-4 sm:p-6 pb-safe ${className}`}>
        <div className="space-y-4">
          {children}
        </div>
      </main>

      {/* Sticky Action Bar */}
      {stickyActions && (
        <div className="sticky bottom-0 z-40 bg-white border-t border-gray-200 p-4 pb-safe">
          <div className="container mx-auto max-w-screen-sm">
            {stickyActions}
          </div>
        </div>
      )}
    </div>
  );
};