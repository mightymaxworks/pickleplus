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
import { BugReportForm } from './BugReportForm';
import { BugReportButtonProps } from '../types';

/**
 * Bug report floating action button component
 */
export function BugReportButton({ position = 'bottom-right' }: BugReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  // Define position classes based on the position prop
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={`fixed ${positionClasses[position]} z-50 rounded-full h-12 w-12 shadow-lg`}
          aria-label="Report a bug"
        >
          <AlertTriangle className="h-5 w-5" />
        </Button>
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