/**
 * Mobile-optimized bottom sheet component
 * Built on shadcn Sheet with mobile-specific behaviors
 */

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MobileBottomSheetProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  className = ''
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent 
        side="bottom" 
        className={cn(
          'h-[85vh] rounded-t-xl border-t-2 p-0',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-gray-200">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <SheetTitle className="text-lg font-semibold text-left">
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription className="text-sm text-gray-500 text-left">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};