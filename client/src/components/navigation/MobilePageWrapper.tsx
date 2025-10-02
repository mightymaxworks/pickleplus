import { ReactNode } from 'react';
import { isMobileDevice } from '@/lib/mobile-utils';
import { cn } from '@/lib/utils';

interface MobilePageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function MobilePageWrapper({ children, className }: MobilePageWrapperProps) {
  const hasMobileNav = isMobileDevice();
  
  return (
    <div 
      className={cn(
        "min-h-screen",
        hasMobileNav && "pb-20",
        className
      )}
    >
      {children}
    </div>
  );
}
