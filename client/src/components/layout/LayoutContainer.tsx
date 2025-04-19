/**
 * PKL-278651-COMM-0028-NOTIF - Layout Container Component
 * Implementation timestamp: 2025-04-19 15:30 ET
 * 
 * Layout wrapper component for consistent page layouts
 * 
 * Framework 5.2 compliant implementation
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function LayoutContainer({ 
  children, 
  maxWidth = 'xl', 
  className, 
  ...props 
}: LayoutContainerProps) {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-screen-sm';
      case 'md': return 'max-w-screen-md';
      case 'lg': return 'max-w-screen-lg';
      case 'xl': return 'max-w-screen-xl';
      case '2xl': return 'max-w-screen-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-screen-xl';
    }
  };
  
  return (
    <div 
      className={cn(
        'container mx-auto px-4 sm:px-6 py-6',
        getMaxWidthClass(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}