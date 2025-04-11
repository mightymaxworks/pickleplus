/**
 * PKL-278651-TOURN-0001-BRCKT
 * Layout Container Component
 * 
 * A reusable container with consistent padding and max-width
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LayoutContainerProps = {
  children: ReactNode;
  className?: string;
};

export function LayoutContainer({ children, className }: LayoutContainerProps) {
  return (
    <div className={cn('container px-4 py-8 mx-auto', className)}>
      {children}
    </div>
  );
}