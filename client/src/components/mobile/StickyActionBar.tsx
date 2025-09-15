/**
 * Sticky action bar for primary CTAs on mobile
 * Ensures critical actions are always accessible
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  className?: string;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  primaryAction,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={cn('flex gap-3', className)}>
      {secondaryAction && (
        <Button
          variant="outline"
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
          className="flex-1 h-12 min-h-[44px] text-base font-medium"
          data-testid="sticky-secondary-action"
        >
          {secondaryAction.label}
        </Button>
      )}
      <Button
        variant={primaryAction.variant || 'default'}
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled || primaryAction.loading}
        className={cn(
          'h-12 min-h-[44px] text-base font-medium',
          secondaryAction ? 'flex-1' : 'w-full'
        )}
        data-testid="sticky-primary-action"
      >
        {primaryAction.loading ? 'Loading...' : primaryAction.label}
      </Button>
    </div>
  );
};