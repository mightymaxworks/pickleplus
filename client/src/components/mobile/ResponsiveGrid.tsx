/**
 * Mobile-first responsive grid component
 * Defaults to single column, scales up at breakpoints
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  colsSm?: number;
  colsMd?: number;
  colsLg?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  colsSm = 1,
  colsMd = 2,
  colsLg = 3,
  gap = 'md',
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  const smCols = gridCols[colsSm as keyof typeof gridCols] || 'grid-cols-1';
  const mdCols = gridCols[colsMd as keyof typeof gridCols] || 'sm:grid-cols-2';
  const lgCols = gridCols[colsLg as keyof typeof gridCols] || 'md:grid-cols-3';

  return (
    <div className={cn(
      'grid',
      smCols,
      `sm:${mdCols.replace('sm:', '')}`,
      `md:${lgCols.replace('md:', '')}`,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};