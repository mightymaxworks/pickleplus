/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Button Component
 * 
 * This component provides a floating action button that opens the bug report form.
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { BugReportForm } from './BugReportForm';
import { BugReportButtonProps } from '../types';

/**
 * Bug report floating action button component
 */
export function BugReportButton({ position = 'bottom-right' }: BugReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  // Define position classes based on the position prop
  // Adjusting placement to avoid conflicts with other floating buttons
  const positionClasses = {
    'bottom-right': 'bottom-24 right-4', // Moved up to avoid conflicts
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-24 right-4', // Moved down to avoid header elements
    'top-left': 'top-24 left-4'  // Moved down to avoid header elements
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className={`fixed ${positionClasses[position]} z-50 rounded-full h-12 w-12 shadow-lg flex items-center justify-center bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-700`}
                aria-label="Report a bug"
              >
                <AlertTriangle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Report a bug</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <BugReportForm 
          currentPage={location}
          onSubmitSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}