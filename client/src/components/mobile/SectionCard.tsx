/**
 * Simplified section card with standardized mobile-first spacing
 * Reduces nesting compared to Card → CardContent pattern
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  actions?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  padding = 'md',
  actions
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 shadow-sm',
      paddingClasses[padding],
      className
    )}>
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            {title && <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>}
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1 break-words">{subtitle}</p>}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};