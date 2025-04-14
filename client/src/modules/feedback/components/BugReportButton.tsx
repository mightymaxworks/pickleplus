/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Button Component
 * 
 * This component provides a floating action button for users to report bugs.
 */

import React, { useState } from 'react';
import { BugIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { BugReportForm } from './BugReportForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface BugReportButtonProps {
  /**
   * Position the button in a different corner
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /**
   * Add custom class names to the button
   */
  className?: string;
}

/**
 * Get the correct position classes for the button
 */
function getPositionClasses(position: BugReportButtonProps['position']): string {
  switch (position) {
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
    default:
      return 'bottom-4 right-4';
  }
}

export function BugReportButton({ position = 'bottom-right', className = '' }: BugReportButtonProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  
  const positionClasses = getPositionClasses(position);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className={`fixed z-50 shadow-lg hover:shadow-xl transition-all duration-300 ${positionClasses} ${className}`}
          aria-label="Report a bug"
          title="Report a bug"
          onClick={() => setOpen(true)}
        >
          <BugIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <BugReportForm 
          currentPage={location} 
          onSubmitSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}