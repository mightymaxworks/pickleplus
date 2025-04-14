/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Button Component
 * 
 * This floating action button provides quick access to the bug reporting form
 * from anywhere in the application.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BugIcon } from 'lucide-react';
import { BugReportForm } from './BugReportForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/**
 * A floating action button that opens the bug reporting form
 */
export const BugReportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="bug-report-button">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-red-500 hover:bg-red-600"
            aria-label="Report a bug"
          >
            <BugIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Report a Bug</SheetTitle>
          </SheetHeader>
          <BugReportForm onSuccess={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BugReportButton;