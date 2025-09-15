/**
 * Mobile-optimized data list item component
 * Replaces table rows with touch-friendly card format
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  value?: string | number;
  badge?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  onClick?: () => void;
  className?: string;
}

export const DataListItem: React.FC<DataListItemProps> = ({
  icon,
  title,
  subtitle,
  meta,
  value,
  badge,
  action,
  onClick,
  className = ''
}) => {
  const isClickable = onClick || action;

  const content = (
    <div className={cn(
      'flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200',
      isClickable && 'active:bg-gray-50 transition-colors',
      className
    )}>
      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0 text-gray-400">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1 break-words">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Value/Meta */}
          <div className="flex-shrink-0 text-right">
            {value && (
              <p className="text-sm font-medium text-gray-900">
                {value}
              </p>
            )}
            {meta && (
              <p className="text-xs text-gray-500 mt-1">
                {meta}
              </p>
            )}
            {badge && (
              <div className="mt-1">
                {badge}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action or Chevron */}
      {action ? (
        <Button
          variant={action.variant || 'outline'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          className="ml-2 min-h-[36px] min-w-[60px]"
        >
          {action.label}
        </Button>
      ) : onClick ? (
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      ) : null}
    </div>
  );

  if (onClick && !action) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        data-testid="data-list-item-button"
      >
        {content}
      </button>
    );
  }

  return content;
};